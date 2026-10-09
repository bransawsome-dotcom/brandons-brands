-- Inbox messages, version 2.
--
-- * Messages get a subject (picked from a list, or "Other" with your own words).
-- * Members can message anyone they find on the Collectors pages (a public collection or wishlist),
--   not only people from the forum. Recipients are looked up by their public handle, so nobody's
--   email or account details are ever shown.
-- * Light spam limits: at most 20 messages per 10 minutes, and at most 15 new people per day.

alter table public.messages add column if not exists subject text;
alter table public.messages drop constraint if exists messages_subject_length;
alter table public.messages add constraint messages_subject_length
  check (subject is null or char_length(subject) between 1 and 100);

-- Who a "Message" button on a public list goes to: members with a public collection or wishlist.
create or replace function public.message_recipient(p_handle text)
returns table (user_id uuid, display_name text)
language sql stable security definer set search_path = public as $$
  select p.user_id, p.display_name
  from public.public_profiles p
  where p.handle = lower(trim(p_handle))
    and (p.collection_public or p.wishlist_public);
$$;
revoke execute on function public.message_recipient(text) from public, anon;
grant execute on function public.message_recipient(text) to authenticated;

-- Spam limits, checked on every new message.
create or replace function public.messages_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.messages
      where sender_id = new.sender_id and created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'rate_limited: You''re sending messages too quickly. Please wait a few minutes.';
  end if;
  -- Starting a conversation with someone new (they've never messaged you and you've never messaged them).
  if not exists (select 1 from public.messages
                 where (sender_id = new.sender_id and recipient_id = new.recipient_id)
                    or (sender_id = new.recipient_id and recipient_id = new.sender_id)) then
    if (select count(distinct m.recipient_id) from public.messages m
        where m.sender_id = new.sender_id
          and m.created_at > now() - interval '1 day'
          and not exists (select 1 from public.messages e
                          where e.sender_id = m.recipient_id and e.recipient_id = m.sender_id
                            and e.created_at < m.created_at)
          and not exists (select 1 from public.messages e
                          where e.sender_id = m.sender_id and e.recipient_id = m.recipient_id
                            and e.created_at < now() - interval '1 day')) >= 15 then
      raise exception 'rate_limited: You''ve started a lot of new conversations today. Please try again tomorrow.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit before insert on public.messages
  for each row execute function public.messages_rate_limit();
