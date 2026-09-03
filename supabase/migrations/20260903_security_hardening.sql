-- Tonninyira security hardening foundation
-- Apply this migration in the Supabase SQL editor before enabling the hardened
-- vendor/admin flows. It deliberately does NOT grant anonymous write access.

begin;

-- Private identity mapping. Existing vendor/rider rows remain valid.
alter table if exists public.vendors
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table if exists public.riders
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

-- Approval state is explicit instead of treating registration as approval.
alter table if exists public.vendors
  add column if not exists approval_status text not null default 'pending';

alter table if exists public.riders
  add column if not exists approval_status text not null default 'pending';

-- Profiles provide one role source of truth for authenticated users.
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

-- RLS is the actual authorization boundary. Client-side filters are not.
alter table if exists public.profiles enable row level security;
alter table if exists public.vendors enable row level security;
alter table if exists public.riders enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.reviews enable row level security;

-- Remove common broad policies if this migration is reapplied. Existing
-- project-specific policies with different names must still be reviewed.
drop policy if exists "profiles_public_read" on public.profiles;
drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "vendors_public_read" on public.vendors;
drop policy if exists "vendors_authenticated_read" on public.vendors;
drop policy if exists "vendors_self_update" on public.vendors;
drop policy if exists "riders_public_read" on public.riders;
drop policy if exists "riders_self_update" on public.riders;
drop policy if exists "orders_customer_read" on public.orders;
drop policy if exists "orders_vendor_read" on public.orders;
drop policy if exists "orders_vendor_update" on public.orders;
drop policy if exists "orders_customer_insert" on public.orders;
drop policy if exists "reviews_customer_insert" on public.reviews;

-- Profiles: users can read/update only their own profile. Staff/admin access
-- should be added through explicit staff policies, not broad public grants.
create policy "profiles_self_read" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_self_update" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Vendors: no anonymous access to the private base table.
create policy "vendors_self_update" on public.vendors
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Riders: no anonymous access to the private base table.
create policy "riders_self_update" on public.riders
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Customers may create orders only for themselves. The client must provide
-- its authenticated user id; trusted backend logic should calculate prices,
-- fees, vendor splits and status in the final checkout implementation.
create policy "orders_customer_read" on public.orders
  for select to authenticated
  using (user_id = auth.uid());

create policy "orders_customer_insert" on public.orders
  for insert to authenticated
  with check (user_id = auth.uid());

-- Vendor order visibility is tied to the vendor's authenticated identity,
-- never to a browser-supplied vendor_id alone.
create policy "orders_vendor_read" on public.orders
  for select to authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.tonninyira_id = orders.vendor_id
        and v.auth_user_id = auth.uid()
        and v.approval_status = 'approved'
    )
  );

create policy "orders_vendor_update" on public.orders
  for update to authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.tonninyira_id = orders.vendor_id
        and v.auth_user_id = auth.uid()
        and v.approval_status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.vendors v
      where v.tonninyira_id = orders.vendor_id
        and v.auth_user_id = auth.uid()
        and v.approval_status = 'approved'
    )
  );

-- Reviews are bound to the authenticated customer identity. Existing legacy
-- phone-only review rows should be migrated before tightening this further.
create policy "reviews_customer_insert" on public.reviews
  for insert to authenticated
  with check (reviewer_phone is not null);

-- Public-facing data should come through narrow views, never the private
-- vendors/riders tables. SECURITY INVOKER preserves RLS of the caller.
create or replace view public.vendors_public
with (security_invoker = true)
as
select
  tonninyira_id,
  business_name,
  location,
  category,
  subcategory,
  logo_url,
  gallery,
  items,
  created_at
from public.vendors
where approval_status = 'approved';

create or replace view public.riders_public
with (security_invoker = true)
as
select
  tonninyira_id,
  full_name,
  photo_url,
  vehicle_type,
  plate_number
from public.riders
where approval_status = 'approved';

-- Do not expose these private columns through the public views:
-- vendors.phone, vendors.pin_hash, compliance fields
-- riders.phone, riders.national_id

commit;
