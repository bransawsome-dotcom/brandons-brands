-- One-time: copy wrist shots posted before the auto-share existed into the forum's Wrist Shots folder.
-- Safe to run more than once: a wrist shot already in the folder (same member, same photo) is skipped.
-- Each forum post keeps the wrist shot's original date.
insert into public.forum_posts (user_id, author_name, subject, title, body, images, created_at, last_activity_at)
select
  w.user_id,
  left(coalesce(case when char_length(trim(w.display_name)) >= 2 then trim(w.display_name) end, 'Collector'), 40),
  'wrist-shots',
  left(case when nullif(trim(w.watch), '') is not null then 'Wrist check: ' || trim(w.watch) else 'Wrist check' end, 150),
  concat_ws(E'\n\n', nullif(trim(w.caption), ''), 'Shared from Wrist Check.'),
  array[w.image],
  w.created_at,
  w.created_at
from public.wrist_shots w
where not exists (
  select 1 from public.forum_posts p
  where p.subject = 'wrist-shots' and p.user_id = w.user_id and p.images[1] = w.image
)
order by w.created_at
returning id, title, author_name, created_at;
