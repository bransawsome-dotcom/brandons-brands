-- Photos on forum posts and replies (up to 4 each). Each photo is a small JPEG shrunk in the browser and stored
-- as a data URL, the same way Wrist Check photos are. image_count lets the forum list show a 📷 badge without
-- downloading the photos.

create or replace function public.forum_images_ok(imgs text[]) returns boolean
language sql immutable as $$
  select coalesce(cardinality(imgs), 0) <= 4
     and not exists (
       select 1 from unnest(coalesce(imgs, '{}')) i
       where i !~ '^data:image/(jpeg|png|webp);base64,' or char_length(i) > 700000
     );
$$;

alter table public.forum_posts add column if not exists images text[] not null default '{}';
alter table public.forum_posts add column if not exists image_count integer generated always as (cardinality(images)) stored;
alter table public.forum_posts drop constraint if exists forum_posts_images_ok;
alter table public.forum_posts add constraint forum_posts_images_ok check (public.forum_images_ok(images));

alter table public.forum_comments add column if not exists images text[] not null default '{}';
alter table public.forum_comments drop constraint if exists forum_comments_images_ok;
alter table public.forum_comments add constraint forum_comments_images_ok check (public.forum_images_ok(images));

select
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'forum_posts' and column_name in ('images', 'image_count')) as post_columns,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'forum_comments' and column_name = 'images') as reply_columns;
