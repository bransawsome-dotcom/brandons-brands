-- Growth report round 2: newsletter, "Which would you pick?" polls, events with RSVP,
-- the Wrist Check photo wall, and value-over-time history for collection watches.
-- Moderators = rows in public.forum_moderators (Rochelle, Brandon).

create or replace function public.is_site_moderator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.forum_moderators m where m.user_id = auth.uid());
$$;

-- ───────────── Newsletter ─────────────
-- Subscribers are only reachable by the server (service key); nobody can list emails from the browser.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' and char_length(email) <= 200),
  source text check (source is null or char_length(source) <= 40),
  user_id uuid references auth.users(id) on delete set null,
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index if not exists newsletter_subscribers_email_key on public.newsletter_subscribers (lower(email));
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;

create table if not exists public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html text not null,
  recipients integer not null default 0,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now()
);
alter table public.newsletter_issues enable row level security;
revoke all on public.newsletter_issues from anon, authenticated;

-- ───────────── Polls ─────────────
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 3 and 140),
  a_label text not null check (char_length(a_label) between 1 and 80),
  a_image text check (a_image is null or (a_image ~ '^https://' and char_length(a_image) <= 1000)),
  b_label text not null check (char_length(b_label) between 1 and 80),
  b_image text check (b_image is null or (b_image ~ '^https://' and char_length(b_image) <= 1000)),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.polls enable row level security;
drop policy if exists "polls are public" on public.polls;
create policy "polls are public" on public.polls for select to anon, authenticated using (true);
drop policy if exists "moderators manage polls" on public.polls;
create policy "moderators manage polls" on public.polls for all to authenticated
  using (public.is_site_moderator()) with check (public.is_site_moderator());
grant select on public.polls to anon, authenticated;
grant insert, update, delete on public.polls to authenticated;

create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  voter text not null check (char_length(voter) <= 80),
  choice smallint not null check (choice in (0, 1)),
  created_at timestamptz not null default now(),
  primary key (poll_id, voter)
);
alter table public.poll_votes enable row level security;
revoke all on public.poll_votes from anon, authenticated;

-- Vote (members by account, visitors by a random browser id) and get the totals back.
create or replace function public.poll_vote(p_poll uuid, p_choice int, p_voter text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v text := coalesce('u:' || auth.uid()::text, 'v:' || left(coalesce(p_voter, ''), 60));
begin
  if p_choice not in (0, 1) then raise exception 'bad choice'; end if;
  if v = 'v:' then raise exception 'missing voter'; end if;
  if not exists (select 1 from public.polls where id = p_poll and active) then raise exception 'poll closed'; end if;
  insert into public.poll_votes (poll_id, voter, choice) values (p_poll, v, p_choice)
  on conflict (poll_id, voter) do update set choice = excluded.choice, created_at = now();
  return public.poll_results(p_poll, p_voter);
end;
$$;

create or replace function public.poll_results(p_poll uuid, p_voter text default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'a', count(*) filter (where choice = 0),
    'b', count(*) filter (where choice = 1),
    'mine', (select choice from public.poll_votes
             where poll_id = p_poll and voter = coalesce('u:' || auth.uid()::text, 'v:' || left(coalesce(p_voter, ''), 60)))
  )
  from public.poll_votes where poll_id = p_poll;
$$;
grant execute on function public.poll_vote(uuid, int, text) to anon, authenticated;
grant execute on function public.poll_results(uuid, text) to anon, authenticated;

-- ───────────── Events ─────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text check (location is null or char_length(location) <= 160),
  description text check (description is null or char_length(description) <= 2000),
  link text check (link is null or (link ~ '^https://' and char_length(link) <= 500)),
  online boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists events_starts_idx on public.events (starts_at);
alter table public.events enable row level security;
drop policy if exists "events are public" on public.events;
create policy "events are public" on public.events for select to anon, authenticated using (true);
drop policy if exists "moderators manage events" on public.events;
create policy "moderators manage events" on public.events for all to authenticated
  using (public.is_site_moderator()) with check (public.is_site_moderator());
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
alter table public.event_rsvps enable row level security;
drop policy if exists "see own rsvps" on public.event_rsvps;
create policy "see own rsvps" on public.event_rsvps for select to authenticated using (user_id = auth.uid() or public.is_site_moderator());
drop policy if exists "rsvp yourself" on public.event_rsvps;
create policy "rsvp yourself" on public.event_rsvps for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "cancel own rsvp" on public.event_rsvps;
create policy "cancel own rsvp" on public.event_rsvps for delete to authenticated using (user_id = auth.uid());
grant select, insert, delete on public.event_rsvps to authenticated;

create or replace function public.event_rsvp_counts() returns table (event_id uuid, going bigint)
language sql stable security definer set search_path = public as $$
  select event_id, count(*) from public.event_rsvps group by event_id;
$$;
grant execute on function public.event_rsvp_counts() to anon, authenticated;

-- ───────────── Wrist Check (daily wrist-shot wall) ─────────────
create table if not exists public.wrist_shots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Member',
  image text not null check (image ~ '^data:image/(jpeg|png|webp);base64,' and char_length(image) <= 700000),
  watch text check (watch is null or char_length(watch) <= 100),
  caption text check (caption is null or char_length(caption) <= 280),
  featured_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists wrist_shots_created_idx on public.wrist_shots (created_at desc);
alter table public.wrist_shots enable row level security;
drop policy if exists "wrist shots are public" on public.wrist_shots;
create policy "wrist shots are public" on public.wrist_shots for select to anon, authenticated using (true);
drop policy if exists "post own wrist shot" on public.wrist_shots;
create policy "post own wrist shot" on public.wrist_shots for insert to authenticated with check (user_id = auth.uid() and featured_at is null);
drop policy if exists "remove own wrist shot" on public.wrist_shots;
create policy "remove own wrist shot" on public.wrist_shots for delete to authenticated using (user_id = auth.uid() or public.is_site_moderator());
drop policy if exists "moderators feature wrist shots" on public.wrist_shots;
create policy "moderators feature wrist shots" on public.wrist_shots for update to authenticated
  using (public.is_site_moderator()) with check (public.is_site_moderator());
grant select on public.wrist_shots to anon, authenticated;
grant insert, update, delete on public.wrist_shots to authenticated;

-- Name comes from the member's public profile (not from the browser), and at most 3 posts a day.
create or replace function public.wrist_shot_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select coalesce(p.display_name, 'Member') into new.display_name from public.public_profiles p where p.user_id = new.user_id;
  new.display_name := coalesce(new.display_name, 'Member');
  if (select count(*) from public.wrist_shots where user_id = new.user_id and created_at > now() - interval '1 day') >= 3 then
    raise exception 'You can post up to 3 wrist shots a day.';
  end if;
  return new;
end;
$$;
drop trigger if exists wrist_shot_before_insert on public.wrist_shots;
create trigger wrist_shot_before_insert before insert on public.wrist_shots
  for each row execute function public.wrist_shot_before_insert();

-- ───────────── Value history (for value-over-time charts) ─────────────
create table if not exists public.watch_value_history (
  watch_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric not null,
  recorded_on date not null default (now() at time zone 'America/New_York')::date,
  primary key (watch_id, recorded_on)
);
create index if not exists watch_value_history_user_idx on public.watch_value_history (user_id, recorded_on);
alter table public.watch_value_history enable row level security;
drop policy if exists "see own value history" on public.watch_value_history;
create policy "see own value history" on public.watch_value_history for select to authenticated using (user_id = auth.uid());
grant select on public.watch_value_history to authenticated;

-- Every time a watch's estimated value is set or changes, keep that day's value.
create or replace function public.watch_value_snapshot() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v numeric := nullif(regexp_replace(coalesce(new.estimated_value::text, ''), '[^0-9.]', '', 'g'), '')::numeric;
begin
  if v is not null and v > 0 then
    insert into public.watch_value_history (watch_id, user_id, value) values (new.id::text, new.user_id, v)
    on conflict (watch_id, recorded_on) do update set value = excluded.value;
  end if;
  return new;
exception when others then
  return new; -- never block saving a watch because of the history
end;
$$;
drop trigger if exists watch_value_snapshot on public.watches;
create trigger watch_value_snapshot after insert or update of estimated_value on public.watches
  for each row execute function public.watch_value_snapshot();

-- Start the history with today's values.
insert into public.watch_value_history (watch_id, user_id, value)
select w.id::text, w.user_id, nullif(regexp_replace(coalesce(w.estimated_value::text, ''), '[^0-9.]', '', 'g'), '')::numeric
from public.watches w
where nullif(regexp_replace(coalesce(w.estimated_value::text, ''), '[^0-9.]', '', 'g'), '') is not null
on conflict do nothing;

-- A first poll, so the page isn't empty.
insert into public.polls (question, a_label, b_label)
select 'Which would you wear this weekend?', 'Green dial', 'Blue dial'
where not exists (select 1 from public.polls);

select (select count(*) from public.watch_value_history) as value_snapshots,
       (select count(*) from public.polls) as polls;
