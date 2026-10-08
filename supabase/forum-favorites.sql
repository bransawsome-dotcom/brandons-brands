-- Favorite forum folders: members favorite a folder or subject (stored in forum_subject_follows),
-- with an alerts on/off switch. Favorites cover everything inside the folder.
-- Alerts: new discussions, new replies, and new clubs/sub-folders.

alter table public.forum_subject_follows add column if not exists notify boolean not null default true;

-- Members can switch alerts on/off for their own favorites (and nothing else).
create policy "change own subject follows" on public.forum_subject_follows for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.forum_subject_follows from anon, authenticated;
grant update (notify) on public.forum_subject_follows to authenticated;

-- New discussion: alert members whose favorite (with alerts on) is this folder or one it sits in.
create or replace function public.forum_notify_new_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.forum_post_follows (user_id, post_id) values (new.user_id, new.id) on conflict do nothing;
  insert into public.notifications (user_id, kind, title, body, link)
  select distinct f.user_id, 'subject_post', new.author_name || ' started a discussion: "' || left(new.title, 80) || '"', left(new.body, 200), '/forum/' || new.id
  from public.forum_subject_follows f
  where f.notify and (f.subject = new.subject or new.subject like f.subject || '/%') and f.user_id <> new.user_id;
  return new;
end;
$$;

-- New reply: alert the post's author, the comment being replied to, people following the discussion,
-- and members whose favorite folder (alerts on) contains it. Each person gets one alert.
create or replace function public.forum_notify_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  post_author uuid;
  post_title text;
  post_subject text;
  parent_author uuid;
  link_to text := '/forum/' || new.post_id || '#c-' || new.id;
begin
  select user_id, title, subject into post_author, post_title, post_subject from public.forum_posts where id = new.post_id;
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
  insert into public.notifications (user_id, kind, title, body, link)
  select distinct sf.user_id, 'folder_reply', new.author_name || ' replied in "' || left(post_title, 80) || '"', left(new.body, 200), link_to
  from public.forum_subject_follows sf
  where sf.notify
    and (sf.subject = post_subject or post_subject like sf.subject || '/%')
    and sf.user_id <> new.user_id
    and sf.user_id is distinct from post_author
    and sf.user_id is distinct from parent_author
    and not exists (select 1 from public.forum_post_follows pf where pf.post_id = new.post_id and pf.user_id = sf.user_id);
  insert into public.forum_post_follows (user_id, post_id) values (new.user_id, new.post_id) on conflict do nothing;
  return new;
end;
$$;

-- New club or sub-folder: alert members with the parent folder (alerts on) as a favorite.
create or replace function public.forum_notify_new_subject() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.parent is not null then
    insert into public.notifications (user_id, kind, title, body, link)
    select distinct f.user_id, 'folder_new', 'New club added: ' || new.name, coalesce(new.description, ''), '/forum?subject=' || new.slug
    from public.forum_subject_follows f
    where f.notify and f.subject = new.parent and f.user_id is distinct from new.created_by;
  end if;
  return new;
end;
$$;
drop trigger if exists forum_subjects_notify on public.forum_subjects;
create trigger forum_subjects_notify after insert on public.forum_subjects
  for each row execute function public.forum_notify_new_subject();
