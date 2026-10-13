-- Members' favorite brands (picked in the welcome tour or on the Account page), remembered across devices.
-- Private: only the member can read their own row (existing "see own public profile" policy).
-- Changes go through set_favorite_brands, like every other public_profiles change.

alter table public.public_profiles
  add column if not exists favorite_brands text[] not null default '{}';

create or replace function public.set_favorite_brands(p_brands text[]) returns text[]
language plpgsql security definer set search_path = public as $$
declare
  cleaned text[];
begin
  if auth.uid() is null then raise exception 'Please log in.'; end if;
  select coalesce(array_agg(b order by ord), '{}') into cleaned
  from (
    select distinct on (lower(trim(x))) left(trim(x), 40) as b, ord
    from unnest(coalesce(p_brands, '{}')) with ordinality as t(x, ord)
    where char_length(trim(x)) between 1 and 40
    order by lower(trim(x)), ord
  ) s;
  if array_length(cleaned, 1) > 30 then cleaned := cleaned[1:30]; end if;
  update public.public_profiles set favorite_brands = cleaned, updated_at = now() where user_id = auth.uid();
  return cleaned;
end;
$$;
revoke execute on function public.set_favorite_brands(text[]) from public, anon;
grant execute on function public.set_favorite_brands(text[]) to authenticated;
