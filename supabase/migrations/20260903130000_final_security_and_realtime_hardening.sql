-- Final security hardening applied to production on 2026-09-03.
CREATE OR REPLACE FUNCTION public.is_rider_ops()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = (SELECT auth.uid()));
$$;

ALTER VIEW public.vendors_public SET (security_invoker = true);
ALTER VIEW public.riders_public SET (security_invoker = true);

REVOKE ALL ON FUNCTION public.is_rider_ops() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_profile_role() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_support_conversation() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.award_order_loyalty() FROM public, anon, authenticated;

DROP POLICY IF EXISTS support_private_channel_select ON realtime.messages;
CREATE POLICY support_private_channel_select ON realtime.messages FOR SELECT TO authenticated
USING (realtime.messages.extension IN ('broadcast','presence') AND EXISTS (
  SELECT 1 FROM public.support_conversations c
  WHERE ('support:' || c.id::text)=realtime.topic()
    AND (c.customer_id=(SELECT auth.uid()) OR public.is_staff_or_admin())
));

DROP POLICY IF EXISTS support_private_channel_insert ON realtime.messages;
CREATE POLICY support_private_channel_insert ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (realtime.messages.extension='broadcast' AND EXISTS (
  SELECT 1 FROM public.support_conversations c
  WHERE ('support:' || c.id::text)=realtime.topic()
    AND (c.customer_id=(SELECT auth.uid()) OR public.is_staff_or_admin())
));
