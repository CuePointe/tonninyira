import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const url=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const db=createClient(url,key,{auth:{persistSession:false}});
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const out=(s:number,b:unknown)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,'Content-Type':'application/json'}});
const clean=(v:unknown,max=300)=>String(v??'').trim().slice(0,max);
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return out(405,{error:'Method not allowed'});
 try{
  const b=await req.json(); const type=b.type==='rider'?'rider':'vendor';
  const phone=clean(b.phone,40); if(!phone)return out(400,{error:'Phone is required.'});
  if(type==='vendor'){
   const business_name=clean(b.business_name,160),owner_name=clean(b.owner_name,160);
   if(!business_name||!owner_name)return out(400,{error:'Business and owner names are required.'});
   const tid='TN-VD-'+crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();
   const pin=clean(b.pin,4); if(!/^\d{4}$/.test(pin))return out(400,{error:'A 4-digit PIN is required.'});
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(phone.replace(/[\s-]/g,'')+':'+pin));
   const pin_hash=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
   const {error}=await db.from('vendors').insert({tonninyira_id:tid,business_name,owner_name,phone, pin_hash,approval_status:'pending',registration_date:clean(b.registration_date,20),location:clean(b.location,200),category:clean(b.category,100),subcategory:clean(b.subcategory,100),kcca_license:clean(b.kcca_license,100),ura_tin:clean(b.ura_tin,100),unbs_cert:clean(b.unbs_cert,100)||null});
   if(error)return out(400,{error:'Could not submit stall application.'});
   return out(200,{ok:true,id:tid,message:'Application submitted for approval.'});
  }
  const {data:rider,error}=await db.from('riders').insert({tonninyira_id:'TN-RD-'+crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase(),full_name:clean(b.full_name,160),phone,national_id:clean(b.national_id,80),vehicle_type:clean(b.vehicle_type,80),plate_number:clean(b.plate_number,40),registration_date:clean(b.registration_date,20),approval_status:'pending'}).select('tonninyira_id').single();
  if(error)return out(400,{error:'Could not submit rider application.'});
  return out(200,{ok:true,id:rider.tonninyira_id,message:'Rider application submitted for approval.'});
 }catch(e){console.error(e);return out(500,{error:'Unexpected application error.'})}
});
