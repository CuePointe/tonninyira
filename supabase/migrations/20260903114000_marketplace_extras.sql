begin;

create table if not exists public.wishlists (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id text not null references public.vendors(tonninyira_id) on delete cascade,
  item_id text not null,
  item_name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, vendor_id, item_id)
);
create index if not exists wishlists_user_id_idx on public.wishlists(user_id);
alter table public.wishlists enable row level security;
revoke all on public.wishlists from anon;
grant select, insert, delete on public.wishlists to authenticated;
create policy wishlists_owner_read on public.wishlists for select to authenticated using (user_id = (select auth.uid()));
create policy wishlists_owner_insert on public.wishlists for insert to authenticated with check (user_id = (select auth.uid()));
create policy wishlists_owner_delete on public.wishlists for delete to authenticated using (user_id = (select auth.uid()));

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_conversations_customer_idx on public.support_conversations(customer_id, updated_at desc);
alter table public.support_conversations enable row level security;
revoke all on public.support_conversations from anon;
grant select, insert, update on public.support_conversations to authenticated;
create policy support_conversations_read on public.support_conversations for select to authenticated using (customer_id = (select auth.uid()) or public.is_staff_or_admin());
create policy support_conversations_insert on public.support_conversations for insert to authenticated with check (customer_id = (select auth.uid()));
create policy support_conversations_update on public.support_conversations for update to authenticated using (customer_id = (select auth.uid()) or public.is_staff_or_admin()) with check (customer_id = (select auth.uid()) or public.is_staff_or_admin());

create table if not exists public.support_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists support_messages_conversation_idx on public.support_messages(conversation_id, created_at);
alter table public.support_messages enable row level security;
revoke all on public.support_messages from anon;
grant select, insert on public.support_messages to authenticated;
create policy support_messages_read on public.support_messages for select to authenticated using (sender_user_id = (select auth.uid()) or public.is_staff_or_admin() or exists (select 1 from public.support_conversations c where c.id = conversation_id and c.customer_id = (select auth.uid())));
create policy support_messages_insert on public.support_messages for insert to authenticated with check (sender_user_id = (select auth.uid()) and exists (select 1 from public.support_conversations c where c.id = conversation_id and (c.customer_id = (select auth.uid()) or public.is_staff_or_admin()) and c.status = 'open'));

create or replace function public.touch_support_conversation() returns trigger language plpgsql security definer set search_path = public as $$ begin update public.support_conversations set updated_at = now() where id = new.conversation_id; return new; end $$;
drop trigger if exists support_messages_touch on public.support_messages;
create trigger support_messages_touch after insert on public.support_messages for each row execute function public.touch_support_conversation();
revoke execute on function public.touch_support_conversation() from public, anon, authenticated;

create table if not exists public.loyalty_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  lifetime_points integer not null default 0 check (lifetime_points >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.loyalty_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_row_id bigint not null references public.orders(id) on delete cascade,
  points integer not null check (points > 0),
  reason text not null default 'completed_order',
  created_at timestamptz not null default now(),
  unique(order_row_id)
);
create index if not exists loyalty_transactions_user_idx on public.loyalty_transactions(user_id, created_at desc);
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_transactions enable row level security;
revoke all on public.loyalty_accounts, public.loyalty_transactions from anon;
grant select on public.loyalty_accounts, public.loyalty_transactions to authenticated;
create policy loyalty_accounts_read on public.loyalty_accounts for select to authenticated using (user_id = (select auth.uid()) or public.is_staff_or_admin());
create policy loyalty_transactions_read on public.loyalty_transactions for select to authenticated using (user_id = (select auth.uid()) or public.is_staff_or_admin());

create or replace function public.award_order_loyalty() returns trigger language plpgsql security definer set search_path = public as $$
declare earned integer;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' and new.user_id is not null then
    earned := floor(coalesce(new.total, new.subtotal, new.item_subtotal, 0) / 1000)::integer;
    if earned > 0 then
      insert into public.loyalty_accounts(user_id, points, lifetime_points) values(new.user_id, earned, earned)
      on conflict(user_id) do update set points = public.loyalty_accounts.points + excluded.points, lifetime_points = public.loyalty_accounts.lifetime_points + excluded.lifetime_points, updated_at = now();
      insert into public.loyalty_transactions(user_id, order_row_id, points) values(new.user_id, new.id, earned) on conflict(order_row_id) do nothing;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists orders_award_loyalty on public.orders;
create trigger orders_award_loyalty after update of status on public.orders for each row execute function public.award_order_loyalty();
revoke execute on function public.award_order_loyalty() from public, anon, authenticated;

create unique index if not exists reviews_verified_once_idx on public.reviews(user_id, target_type, target_id, order_id) where user_id is not null;
drop policy if exists reviews_customer_insert on public.reviews;
create policy reviews_customer_insert on public.reviews for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.orders o where o.user_id = (select auth.uid()) and o.order_id = reviews.order_id and o.status = 'completed' and ((reviews.target_type = 'vendor' and o.vendor_id = reviews.target_id) or (reviews.target_type = 'rider' and o.rider_tid = reviews.target_id))));

alter table public.support_messages replica identity full;
do $$ begin begin alter publication supabase_realtime add table public.support_messages; exception when duplicate_object then null; end; end $$;
commit;