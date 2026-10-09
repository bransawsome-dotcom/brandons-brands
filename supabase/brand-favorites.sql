-- Brandon's Favorites: a public gallery of Brandon's favorite watches, each linking to its review or reel,
-- and a forum folder ("Brandon's Favorites") where only Brandon starts discussions.
-- The gallery can be edited by forum moderators and by Brandon.

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

-- Folder owners: when a forum folder has owners, only they can start discussions in it.
-- Everyone can still read them and reply. Brandon's Favorites is owned by Brandon's account.
create table if not exists public.forum_folder_owners (
  subject text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (subject, user_id)
);
alter table public.forum_folder_owners enable row level security;
drop policy if exists "folder owners are public" on public.forum_folder_owners;
create policy "folder owners are public" on public.forum_folder_owners for select to anon, authenticated using (true);
revoke insert, update, delete on public.forum_folder_owners from anon, authenticated;

insert into public.forum_folder_owners (subject, user_id)
select 'brandons-favorites', id from auth.users where lower(email) = 'volosovbrandon@gmail.com'
on conflict do nothing;

create or replace function public.is_folder_owner(p_subject text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.forum_folder_owners where subject = p_subject and user_id = auth.uid());
$$;
grant execute on function public.is_folder_owner(text) to authenticated;

create or replace function public.forum_owned_folders_only() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.forum_folder_owners where subject = new.subject)
     and not exists (select 1 from public.forum_folder_owners where subject = new.subject and user_id = new.user_id) then
    raise exception 'Only Brandon can start discussions in this folder. You can reply to any of them.';
  end if;
  return new;
end;
$$;
drop trigger if exists forum_favorites_moderators_only on public.forum_posts;
drop function if exists public.forum_favorites_moderators_only();
drop trigger if exists forum_owned_folders_only on public.forum_posts;
create trigger forum_owned_folders_only before insert or update of subject on public.forum_posts
  for each row execute function public.forum_owned_folders_only();

-- Gallery permissions (after is_folder_owner exists): anyone can see it; moderators and Brandon edit it.
create policy "favorites are public" on public.brand_favorites for select to anon, authenticated using (true);
create policy "moderators add favorites" on public.brand_favorites for insert to authenticated with check (public.is_forum_moderator() or public.is_folder_owner('brandons-favorites'));
create policy "moderators edit favorites" on public.brand_favorites for update to authenticated using (public.is_forum_moderator() or public.is_folder_owner('brandons-favorites')) with check (public.is_forum_moderator() or public.is_folder_owner('brandons-favorites'));
create policy "moderators remove favorites" on public.brand_favorites for delete to authenticated using (public.is_forum_moderator() or public.is_folder_owner('brandons-favorites'));
