-- Wishlist price alerts for brandonsbrands17.com.
-- Once a day the site searches for each wishlist watch that has "Price alert" turned on and a target price.
-- Listings at or below the target are saved here and the member gets an inbox alert (and an email, once set up).

alter table public.wishlist add column if not exists price_alert boolean not null default false;
alter table public.wishlist add column if not exists alert_checked_at timestamptz;

create table if not exists public.price_alert_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wishlist_id text not null,
  url text not null,
  title text not null default '',
  price numeric,
  currency text not null default 'USD',
  price_usd numeric not null,
  target_usd numeric,
  seller text not null default '',
  marketplace text not null default '',
  location text not null default '',
  condition text not null default '',
  box_papers text not null default '',
  found_at timestamptz not null default now(),
  unique (wishlist_id, url)
);
create index if not exists price_alert_matches_user_idx on public.price_alert_matches (user_id, found_at desc);

alter table public.price_alert_matches enable row level security;

-- Members see and clear their own matches. Matches are only added by the daily check on the server.
drop policy if exists "read own price matches" on public.price_alert_matches;
create policy "read own price matches" on public.price_alert_matches for select to authenticated using (user_id = auth.uid());
drop policy if exists "delete own price matches" on public.price_alert_matches;
create policy "delete own price matches" on public.price_alert_matches for delete to authenticated using (user_id = auth.uid());
revoke insert, update on public.price_alert_matches from anon, authenticated;

-- Removing a wishlist watch also removes its saved matches.
create or replace function public.price_alert_cleanup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.price_alert_matches where wishlist_id = old.id::text and user_id = old.user_id;
  return old;
end;
$$;
drop trigger if exists wishlist_price_alert_cleanup on public.wishlist;
create trigger wishlist_price_alert_cleanup after delete on public.wishlist
  for each row execute function public.price_alert_cleanup();
