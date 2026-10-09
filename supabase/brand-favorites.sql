-- Brandon's Favorites: a public gallery of Brandon's favorite watches, each linking to its review or reel,
-- and a forum folder ("Brandon's Favorites") where only Brandon's Brands starts discussions.

create table if not exists public.brand_favorites (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid,                                   -- the collection watch it was added from, if any
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 100),
  reference_number text check (reference_number is null or char_length(reference_number) <= 60),
  image_url text check (image_url is null or image_url ~ '^https://'),
  link_url text check (link_url is null or link_url ~ '^(https://|/)'),
  note text check (note is null or char_length(note) <= 300),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists brand_favorites_sort_idx on public.brand_favorites (sort, created_at);

alter table public.brand_favorites enable row level security;
drop policy if exists "favorites are public" on public.brand_favorites;
drop policy if exists "moderators add favorites" on public.brand_favorites;
drop policy if exists "moderators edit favorites" on public.brand_favorites;
drop policy if exists "moderators remove favorites" on public.brand_favorites;
create policy "favorites are public" on public.brand_favorites for select to anon, authenticated using (true);
create policy "moderators add favorites" on public.brand_favorites for insert to authenticated with check (public.is_forum_moderator());
create policy "moderators edit favorites" on public.brand_favorites for update to authenticated using (public.is_forum_moderator()) with check (public.is_forum_moderator());
create policy "moderators remove favorites" on public.brand_favorites for delete to authenticated using (public.is_forum_moderator());

-- Only Brandon's Brands (forum moderators) starts discussions in the Brandon's Favorites folder.
-- Everyone can still read them and reply.
create or replace function public.forum_favorites_moderators_only() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.subject = 'brandons-favorites' and not public.is_forum_moderator() then
    raise exception 'Only Brandon''s Brands can start discussions in Brandon''s Favorites. You can reply to any of them.';
  end if;
  return new;
end;
$$;
drop trigger if exists forum_favorites_moderators_only on public.forum_posts;
create trigger forum_favorites_moderators_only before insert or update of subject on public.forum_posts
  for each row execute function public.forum_favorites_moderators_only();
