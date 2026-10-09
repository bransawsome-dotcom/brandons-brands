-- Site search: watches in public collections and public wishlists, and members' public names.
-- Only public lists are searched, and only safe fields are returned (no prices paid, dates, notes or emails).
-- Every word typed must match (e.g. "omega speedmaster").
-- Also: members found in search can be messaged (not only members with a public list).

create or replace function public.search_public(p_q text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  terms text[];
  result jsonb;
begin
  terms := array(select t from unnest(regexp_split_to_array(lower(trim(coalesce(p_q, ''))), '\s+')) t where char_length(t) >= 2 limit 6);
  if coalesce(array_length(terms, 1), 0) = 0 then
    return jsonb_build_object('watches', '[]'::jsonb, 'wishes', '[]'::jsonb, 'people', '[]'::jsonb);
  end if;

  select jsonb_build_object(
    'watches', coalesce((
      select jsonb_agg(x) from (
        select w.id, w.brand, w.model, w.reference_number, w.image_url, p.handle, p.display_name
        from public.watches w
        join public.public_profiles p on p.user_id = w.user_id and p.collection_public
        where not exists (
          select 1 from unnest(terms) t
          where position(t in lower(concat_ws(' ', w.brand, w.model, w.reference_number, w.nickname, p.display_name))) = 0
        )
        order by w.brand, w.model
        limit 30
      ) x), '[]'::jsonb),
    'wishes', coalesce((
      select jsonb_agg(x) from (
        select i.id, i.brand, i.model, i.reference_number, i.image_url, p.handle, p.display_name
        from public.wishlist i
        join public.public_profiles p on p.user_id = i.user_id and p.wishlist_public
        where not exists (
          select 1 from unnest(terms) t
          where position(t in lower(concat_ws(' ', i.brand, i.model, i.reference_number, p.display_name))) = 0
        )
        order by i.brand, i.model
        limit 30
      ) x), '[]'::jsonb),
    'people', coalesce((
      select jsonb_agg(x) from (
        select p.display_name, p.handle, p.collection_public, p.wishlist_public
        from public.public_profiles p
        where not exists (
          select 1 from unnest(terms) t
          where position(t in lower(p.display_name || ' ' || p.handle)) = 0
        )
        order by (p.collection_public or p.wishlist_public) desc, p.display_name
        limit 20
      ) x), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke execute on function public.search_public(text) from public;
grant execute on function public.search_public(text) to anon, authenticated;

-- Message any member by their public name (found in search), not only members with a public list.
create or replace function public.message_recipient(p_handle text)
returns table (user_id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select p.user_id, p.display_name
  from public.public_profiles p
  where p.handle = lower(trim(p_handle));
$$;
revoke execute on function public.message_recipient(text) from public, anon;
grant execute on function public.message_recipient(text) to authenticated;
