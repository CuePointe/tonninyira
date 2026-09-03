import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(value: string) {
  return value.replace(/[\s-]/g, '').trim();
}

async function getRateState(identifier: string) {
  const key = await sha256(identifier);
  const { data } = await admin.from('auth_rate_limits').select('*').eq('identifier_hash', key).eq('scope', 'vendor_login').maybeSingle();
  return { key, row: data };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = await req.json();
    const phone = normalizePhone(String(body.phone || ''));
    const pin = String(body.pin || '').trim();
    if (!/^\d+$/.test(phone) || !/^\d{4}$/.test(pin)) return json(400, { error: 'Invalid phone or PIN.' });

    const identifier = `${phone}|${req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'}`;
    const { key, row } = await getRateState(identifier);
    const now = Date.now();
    if (row?.locked_until && new Date(row.locked_until).getTime() > now) {
      return json(429, { error: 'Too many attempts. Please try again later.' });
    }

    const { data: vendor, error } = await admin.from('vendors')
      .select('id,tonninyira_id,business_name,phone,pin_hash,approval_status,auth_user_id')
      .eq('phone', phone)
      .eq('approval_status', 'approved')
      .maybeSingle();

    let valid = false;
    if (!error && vendor?.pin_hash) {
      const supplied = await sha256(`${phone}:${pin}`);
      valid = supplied === vendor.pin_hash;
    }

    if (!valid) {
      const count = Number(row?.attempt_count || 0) + 1;
      const lockedUntil = count >= 5 ? new Date(now + 15 * 60 * 1000).toISOString() : null;
      await admin.from('auth_rate_limits').upsert({
        identifier_hash: key,
        scope: 'vendor_login',
        attempt_count: count,
        last_attempt_at: new Date().toISOString(),
        locked_until: lockedUntil,
      }, { onConflict: 'identifier_hash,scope' });
      return json(401, { error: 'Phone number or PIN is incorrect.' });
    }

    await admin.from('auth_rate_limits').delete().eq('identifier_hash', key).eq('scope', 'vendor_login');

    const email = `vendor-${vendor.tonninyira_id.toLowerCase().replace(/[^a-z0-9-]/g, '-') }@auth.tonninyira.local`;
    const password = crypto.randomUUID() + crypto.randomUUID();
    let authUserId = vendor.auth_user_id;

    if (!authUserId) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'vendor', vendor_id: vendor.tonninyira_id },
      });
      if (createError || !created.user) return json(500, { error: 'Could not create vendor account.' });
      authUserId = created.user.id;
      await admin.from('vendors').update({ auth_user_id: authUserId }).eq('id', vendor.id);
    } else {
      const { error: updateError } = await admin.auth.admin.updateUserById(authUserId, {
        password,
        user_metadata: { role: 'vendor', vendor_id: vendor.tonninyira_id },
      });
      if (updateError) return json(500, { error: 'Could not refresh vendor session.' });
    }

    await admin.from('profiles').upsert({
      id: authUserId,
      role: 'vendor',
      display_name: vendor.business_name,
      phone: vendor.phone,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    const authClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') || '', { auth: { persistSession: false } });
    const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
    if (signInError || !sessionData.session) return json(500, { error: 'Could not establish authenticated session.' });

    return json(200, {
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
      },
      vendor: { tonninyira_id: vendor.tonninyira_id, business_name: vendor.business_name },
    });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Unexpected authentication error.' });
  }
});
