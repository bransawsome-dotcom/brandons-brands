-- Weekly blog + social media drafts written by Claude (or by hand).
-- Drafts are only visible to forum moderators (Rochelle, Brandon). Published posts are public on /blog.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]([a-z0-9-]{0,78}[a-z0-9])?$'),
  title text not null check (char_length(title) between 3 and 140),
  category text not null default 'News' check (char_length(category) <= 40),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  meta_description text not null default '' check (char_length(meta_description) <= 200),
  keywords text[] not null default '{}',
  body text[] not null default '{}',
  -- Social drafts: {"instagram":{...},"tiktok":{...},"youtube":{...},"facebook":{...}}
  social jsonb not null default '{}'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  post_date date not null default (now() at time zone 'America/New_York')::date,
  created_by text not null default 'claude',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create unique index if not exists blog_posts_slug_key on public.blog_posts (slug);
create index if not exists blog_posts_status_idx on public.blog_posts (status, post_date desc);

alter table public.blog_posts enable row level security;

drop policy if exists "read published posts" on public.blog_posts;
create policy "read published posts" on public.blog_posts for select to anon, authenticated
  using (status = 'published');

drop policy if exists "moderators read all posts" on public.blog_posts;
create policy "moderators read all posts" on public.blog_posts for select to authenticated
  using (exists (select 1 from public.forum_moderators m where m.user_id = auth.uid()));

drop policy if exists "moderators add posts" on public.blog_posts;
create policy "moderators add posts" on public.blog_posts for insert to authenticated
  with check (exists (select 1 from public.forum_moderators m where m.user_id = auth.uid()));

drop policy if exists "moderators edit posts" on public.blog_posts;
create policy "moderators edit posts" on public.blog_posts for update to authenticated
  using (exists (select 1 from public.forum_moderators m where m.user_id = auth.uid()))
  with check (exists (select 1 from public.forum_moderators m where m.user_id = auth.uid()));

drop policy if exists "moderators remove posts" on public.blog_posts;
create policy "moderators remove posts" on public.blog_posts for delete to authenticated
  using (exists (select 1 from public.forum_moderators m where m.user_id = auth.uid()));

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

-- Keep updated_at / published_at right.
create or replace function public.blog_posts_touch() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch before insert or update on public.blog_posts
  for each row execute function public.blog_posts_touch();

-- Check: who can review drafts (moderators).
select u.email from public.forum_moderators m join auth.users u on u.id = m.user_id;
