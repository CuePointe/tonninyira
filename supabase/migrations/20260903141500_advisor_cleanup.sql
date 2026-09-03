-- Production advisor cleanup applied on 2026-09-03.
ALTER TABLE public.auth_rate_limits DISABLE ROW LEVEL SECURITY;
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated;
CREATE OR REPLACE FUNCTION public.set_riders_public_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_riders_public_updated_at() FROM public, anon, authenticated;
