-- Member inbox for brandonsbrands17.com: private messages, forum alerts (your posts and the
-- discussions/subjects you follow), website updates and watch group events.
-- Members only ever see their own notifications and the messages they sent or received.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  sender_name text not null check (char_length(sender_name) between 1 and 60),
  recipient_name text not null check (char_length(recipient_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);
create index if not exists messages_recipient_idx on public.messages (recipient_id, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender_id, created_at desc);

alter table public.notifications enable row level security;
alter table public.messages enable row level security;

-- Notifications: read, mark read and delete your own. They are created only by the triggers below.
create policy "read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "mark own notifications read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own notifications" on public.notifications for delete to authenticated using (user_id = auth.uid());
revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Messages: see what you sent or received; send as yourself; recipients can mark as read.
create policy "read own messages" on public.messages for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "send messages as yourself" on public.messages for insert to authenticated with check (sender_id = auth.uid());
create policy "recipient marks read" on public.messages for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
revoke update on public.messages from anon, authenticated;
grant update (read_at) on public.messages to authenticated;

-- Who members reach with "Message Brandon's Brands": the first forum moderator.
create or replace function public.brand_contact_id() returns uuid
language sql stable security definer set search_path = public as $$
  select user_id from public.forum_moderators order by user_id limit 1;
$$;
grant execute on function public.brand_contact_id() to authenticated;

-- Following: members follow discussions (posts) and whole subjects.
create table if not exists public.forum_post_follows (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create table if not exists public.forum_subject_follows (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, subject)
);
alter table public.forum_post_follows enable row level security;
alter table public.forum_subject_follows enable row level security;
create policy "see own post follows" on public.forum_post_follows for select to authenticated using (user_id = auth.uid());
create policy "add own post follows" on public.forum_post_follows for insert to authenticated with check (user_id = auth.uid());
create policy "remove own post follows" on public.forum_post_follows for delete to authenticated using (user_id = auth.uid());
create policy "see own subject follows" on public.forum_subject_follows for select to authenticated using (user_id = auth.uid());
create policy "add own subject follows" on public.forum_subject_follows for insert to authenticated with check (user_id = auth.uid());
create policy "remove own subject follows" on public.forum_subject_follows for delete to authenticated using (user_id = auth.uid());

-- New reply: notify the post's author, the comment being replied to, and everyone following the discussion.
-- The person replying starts following the discussion automatically.
create or replace function public.forum_notify_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  post_author uuid;
  post_title text;
  parent_author uuid;
  link_to text := '/forum/' || new.post_id || '#c-' || new.id;
begin
  select user_id, title into post_author, post_title from public.forum_posts where id = new.post_id;
  if post_author is not null and post_author <> new.user_id then
    insert into public.notifications (user_id, kind, title, body, link)
    values (post_author, 'forum_reply', new.author_name || ' replied to your post "' || left(post_title, 80) || '"', left(new.body, 200), link_to);
  end if;
  if new.parent_id is not null then
    select user_id into parent_author from public.forum_comments where id = new.parent_id;
    if parent_author is not null and parent_author <> new.user_id and parent_author is distinct from post_author then
      insert into public.notifications (user_id, kind, title, body, link)
      values (parent_author, 'comment_reply', new.author_name || ' replied to your comment on "' || left(post_title, 80) || '"', left(new.body, 200), link_to);
    end if;
  end if;
  insert into public.notifications (user_id, kind, title, body, link)
  select f.user_id, 'followed_reply', new.author_name || ' replied in "' || left(post_title, 80) || '"', left(new.body, 200), link_to
  from public.forum_post_follows f
  where f.post_id = new.post_id
    and f.user_id <> new.user_id
    and f.user_id is distinct from post_author
    and f.user_id is distinct from parent_author;
  insert into public.forum_post_follows (user_id, post_id) values (new.user_id, new.post_id) on conflict do nothing;
  return new;
end;
$$;
drop trigger if exists forum_comments_notify on public.forum_comments;
create trigger forum_comments_notify after insert on public.forum_comments
  for each row execute function public.forum_notify_reply();

-- New discussion: the author follows it, and members following that subject are notified.
create or replace function public.forum_notify_new_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.forum_post_follows (user_id, post_id) values (new.user_id, new.id) on conflict do nothing;
  insert into public.notifications (user_id, kind, title, body, link)
  select f.user_id, 'subject_post', new.author_name || ' started a discussion: "' || left(new.title, 80) || '"', left(new.body, 200), '/forum/' || new.id
  from public.forum_subject_follows f
  where f.subject = new.subject and f.user_id <> new.user_id;
  return new;
end;
$$;
drop trigger if exists forum_posts_notify on public.forum_posts;
create trigger forum_posts_notify after insert on public.forum_posts
  for each row execute function public.forum_notify_new_post();

-- Website updates and watch group events: moderators send one to every member's inbox.
create or replace function public.send_announcement(p_kind text, p_title text, p_body text, p_link text default null) returns integer
language plpgsql security definer set search_path = public as $$
declare
  sent integer;
begin
  if not public.is_forum_moderator() then
    raise exception 'Only Brandon''s Brands moderators can send announcements';
  end if;
  if p_kind not in ('site_update', 'group_event') then
    raise exception 'Unknown announcement type';
  end if;
  if char_length(coalesce(p_title, '')) not between 3 and 150 or char_length(coalesce(p_body, '')) > 3000 then
    raise exception 'Title must be 3-150 characters and the message under 3000';
  end if;
  insert into public.notifications (user_id, kind, title, body, link)
  select id, p_kind, p_title, coalesce(p_body, ''), nullif(p_link, '') from auth.users;
  get diagnostics sent = row_count;
  return sent;
end;
$$;
revoke execute on function public.send_announcement(text, text, text, text) from public, anon;
grant execute on function public.send_announcement(text, text, text, text) to authenticated;

-- Live updates so the inbox count changes without refreshing.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
