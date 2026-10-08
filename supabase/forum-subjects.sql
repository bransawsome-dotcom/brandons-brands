-- Forum subjects: member-created subjects and watch club folders, brand folders,
-- and moving the old brand subjects into the new "Watch Brands" folder.

create table if not exists public.forum_subjects (
  slug text primary key check (slug ~ '^(c-[a-z0-9-]{2,60}|clubs/[a-z0-9-]{2,60})$'),
  name text not null check (char_length(name) between 2 and 50),
  parent text check (parent is null or parent = 'clubs'),
  description text check (description is null or char_length(description) <= 300),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check ((parent is null and slug like 'c-%') or (parent = 'clubs' and slug like 'clubs/%'))
);
create unique index if not exists forum_subjects_name_idx on public.forum_subjects (coalesce(parent, ''), lower(name));

alter table public.forum_subjects enable row level security;
-- Everyone can see subjects; members can add them; the creator (only while it has no posts) or a moderator can remove one.
create policy "forum subjects are public" on public.forum_subjects for select to anon, authenticated using (true);
create policy "members add subjects" on public.forum_subjects for insert to authenticated with check (created_by = auth.uid());
create policy "creator or moderator removes subjects" on public.forum_subjects for delete to authenticated using (
  public.is_forum_moderator()
  or (created_by = auth.uid() and not exists (select 1 from public.forum_posts p where p.subject = forum_subjects.slug))
);
revoke update on public.forum_subjects from anon, authenticated;

-- Move the old brand subjects into the Watch Brands folder.
update public.forum_posts set subject = 'brands/rolex' where subject = 'rolex';
update public.forum_posts set subject = 'brands/omega' where subject = 'omega';
update public.forum_posts set subject = 'brands/tudor' where subject = 'tudor';
update public.forum_posts set subject = 'brands/misc' where subject in ('holy-trinity', 'independents');
update public.forum_subject_follows set subject = 'brands/rolex' where subject = 'rolex' and not exists (select 1 from public.forum_subject_follows x where x.user_id = forum_subject_follows.user_id and x.subject = 'brands/rolex');
update public.forum_subject_follows set subject = 'brands/omega' where subject = 'omega' and not exists (select 1 from public.forum_subject_follows x where x.user_id = forum_subject_follows.user_id and x.subject = 'brands/omega');
update public.forum_subject_follows set subject = 'brands/tudor' where subject = 'tudor' and not exists (select 1 from public.forum_subject_follows x where x.user_id = forum_subject_follows.user_id and x.subject = 'brands/tudor');
delete from public.forum_subject_follows where subject in ('rolex', 'omega', 'tudor', 'holy-trinity', 'independents');

-- Following a folder (e.g. Watch Brands or Watch Clubs & Meetups) also covers its sub-folders.
create or replace function public.forum_notify_new_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.forum_post_follows (user_id, post_id) values (new.user_id, new.id) on conflict do nothing;
  insert into public.notifications (user_id, kind, title, body, link)
  select distinct f.user_id, 'subject_post', new.author_name || ' started a discussion: "' || left(new.title, 80) || '"', left(new.body, 200), '/forum/' || new.id
  from public.forum_subject_follows f
  where (f.subject = new.subject or new.subject like f.subject || '/%') and f.user_id <> new.user_id;
  return new;
end;
$$;

-- Live updates so new subjects and clubs appear without refreshing.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'forum_subjects') then
    alter publication supabase_realtime add table public.forum_subjects;
  end if;
end $$;
