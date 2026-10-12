-- Saved lists of versions (sub-models and references) for each brand + model, so the "Version" dropdown on
-- Collection and Wishlist is instant after the first lookup. Written only by the server; readable by anyone.
create table if not exists public.watch_variants (
  brand_key text not null,
  model_key text not null,
  brand text not null,
  model text not null,
  variants jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (brand_key, model_key)
);
alter table public.watch_variants enable row level security;
drop policy if exists "watch variants are public" on public.watch_variants;
create policy "watch variants are public" on public.watch_variants for select to anon, authenticated using (true);
revoke insert, update, delete on public.watch_variants from anon, authenticated;

select count(*) as saved_lists from public.watch_variants;
