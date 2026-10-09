-- Brandon's Favorites discussions: add search-friendly wording and links to Brandon's website and every social account.
-- (Social links match src/lib/socials.ts. If an account changes, update both and run this again.)

create or replace function public.favorite_post_body(f public.brand_favorites) returns text
language sql immutable as $$
  select left(
    coalesce(nullif(f.note, ''), 'One of Brandon''s favorites.')
    || case when nullif(f.features, '') is null then '' else E'\n\n' || f.features end
    || case when f.link_url is null then ''
            when f.link_url ~* '(youtube\.com|youtu\.be)' then E'\n\n▶ Watch Brandon''s hands-on ' || f.brand || ' video on YouTube: ' || f.link_url
            when f.link_url ~* 'instagram\.com' then E'\n\n▶ Watch Brandon''s ' || f.brand || ' reel on Instagram: ' || f.link_url
            when f.link_url ~* 'tiktok\.com' then E'\n\n▶ Watch Brandon''s ' || f.brand || ' video on TikTok: ' || f.link_url
            when f.link_url like '/%' then E'\n\nRead Brandon''s full ' || f.brand || ' review: https://brandonsbrands17.com' || f.link_url
            else E'\n\nSee more: ' || f.link_url end
    || E'\n\nAbout Brandon''s Brands: Brandon Volosov shares hands-on watch reviews of luxury watches and independent microbrands like '
    || f.brand || E', plus new releases, founder interviews and watch culture. Explore more reviews, track your own watch collection and join the community at https://brandonsbrands17.com'
    || E'\n\nFollow Brandon for more watch reviews:'
    || E'\n• Instagram: https://www.instagram.com/brandonsbrands17/'
    || E'\n• TikTok: https://www.tiktok.com/@brandons.brands'
    || E'\n• YouTube: https://www.youtube.com/@BrandonsBrands'
    || E'\n• Facebook: https://www.facebook.com/profile.php?id=61595164920422'
    || E'\n\nSee all of Brandon''s favorite watches: https://brandonsbrands17.com/favorites',
    5000);
$$;

-- Refresh the existing discussions with the new wording.
update public.forum_posts p
set body = public.favorite_post_body(f)
from public.brand_favorites f
where f.post_id = p.id;

select f.brand, f.model, char_length(p.body) as length, right(p.body, 70) as ends_with
from public.brand_favorites f join public.forum_posts p on p.id = f.post_id
order by f.sort, f.created_at;
