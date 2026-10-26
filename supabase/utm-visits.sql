-- Free UTM tracking for brandonsbrands17.com.
-- Vercel's UTM report needs a paid add-on, so the site saves the UTM tags itself:
-- one row per visit that lands with utm_* tags (or on a /from/<platform> page).
-- Rows are written only by the site's server (service key). Moderators read totals on /traffic.
-- Run once in the Supabase SQL editor.

create table if not exists public.utm_visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  source text not null default '',
  medium text not null default '',
  campaign text not null default '',
  content text not null default '',
  term text not null default '',
  landing_path text not null default '',
  referrer_host text not null default ''
);
create index if not exists utm_visits_created_idx on public.utm_visits (created_at desc);

alter table public.utm_visits enable row level security;
-- No policies: visitors and members can't read or write this table directly.
revoke all on public.utm_visits from anon, authenticated;
