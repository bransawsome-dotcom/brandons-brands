-- Each favorite in the Brandon's Favorites gallery is also a discussion in the Brandon's Favorites forum folder,
-- posted from Brandon's account as "Brandon's Brands", so members can open it and reply.
-- Also: the Wren is the Vessel Meteorite.

update public.brand_favorites set model = 'Vessel · Meteorite'
where brand = 'Wren' and link_url = 'https://www.instagram.com/reel/DeO-3UpuEea/';

alter table public.brand_favorites add column if not exists post_id uuid references public.forum_posts(id) on delete set null;

create or replace function public.favorite_post_body(f public.brand_favorites) returns text
language sql immutable as $$
  select left(
    coalesce(nullif(f.note, ''), 'One of Brandon''s favorites.')
    || case when f.link_url is null then ''
            when f.link_url ~* '(youtube\.com|youtu\.be)' then E'\n\nWatch on YouTube: ' || f.link_url
            when f.link_url ~* 'instagram\.com' then E'\n\nWatch the reel on Instagram: ' || f.link_url
            when f.link_url ~* 'tiktok\.com' then E'\n\nWatch on TikTok: ' || f.link_url
            when f.link_url like '/%' then E'\n\nRead the review: https://brandonsbrands17.com' || f.link_url
            else E'\n\nWatch or read: ' || f.link_url end
    || E'\n\nSee all of Brandon''s favorites: https://brandonsbrands17.com/favorites',
    5000);
$$;

-- New favorite -> new discussion in the folder (from the folder owner's account).
create or replace function public.favorite_create_post() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
begin
  if new.post_id is not null then return new; end if;
  select user_id into owner from public.forum_folder_owners where subject = 'brandons-favorites' order by user_id limit 1;
  if owner is null then return new; end if;
  insert into public.forum_posts (user_id, author_name, subject, title, body)
  values (owner, 'Brandon''s Brands', 'brandons-favorites', left(new.brand || ' ' || new.model, 150), public.favorite_post_body(new))
  returning id into new.post_id;
  return new;
end;
$$;
drop trigger if exists favorite_create_post on public.brand_favorites;
create trigger favorite_create_post before insert on public.brand_favorites
  for each row execute function public.favorite_create_post();

-- Edited favorite -> its discussion's title and text follow.
create or replace function public.favorite_update_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.post_id is not null and (new.brand, new.model, new.note, new.link_url) is distinct from (old.brand, old.model, old.note, old.link_url) then
    update public.forum_posts
    set title = left(new.brand || ' ' || new.model, 150), body = public.favorite_post_body(new), updated_at = now()
    where id = new.post_id;
  end if;
  return new;
end;
$$;
drop trigger if exists favorite_update_post on public.brand_favorites;
create trigger favorite_update_post after update on public.brand_favorites
  for each row execute function public.favorite_update_post();

-- Favorites already in the gallery get their discussions now (last one first, so the first favorite is on top).
do $$
declare
  f public.brand_favorites;
  owner uuid;
  pid uuid;
begin
  select user_id into owner from public.forum_folder_owners where subject = 'brandons-favorites' order by user_id limit 1;
  if owner is null then return; end if;
  for f in select * from public.brand_favorites where post_id is null order by sort desc, created_at desc loop
    insert into public.forum_posts (user_id, author_name, subject, title, body, created_at, last_activity_at)
    values (owner, 'Brandon''s Brands', 'brandons-favorites', left(f.brand || ' ' || f.model, 150), public.favorite_post_body(f), clock_timestamp(), clock_timestamp())
    returning id into pid;
    update public.brand_favorites set post_id = pid where id = f.id;
    perform pg_sleep(0.01);
  end loop;
end $$;

select f.sort, f.brand, f.model, p.title as discussion from public.brand_favorites f left join public.forum_posts p on p.id = f.post_id order by f.sort, f.created_at;
