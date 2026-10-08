-- Community forum for brandonsbrands17.com
-- Anyone can read. Logged-in members can post, comment and reply.
-- Members can edit/delete their own posts and delete their own comments.
-- Forum moderators can delete any post or comment.

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 40),
  subject text not null,
  title text not null check (char_length(title) between 3 and 150),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_activity_at timestamptz not null default now()
);

create table if not exists public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  parent_id uuid references public.forum_comments(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 40),
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now()
);

create table if not exists public.forum_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create index if not exists forum_comments_post_idx on public.forum_comments (post_id, created_at);
create index if not exists forum_posts_activity_idx on public.forum_posts (last_activity_at desc);

alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_moderators enable row level security;

create or replace function public.is_forum_moderator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.forum_moderators where user_id = auth.uid());
$$;

-- Posts
create policy "forum posts are public" on public.forum_posts for select to anon, authenticated using (true);
create policy "members create own posts" on public.forum_posts for insert to authenticated with check (user_id = auth.uid());
create policy "members edit own posts" on public.forum_posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "members or moderators delete posts" on public.forum_posts for delete to authenticated using (user_id = auth.uid() or public.is_forum_moderator());
-- Members may only change the title, text and subject of their own posts.
revoke update on public.forum_posts from anon, authenticated;
grant update (title, body, subject, updated_at) on public.forum_posts to authenticated;

-- Comments and replies
create policy "forum comments are public" on public.forum_comments for select to anon, authenticated using (true);
create policy "members create own comments" on public.forum_comments for insert to authenticated with check (user_id = auth.uid());
create policy "members or moderators delete comments" on public.forum_comments for delete to authenticated using (user_id = auth.uid() or public.is_forum_moderator());

-- Moderators: each member can only see whether they themselves are one.
create policy "see own moderator status" on public.forum_moderators for select to authenticated using (user_id = auth.uid());

-- A new comment moves its discussion to the top of "Latest activity".
create or replace function public.forum_bump_activity() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.forum_posts set last_activity_at = now() where id = new.post_id;
  return new;
end;
$$;
drop trigger if exists forum_comments_bump on public.forum_comments;
create trigger forum_comments_bump after insert on public.forum_comments
  for each row execute function public.forum_bump_activity();

-- Live updates (new posts and replies appear without refreshing).
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'forum_posts') then
    alter publication supabase_realtime add table public.forum_posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'forum_comments') then
    alter publication supabase_realtime add table public.forum_comments;
  end if;
end $$;

-- First moderator: the account currently logged in to brandonsbrands17.com in Chrome.
insert into public.forum_moderators (user_id) values ('283a7f34-7116-4f4b-a624-117a2e871e3a') on conflict do nothing;
