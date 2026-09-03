-- Run against the production project after migrations.
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace s ON s.oid=c.relnamespace
  WHERE s.nspname='public' AND c.relname IN ('wishlists','support_conversations','support_messages','loyalty_accounts','loyalty_transactions') AND c.relrowsecurity;
  IF n <> 5 THEN RAISE EXCEPTION 'Expected RLS on all five marketplace tables; found %',n; END IF;

  SELECT count(*) INTO n FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace s ON s.oid=c.relnamespace
  WHERE s.nspname='public' AND c.relname='reviews' AND p.polname='reviews_customer_insert';
  IF n <> 1 THEN RAISE EXCEPTION 'Verified-review insert policy is missing'; END IF;

  SELECT count(*) INTO n FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace s ON s.oid=c.relnamespace
  WHERE s.nspname='public' AND c.relname='profiles' AND t.tgname LIKE '%profile_role%';
  IF n = 0 THEN RAISE EXCEPTION 'Profile role protection trigger is missing'; END IF;

  SELECT count(*) INTO n FROM pg_proc p JOIN pg_namespace s ON s.oid=p.pronamespace
  WHERE s.nspname='public' AND p.proname='is_rider_ops' AND 'search_path=public' = ANY(p.proconfig);
  IF n <> 1 THEN RAISE EXCEPTION 'is_rider_ops search_path hardening is missing'; END IF;
END $$;

-- Public catalog views must run with invoker rights so underlying RLS applies.
SELECT schemaname, viewname, viewoption
FROM pg_views
WHERE schemaname='public' AND viewname IN ('vendors_public','riders_public');

SELECT n.nspname AS schema_name, c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname IN ('wishlists','support_conversations','support_messages','loyalty_accounts','loyalty_transactions');
