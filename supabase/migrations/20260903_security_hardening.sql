-- Tonninyira security hardening foundation
begin;

create table if not exists public.auth_rate_limits (
  identifier_hash text not null,
  scope text not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  primary key (identifier_hash, scope)
);
alter table public.auth_rate_limits enable row level security;

alter table if exists public.vendors add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table if exists public.riders add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table if exists public.vendors add column if not exists approval_status text not null default 'pending';
alter table if exists public.riders add column if not exists approval_status text not null default 'pending';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','vendor','rider','staff','admin')),
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_auth_user_id_idx on public.vendors(auth_user_id);
create index if not exists riders_auth_user_id_idx on public.riders(auth_user_id);
create index if not exists profiles_role_idx on public.profiles(role);

alter table if exists public.profiles enable row level security;
alter table if exists public.vendors enable row level security;
alter table if exists public.riders enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.reviews enable row level security;

-- Remove only policies created by this hardening migration on reruns.
drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "vendors_self_update" on public.vendors;
drop policy if exists "riders_self_update" on public.riders;
drop policy if exists "orders_customer_read" on public.orders;
drop policy if exists "orders_customer_insert" on public.orders;
drop policy if exists "orders_vendor_read" on public.orders;
drop policy if exists "orders_vendor_update" on public.orders;

create policy "profiles_self_read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_self_update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "vendors_self_update" on public.vendors for update to authenticated
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy "riders_self_update" on public.riders for update to authenticated
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

create policy "orders_customer_read" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "orders_customer_insert" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "orders_vendor_read" on public.orders for select to authenticated using (
  exists (select 1 from public.vendors v where v.tonninyira_id = orders.vendor_id and v.auth_user_id = auth.uid() and v.approval_status = 'approved')
);
create policy "orders_vendor_update" on public.orders for update to authenticated
  using (exists (select 1 from public.vendors v where v.tonninyira_id = orders.vendor_id and v.auth_user_id = auth.uid() and v.approval_status = 'approved'))
  with check (exists (select 1 from public.vendors v where v.tonninyira_id = orders.vendor_id and v.auth_user_id = auth.uid() and v.approval_status = 'approved'));

-- Public views intentionally exclude phone, PIN hashes, NID and other compliance data.
create or replace view public.vendors_public with (security_invoker = true) as
select tonninyira_id,business_name,location,category,subcategory,logo_url,gallery,items,created_at
from public.vendors where approval_status = 'approved';

create or replace view public.riders_public with (security_invoker = true) as
select tonninyira_id,full_name,photo_url,vehicle_type,plate_number
from public.riders where approval_status = 'approved';

-- Explicitly revoke anonymous writes to private operational tables. Public catalog
-- reads should use vendors_public instead of vendors.
revoke insert, update, delete on public.vendors from anon;
revoke insert, update, delete on public.riders from anon;
revoke insert, update, delete on public.profiles from anon;
revoke all on public.auth_rate_limits from anon, authenticated;

commit;
