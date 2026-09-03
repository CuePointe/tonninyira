-- Tonninyira security hardening foundation
begin;

create table if not exists public.auth_rate_limits (
  identifier_hash text not null, scope text not null, attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz, locked_until timestamptz, created_at timestamptz not null default now(), primary key (identifier_hash, scope)
);
alter table public.auth_rate_limits enable row level security;
alter table if exists public.vendors add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table if exists public.riders add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table if exists public.vendors add column if not exists approval_status text not null default 'pending';
alter table if exists public.riders add column if not exists approval_status text not null default 'pending';
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade,role text not null default 'customer' check(role in('customer','vendor','rider','staff','admin')),display_name text,phone text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists vendors_auth_user_id_idx on public.vendors(auth_user_id);
create index if not exists riders_auth_user_id_idx on public.riders(auth_user_id);
create index if not exists profiles_role_idx on public.profiles(role);

alter table if exists public.profiles enable row level security;
alter table if exists public.vendors enable row level security;
alter table if exists public.riders enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.reviews enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "vendors_self_update" on public.vendors;drop policy if exists "vendors_staff_read" on public.vendors;drop policy if exists "vendors_staff_update" on public.vendors;
drop policy if exists "riders_self_update" on public.riders;drop policy if exists "riders_staff_read" on public.riders;drop policy if exists "riders_staff_update" on public.riders;
drop policy if exists "orders_customer_read" on public.orders;drop policy if exists "orders_customer_insert" on public.orders;drop policy if exists "orders_vendor_read" on public.orders;drop policy if exists "orders_vendor_update" on public.orders;

create or replace function public.is_staff_or_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in('staff','admin')); $$;
revoke all on function public.is_staff_or_admin() from public;grant execute on function public.is_staff_or_admin() to authenticated;
create policy "profiles_self_read" on public.profiles for select to authenticated using(id=auth.uid());
create policy "profiles_self_update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "vendors_self_update" on public.vendors for update to authenticated using(auth_user_id=auth.uid()) with check(auth_user_id=auth.uid());
create policy "vendors_staff_read" on public.vendors for select to authenticated using(public.is_staff_or_admin() or auth_user_id=auth.uid());
create policy "vendors_staff_update" on public.vendors for update to authenticated using(public.is_staff_or_admin()) with check(public.is_staff_or_admin());
create policy "riders_self_update" on public.riders for update to authenticated using(auth_user_id=auth.uid()) with check(auth_user_id=auth.uid());
create policy "riders_staff_read" on public.riders for select to authenticated using(public.is_staff_or_admin() or auth_user_id=auth.uid());
create policy "riders_staff_update" on public.riders for update to authenticated using(public.is_staff_or_admin()) with check(public.is_staff_or_admin());
create policy "orders_customer_read" on public.orders for select to authenticated using(user_id=auth.uid());
create policy "orders_customer_insert" on public.orders for insert to authenticated with check(user_id=auth.uid());
create policy "orders_vendor_read" on public.orders for select to authenticated using(exists(select 1 from public.vendors v where v.tonninyira_id=orders.vendor_id and v.auth_user_id=auth.uid() and v.approval_status='approved'));
create policy "orders_vendor_update" on public.orders for update to authenticated using(exists(select 1 from public.vendors v where v.tonninyira_id=orders.vendor_id and v.auth_user_id=auth.uid() and v.approval_status='approved')) with check(exists(select 1 from public.vendors v where v.tonninyira_id=orders.vendor_id and v.auth_user_id=auth.uid() and v.approval_status='approved'));

-- Customer inserts are normalized against the approved vendor catalog. Submitted prices are never trusted.
create or replace function public.normalize_new_order() returns trigger language plpgsql security definer set search_path=public as $$
declare v record;i jsonb;catalog jsonb;matched jsonb;qty integer;unit numeric;calc numeric:=0;begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if new.user_id<>auth.uid() then raise exception 'Order ownership mismatch'; end if;
 if new.status is null or new.status<>'pending' then new.status:='pending'; end if;
 if new.created_at is null then new.created_at:=now(); end if;
 select * into v from public.vendors where tonninyira_id=new.vendor_id and approval_status='approved';
 if not found then raise exception 'Vendor is not available'; end if;
 catalog:=coalesce(v.items::jsonb,'[]'::jsonb);
 if jsonb_typeof(coalesce(new.items::jsonb,'[]'::jsonb))<>'array' then raise exception 'Invalid order items'; end if;
 for i in select value from jsonb_array_elements(new.items::jsonb) loop
   qty:=greatest(1,coalesce((i->>'qty')::integer,(i->>'quantity')::integer,1));
   select value into matched from jsonb_array_elements(catalog) where lower(value->>'name')=lower(i->>'name') limit 1;
   if matched is null then raise exception 'Item is not on the approved vendor menu'; end if;
   unit:=coalesce((matched->>'price')::numeric,0);
   if unit<0 then raise exception 'Invalid catalog price'; end if;
   calc:=calc+(unit*qty);
 end loop;
 new.item_subtotal:=calc;new.subtotal:=calc;
 if coalesce(new.delivery_fee,0)<0 or coalesce(new.delivery_fee,0)>10000 then raise exception 'Invalid delivery fee'; end if;
 new.total:=calc+coalesce(new.delivery_fee,0);
 return new;
end;$$;
revoke all on function public.normalize_new_order() from public;
drop trigger if exists normalize_new_order on public.orders;
create trigger normalize_new_order before insert on public.orders for each row execute function public.normalize_new_order();

create or replace function public.protect_order_fields() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is not null and not public.is_staff_or_admin() then
  if new.user_id is distinct from old.user_id or new.vendor_id is distinct from old.vendor_id or new.items is distinct from old.items or new.total is distinct from old.total or new.subtotal is distinct from old.subtotal or new.item_subtotal is distinct from old.item_subtotal or new.delivery_fee is distinct from old.delivery_fee or new.customer_phone is distinct from old.customer_phone or new.payment_method is distinct from old.payment_method then raise exception 'Protected order fields cannot be changed'; end if;
  if exists(select 1 from public.vendors v where v.tonninyira_id=old.vendor_id and v.auth_user_id=auth.uid()) then
   if old.status='pending' and new.status not in('accepted','declined') then raise exception 'Invalid order transition'; end if;
   if old.status='accepted' and new.status<>'ready' then raise exception 'Invalid order transition'; end if;
   if old.status='ready' and new.status<>'completed' then raise exception 'Invalid order transition'; end if;
   if old.status in('declined','completed') then raise exception 'Closed orders cannot change'; end if;
  end if;
 end if;return new;end;$$;
drop trigger if exists protect_order_fields on public.orders;create trigger protect_order_fields before update on public.orders for each row execute function public.protect_order_fields();

create or replace view public.vendors_public with(security_invoker=true) as select tonninyira_id,business_name,location,category,subcategory,logo_url,gallery,items,created_at from public.vendors where approval_status='approved';
create or replace view public.riders_public with(security_invoker=true) as select tonninyira_id,full_name,photo_url,vehicle_type,plate_number from public.riders where approval_status='approved';
revoke insert,update,delete on public.vendors from anon;revoke insert,update,delete on public.riders from anon;revoke insert,update,delete on public.profiles from anon;revoke all on public.auth_rate_limits from anon,authenticated;
commit;
