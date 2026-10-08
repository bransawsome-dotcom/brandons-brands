-- Shareable collection and wishlist links for brandonsbrands17.com.
-- A member turns sharing on for their collection or wishlist and gets a private link.
-- Anyone with the link sees a read-only view. Prices paid / target prices and notes are
-- only included if the member chooses. Emails are never shared.

create table if not exists public.share_links (
  token text primary key default replace(gen_random_uuid()::text, '-', ''),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('collection', 'wishlist')),
  show_paid boolean not null default false,
  show_notes boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, kind)
);

alter table public.share_links enable row level security;
create policy "see own share links" on public.share_links for select to authenticated using (user_id = auth.uid());
create policy "create own share links" on public.share_links for insert to authenticated with check (user_id = auth.uid());
create policy "change own share links" on public.share_links for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "stop own share links" on public.share_links for delete to authenticated using (user_id = auth.uid());
-- Members can only switch the two privacy options on an existing link.
revoke update on public.share_links from anon, authenticated;
grant update (show_paid, show_notes) on public.share_links to authenticated;

-- What a shared link shows. Only works with an exact, active link token.
create or replace function public.get_shared(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  l public.share_links;
  owner_name text;
  items jsonb;
begin
  select * into l from public.share_links where token = p_token;
  if not found then
    return null;
  end if;

  select coalesce(nullif(trim(raw_user_meta_data ->> 'account_name'), ''), nullif(trim(raw_user_meta_data ->> 'display_name'), ''), 'A collector')
    into owner_name from auth.users where id = l.user_id;

  if l.kind = 'collection' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', w.id, 'brand', w.brand, 'model', w.model, 'reference_number', w.reference_number,
      'nickname', w.nickname, 'image_url', w.image_url, 'condition', w.condition,
      'estimated_value', w.estimated_value, 'retail_price', w.retail_price, 'current_retail_price', w.current_retail_price,
      'details', w.details, 'has_box', w.has_box, 'has_papers', w.has_papers,
      'authenticated', w.authenticated, 'authenticated_by', w.authenticated_by,
      'purchase_date', case when l.show_paid then w.purchase_date end,
      'purchase_price', case when l.show_paid then w.purchase_price end,
      'notes', case when l.show_notes then w.notes end
    ) order by w.brand, w.model), '[]'::jsonb)
    into items from public.watches w where w.user_id = l.user_id;
  else
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'brand', i.brand, 'model', i.model, 'reference_number', i.reference_number,
      'image_url', i.image_url, 'priority', i.priority,
      'market_value', i.current_market_price, 'retail_price', i.retail_price, 'details', i.details,
      'target_price', case when l.show_paid then i.target_price end,
      'notes', case when l.show_notes then i.notes end
    ) order by case i.priority when 'High' then 0 when 'Medium' then 1 else 2 end, i.brand, i.model), '[]'::jsonb)
    into items from public.wishlist i where i.user_id = l.user_id;
  end if;

  return jsonb_build_object('kind', l.kind, 'owner_name', owner_name, 'show_paid', l.show_paid, 'show_notes', l.show_notes, 'items', items);
end;
$$;
grant execute on function public.get_shared(text) to anon, authenticated;
