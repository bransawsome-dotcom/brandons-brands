-- Brandon's Favorites: a "What I love about it" write-up for each watch (its unique features, in Brandon's voice),
-- shown on the gallery card and under each favorite's forum discussion.

alter table public.brand_favorites add column if not exists features text;
alter table public.brand_favorites drop constraint if exists brand_favorites_features_length;
alter table public.brand_favorites add constraint brand_favorites_features_length check (features is null or char_length(features) <= 1500);

create or replace function public.favorite_post_body(f public.brand_favorites) returns text
language sql immutable as $$
  select left(
    coalesce(nullif(f.note, ''), 'One of Brandon''s favorites.')
    || case when nullif(f.features, '') is null then '' else E'\n\n' || f.features end
    || case when f.link_url is null then ''
            when f.link_url ~* '(youtube\.com|youtu\.be)' then E'\n\nWatch on YouTube: ' || f.link_url
            when f.link_url ~* 'instagram\.com' then E'\n\nWatch the reel on Instagram: ' || f.link_url
            when f.link_url ~* 'tiktok\.com' then E'\n\nWatch on TikTok: ' || f.link_url
            when f.link_url like '/%' then E'\n\nRead the review: https://brandonsbrands17.com' || f.link_url
            else E'\n\nWatch or read: ' || f.link_url end
    || E'\n\nSee all of Brandon''s favorites: https://brandonsbrands17.com/favorites',
    5000);
$$;

create or replace function public.favorite_update_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.post_id is not null
     and (new.brand, new.model, new.note, new.link_url, new.features) is distinct from (old.brand, old.model, old.note, old.link_url, old.features) then
    update public.forum_posts
    set title = left(new.brand || ' ' || new.model, 150), body = public.favorite_post_body(new), updated_at = now()
    where id = new.post_id;
  end if;
  return new;
end;
$$;

update public.brand_favorites set features = $t$What I love about it: Traska built this around a Japanese column-wheel chronograph, the TMI NE86, which is thinner than comparable Swiss chronograph movements, so the case stays slim. The subdials are clever: instead of hands, two transparent discs rotate under fixed red lines. You get a box-style sapphire crystal, a ceramic tachymeter bezel and a 316L steel case hardened to 1200 HV, so it shrugs off scratches. Add 75m of water resistance, a screw-down crown and a tapering bracelet with a tool-less micro-adjust clasp, and it's a chronograph made to actually wear.$t$
where brand = 'Traska' and link_url = 'https://youtu.be/pOIBqGeCc2U';

update public.brand_favorites set features = $t$What I love about it: the crystal. Wren cut curved facets into both the top and the underside of the sapphire, with the underside a mirror-image negative of the top, so the dial stays clear as you tilt it. Early prototypes worked out at just 5 good crystals in 100. It's Wren's first watch outside dive watches, designed with Max Resnick: a 39mm x 10.6mm integrated case in 904L steel, a meteorite dial with an aqua seconds hand, a Swiss Sellita SW300-1 automatic with 56 hours of power reserve, and micro-adjust built right into the bracelet links. Only 150 will ever be made.$t$
where brand = 'Wren' and link_url = 'https://www.instagram.com/reel/DeO-3UpuEea/';

update public.brand_favorites set features = $t$What I love about it: this one is close to home. Chopard made it for The Timepiece Collection in Englewood, NJ, to celebrate the store's 25 years, and only 25 numbered pieces exist. At heart it's an L.U.C XPS: a 40mm steel case just 7.2mm thick, a blue dial with small seconds at 6, and Chopard's in-house L.U.C 96.12-L automatic with a 22-carat gold micro-rotor, 65 hours of power reserve and COSC chronometer certification. Elegant, thin and quietly special.$t$
where brand = 'Chopard' and link_url = 'https://youtu.be/xL019Vs8R2k';

update public.brand_favorites set features = $t$What I love about it: you can spot an Ikepod from across the room. The Chronopod's 44mm pebble-shaped steel case has no lugs, so it wears smaller than the number suggests. It was designed by Emmanuel Gueit, the designer behind the original Audemars Piguet Royal Oak Offshore. Inside is a Seiko VK63 chronograph movement, and this limited Pistachio edition pairs that UFO-like shape with a pistachio-green look that's pure fun.$t$
where brand = 'Ikepod' and link_url = 'https://youtu.be/E02jDSKzW5c';

update public.brand_favorites set model = 'Classic Fusion · TPC 25th Anniversary', features = $t$What I love about it: another piece made for The Timepiece Collection's 25th anniversary. Hublot gave the Classic Fusion a rich burgundy sunray dial made just for this edition, in a 42mm case with the signature screwed bezel. The 18K King Gold version, Hublot's own red-gold alloy, is limited to just 10 pieces. It's the Classic Fusion's clean, sporty shape in a color you won't see anywhere else.$t$
where brand = 'Hublot' and link_url = 'https://youtu.be/lf9PDALsL7Y';

update public.brand_favorites set features = $t$What I love about it: Brew made the Court Edition to celebrate the US Open and New York's tennis energy, and it's limited to 250 pieces. The green dial is textured to echo the fuzzy surface of a tennis ball, paired with a suede strap. Underneath it's the Metric I like: a compact 36mm, 1970s-inspired chronograph case with blended polished and brushed steel that wears comfortably on any wrist.$t$
where brand = 'Brew' and link_url = 'https://youtu.be/JZQXHJ6d7CU';

select f.brand, f.model, left(f.features, 60) as features, left(p.body, 60) as discussion_text
from public.brand_favorites f left join public.forum_posts p on p.id = f.post_id
order by f.sort, f.created_at;
