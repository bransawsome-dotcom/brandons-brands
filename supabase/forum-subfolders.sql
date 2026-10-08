-- Allow member-added sub-folders inside any main forum subject (not just Watch Clubs & Meetups).
-- Sub-folders are one level deep: "<main subject>/<sub-folder>".

alter table public.forum_subjects drop constraint if exists forum_subjects_slug_check;
alter table public.forum_subjects drop constraint if exists forum_subjects_parent_check;
alter table public.forum_subjects drop constraint if exists forum_subjects_check;

alter table public.forum_subjects add constraint forum_subjects_slug_check
  check (slug ~ '^(c-[a-z0-9-]{2,60}|[a-z0-9-]{2,62}/[a-z0-9-]{2,60})$');
alter table public.forum_subjects add constraint forum_subjects_parent_check
  check (parent is null or parent ~ '^[a-z0-9-]{2,62}$');
alter table public.forum_subjects add constraint forum_subjects_check
  check ((parent is null and slug like 'c-%') or (parent is not null and slug like parent || '/%'));

-- Alert wording for new sub-folders: "New club added" under Watch Clubs & Meetups, otherwise "New folder added".
create or replace function public.forum_notify_new_subject() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.parent is not null then
    insert into public.notifications (user_id, kind, title, body, link)
    select distinct f.user_id, 'folder_new',
      case when new.parent = 'clubs' then 'New club added: ' else 'New folder added: ' end || new.name,
      coalesce(new.description, ''), '/forum?subject=' || new.slug
    from public.forum_subject_follows f
    where f.notify and f.subject = new.parent and f.user_id is distinct from new.created_by;
  end if;
  return new;
end;
$$;
