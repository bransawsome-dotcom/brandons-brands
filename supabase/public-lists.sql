-- Public collections and wishlists, unique public names, and offers on watches.
--
-- * Every member has a public name (their "Name or customer number"), unique across the site,
--   and a web address made from it: brandonsbrands17.com/collectors/<handle>.
--   Nothing else about the member (email, real name) is ever public.
-- * A member can make their collection and/or wishlist public. Public lists can be found by search engines.
--   Prices paid, purchase dates and notes are never shown publicly.
-- * Anyone can make an offer on a watch in a public collection. Offers are only visible to the watch's owner.

-- Turn a name into a web-address-safe handle: "Jane Smith #1042" -> "jane-smith-1042".
create or replace function public.handle_from_name(p_name text) returns text
language sql immutable set search_path = public as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create table if not exists public.public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  handle text not null check (handle ~ '^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$'),
  collection_public boolean not null default false,
  wishlist_public boolean not null default false,
  updated_at timestamptz not null default now()
);
create unique index if not exists public_profiles_handle_key on public.public_profiles (handle);

alter table public.public_profiles enable row level security;
drop policy if exists "see own public profile" on public.public_profiles;
create policy "see own public profile" on public.public_profiles for select to authenticated using (user_id = auth.uid());
-- All changes go through the functions below (they enforce unique names).
revoke insert, update, delete on public.public_profiles from anon, authenticated;

-- A free handle based on a name, adding -2, -3… if needed. Used only for automatic setup.
create or replace function public.free_handle(p_name text, p_user uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  base text := left(public.handle_from_name(p_name), 40);
  candidate text;
  n int := 1;
begin
  if char_length(base) < 2 then base := 'collector'; end if;
  candidate := base;
  while exists (select 1 from public.public_profiles where handle = candidate and user_id <> p_user) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;
revoke execute on function public.free_handle(text, uuid) from public, anon, authenticated;

-- New accounts get a public profile automatically (lists stay private until the member turns them on).
create or replace function public.create_public_profile() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  nm text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'account_name'), ''), 'Collector');
begin
  insert into public.public_profiles (user_id, display_name, handle)
  values (new.id, left(nm, 40), public.free_handle(nm, new.id))
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_public_profile on auth.users;
create trigger on_auth_user_public_profile after insert on auth.users
  for each row execute function public.create_public_profile();

-- Existing members.
insert into public.public_profiles (user_id, display_name, handle)
select u.id,
       left(coalesce(nullif(trim(u.raw_user_meta_data ->> 'account_name'), ''), 'Collector'), 40),
       public.free_handle(coalesce(nullif(trim(u.raw_user_meta_data ->> 'account_name'), ''), 'Collector'), u.id)
from auth.users u
where not exists (select 1 from public.public_profiles p where p.user_id = u.id)
order by u.created_at;

-- Is this name free? (Used at sign-up and when changing the name.)
create or replace function public.public_name_available(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select char_length(public.handle_from_name(p_name)) >= 2
     and not exists (
       select 1 from public.public_profiles
       where handle = public.handle_from_name(p_name) and user_id is distinct from auth.uid()
     );
$$;
grant execute on function public.public_name_available(text) to anon, authenticated;

-- Change my public name. Fails with "name_taken" if someone else already uses it.
create or replace function public.set_public_name(p_name text) returns text
language plpgsql security definer set search_path = public as $$
declare
  clean text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  h text := left(public.handle_from_name(p_name), 50);
begin
  if auth.uid() is null then raise exception 'not_logged_in'; end if;
  if char_length(clean) < 2 or char_length(clean) > 40 or char_length(h) < 2 then raise exception 'name_invalid'; end if;
  if exists (select 1 from public.public_profiles where handle = h and user_id <> auth.uid()) then
    raise exception 'name_taken';
  end if;
  insert into public.public_profiles (user_id, display_name, handle) values (auth.uid(), clean, h)
  on conflict (user_id) do update set display_name = excluded.display_name, handle = excluded.handle, updated_at = now();
  return h;
end;
$$;
grant execute on function public.set_public_name(text) to authenticated;

-- Make my collection or wishlist public / private.
create or replace function public.set_list_public(p_kind text, p_public boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_logged_in'; end if;
  if p_kind = 'collection' then
    update public.public_profiles set collection_public = p_public, updated_at = now() where user_id = auth.uid();
  elsif p_kind = 'wishlist' then
    update public.public_profiles set wishlist_public = p_public, updated_at = now() where user_id = auth.uid();
  else
    raise exception 'bad_kind';
  end if;
end;
$$;
grant execute on function public.set_list_public(text, boolean) to authenticated;

-- What a public list shows. Returns null unless that list is public. Never includes prices paid, dates or notes.
create or replace function public.get_public_list(p_handle text, p_kind text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  p public.public_profiles;
  items jsonb;
begin
  select * into p from public.public_profiles where handle = lower(p_handle);
  if not found then return null; end if;

  if p_kind = 'collection' and p.collection_public then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', w.id::text, 'brand', w.brand, 'model', w.model, 'reference_number', w.reference_number,
      'nickname', w.nickname, 'image_url', w.image_url, 'condition', w.condition,
      'estimated_value', w.estimated_value, 'current_retail_price', w.current_retail_price,
      'details', w.details, 'has_box', w.has_box, 'has_papers', w.has_papers,
      'authenticated', w.authenticated, 'authenticated_by', w.authenticated_by
    ) order by w.brand, w.model), '[]'::jsonb)
    into items from public.watches w where w.user_id = p.user_id;
  elsif p_kind = 'wishlist' and p.wishlist_public then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id::text, 'brand', i.brand, 'model', i.model, 'reference_number', i.reference_number,
      'image_url', i.image_url, 'priority', i.priority,
      'market_value', i.current_market_price, 'retail_price', i.retail_price, 'details', i.details
    ) order by case i.priority when 'High' then 0 when 'Medium' then 1 else 2 end, i.brand, i.model), '[]'::jsonb)
    into items from public.wishlist i where i.user_id = p.user_id;
  else
    return null;
  end if;

  return jsonb_build_object(
    'kind', p_kind, 'display_name', p.display_name, 'handle', p.handle, 'updated_at', p.updated_at,
    'collection_public', p.collection_public, 'wishlist_public', p.wishlist_public, 'items', items
  );
end;
$$;
grant execute on function public.get_public_list(text, text) to anon, authenticated;

-- All members with at least one public list (for the Collectors page and search engines).
create or replace function public.list_public_collectors() returns table (
  handle text, display_name text, collection_public boolean, wishlist_public boolean,
  watch_count bigint, wish_count bigint, updated_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.handle, p.display_name, p.collection_public, p.wishlist_public,
         case when p.collection_public then (select count(*) from public.watches w where w.user_id = p.user_id) else 0 end,
         case when p.wishlist_public then (select count(*) from public.wishlist i where i.user_id = p.user_id) else 0 end,
         p.updated_at
  from public.public_profiles p
  where p.collection_public or p.wishlist_public
  order by p.updated_at desc
  limit 5000;
$$;
grant execute on function public.list_public_collectors() to anon, authenticated;

-- Offers on watches in public collections. Created only by the website's server (which checks the
-- watch is in a public collection); only the owner can read or delete them.
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  watch_id text not null,
  watch_label text not null,
  amount numeric not null check (amount > 0 and amount < 100000000),
  from_name text not null check (char_length(from_name) between 1 and 80),
  from_email text not null check (char_length(from_email) between 3 and 200),
  from_user_id uuid references auth.users(id) on delete set null,
  message text not null default '' check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists offers_owner_idx on public.offers (owner_id, created_at desc);
create index if not exists offers_email_idx on public.offers (lower(from_email), created_at desc);

alter table public.offers enable row level security;
drop policy if exists "owner reads offers" on public.offers;
create policy "owner reads offers" on public.offers for select to authenticated using (owner_id = auth.uid());
drop policy if exists "owner deletes offers" on public.offers;
create policy "owner deletes offers" on public.offers for delete to authenticated using (owner_id = auth.uid());
revoke insert, update on public.offers from anon, authenticated;
