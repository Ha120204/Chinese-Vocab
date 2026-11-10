-- Run in Supabase SQL Editor as the project owner. Keep private out of API exposed schemas.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;

create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  word_id text not null,
  display_name text not null check (char_length(display_name) between 1 and 40),
  body text not null check (char_length(body) between 5 and 1000),
  status text not null default 'published' check (status in ('published','hidden')),
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now()
);
create index if not exists tips_word_public_order on public.tips (word_id, status, likes_count desc, created_at desc);

create table if not exists public.word_comments (
  id uuid primary key default gen_random_uuid(),
  word_id text not null,
  display_name text not null check (char_length(display_name) between 1 and 40),
  body text not null check (char_length(body) between 2 and 1000),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index if not exists comments_word_public_order on public.word_comments (word_id, status, created_at desc);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 40),
  title text not null check (char_length(title) between 10 and 160),
  body text not null check (char_length(body) between 10 and 3000),
  category text not null check (category in ('hsk1','hanzi','pronunciation','grammar','other')),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index if not exists questions_public_order on public.questions (status, created_at desc);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  body text not null check (char_length(body) between 2 and 3000),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index if not exists answers_question_public_order on public.answers (question_id, status, created_at asc);

create table if not exists private.tip_likes (
  tip_id uuid not null references public.tips(id) on delete cascade,
  browser_hash text not null check (browser_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  primary key (tip_id, browser_hash)
);
create table if not exists private.content_actors (
  content_type text not null check (content_type in ('tip','word_comment','question','answer')),
  content_id uuid not null,
  browser_hash text not null check (browser_hash ~ '^[0-9a-f]{64}$'),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  primary key (content_type, content_id)
);
create index if not exists content_actors_browser_idx on private.content_actors (browser_hash);

create table if not exists private.rate_buckets (
  bucket_key text primary key,
  attempts integer not null default 0 check (attempts >= 0),
  expires_at timestamptz not null
);
create index if not exists rate_buckets_expires_idx on private.rate_buckets (expires_at);

create table if not exists private.reports (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('tip','word_comment','question','answer')),
  content_id uuid not null,
  reason text not null check (reason in ('spam','abuse','copyright','other')),
  details text not null default '' check (char_length(details) <= 1000),
  browser_hash text not null check (browser_hash ~ '^[0-9a-f]{64}$'),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);
create index if not exists reports_created_idx on private.reports (created_at desc);

alter table public.tips enable row level security;
alter table public.word_comments enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table private.tip_likes enable row level security;
alter table private.content_actors enable row level security;
alter table private.rate_buckets enable row level security;
alter table private.reports enable row level security;

drop policy if exists tips_published_read on public.tips;
create policy tips_published_read on public.tips for select to anon, authenticated using (status = 'published');
drop policy if exists comments_published_read on public.word_comments;
create policy comments_published_read on public.word_comments for select to anon, authenticated using (status = 'published');
drop policy if exists questions_published_read on public.questions;
create policy questions_published_read on public.questions for select to anon, authenticated using (status = 'published');
drop policy if exists answers_published_read on public.answers;
create policy answers_published_read on public.answers for select to anon, authenticated using (
  status = 'published' and exists (select 1 from public.questions q where q.id = question_id and q.status = 'published')
);

revoke all on public.tips, public.word_comments, public.questions, public.answers from public, anon, authenticated;
grant select on public.tips, public.word_comments, public.questions, public.answers to anon, authenticated;
grant select, insert, update, delete on public.tips, public.word_comments, public.questions, public.answers to service_role;
revoke all on all tables in schema private from public, anon, authenticated, service_role;

-- An exception subtransaction rolls back both bucket increments when either limit is hit.
create or replace function public.community_rate_limit(
  p_action text, p_browser_hash text, p_ip_hash text,
  p_browser_limit integer, p_ip_limit integer, p_window_seconds integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_window bigint;
  v_expiry timestamptz;
  v_key text;
  v_count integer;
begin
  if p_action !~ '^[a-z_]{1,30}$' or p_browser_hash !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$'
     or p_browser_limit not between 1 and 100 or p_ip_limit not between 1 and 500
     or p_window_seconds not between 60 and 86400 then
    raise exception 'invalid_rate_limit_arguments';
  end if;
  v_window := floor(extract(epoch from now()) / p_window_seconds)::bigint;
  v_expiry := to_timestamp((v_window + 1) * p_window_seconds);
  foreach v_key in array array[
    p_action || ':browser:' || p_browser_hash || ':' || v_window,
    p_action || ':ip:' || p_ip_hash || ':' || v_window
  ] loop
    insert into private.rate_buckets (bucket_key, attempts, expires_at)
    values (v_key, 1, v_expiry)
    on conflict (bucket_key) do update set attempts = private.rate_buckets.attempts + 1
    where private.rate_buckets.attempts < case when v_key like '%:browser:%' then p_browser_limit else p_ip_limit end
    returning attempts into v_count;
    if v_count is null then raise exception 'rate_limited' using errcode = 'P0001'; end if;
    v_count := null;
  end loop;
  return true;
exception when sqlstate 'P0001' then
  return false;
end;
$$;

create or replace function public.community_record_actor(
  p_content_type text, p_content_id uuid, p_browser_hash text, p_ip_hash text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into private.content_actors (content_type, content_id, browser_hash, ip_hash)
  values (p_content_type, p_content_id, p_browser_hash, p_ip_hash);
end;
$$;

create or replace function public.community_toggle_tip_like(p_tip_id uuid, p_browser_hash text)
returns table(liked boolean, likes_count integer) language plpgsql security definer set search_path = '' as $$
declare v_count integer; v_liked boolean;
begin
  select t.likes_count into v_count from public.tips t where t.id = p_tip_id and t.status = 'published' for update;
  if not found then raise exception 'tip_not_found'; end if;
  if exists (select 1 from private.tip_likes l where l.tip_id = p_tip_id and l.browser_hash = p_browser_hash) then
    delete from private.tip_likes where tip_id = p_tip_id and browser_hash = p_browser_hash;
    v_liked := false;
    v_count := greatest(0, v_count - 1);
  else
    insert into private.tip_likes (tip_id, browser_hash) values (p_tip_id, p_browser_hash);
    v_liked := true;
    v_count := v_count + 1;
  end if;
  update public.tips set likes_count = v_count where id = p_tip_id;
  return query select v_liked, v_count;
end;
$$;

create or replace function public.community_tip_like_state(p_tip_id uuid, p_browser_hash text)
returns boolean language sql security definer set search_path = '' as $$
  select exists (select 1 from private.tip_likes l join public.tips t on t.id = l.tip_id
    where l.tip_id = p_tip_id and l.browser_hash = p_browser_hash and t.status = 'published');
$$;

create or replace function public.community_create_report(
  p_content_type text, p_content_id uuid, p_reason text, p_details text,
  p_browser_hash text, p_ip_hash text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_exists boolean; v_id uuid;
begin
  case p_content_type
    when 'tip' then select exists(select 1 from public.tips where id=p_content_id and status='published') into v_exists;
    when 'word_comment' then select exists(select 1 from public.word_comments where id=p_content_id and status='published') into v_exists;
    when 'question' then select exists(select 1 from public.questions where id=p_content_id and status='published') into v_exists;
    when 'answer' then select exists(select 1 from public.answers where id=p_content_id and status='published') into v_exists;
    else raise exception 'invalid_content_type';
  end case;
  if not v_exists then raise exception 'content_not_found'; end if;
  insert into private.reports (content_type, content_id, reason, details, browser_hash, ip_hash)
  values (p_content_type, p_content_id, p_reason, coalesce(p_details,''), p_browser_hash, p_ip_hash)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.community_health_and_prune()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_deleted integer;
begin
  perform 1 from public.questions limit 1;
  delete from private.rate_buckets where expires_at < now();
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke execute on function public.community_rate_limit(text,text,text,integer,integer,integer) from public, anon, authenticated;
revoke execute on function public.community_record_actor(text,uuid,text,text) from public, anon, authenticated;
revoke execute on function public.community_toggle_tip_like(uuid,text) from public, anon, authenticated;
revoke execute on function public.community_tip_like_state(uuid,text) from public, anon, authenticated;
revoke execute on function public.community_create_report(text,uuid,text,text,text,text) from public, anon, authenticated;
revoke execute on function public.community_health_and_prune() from public, anon, authenticated;
grant execute on function public.community_rate_limit(text,text,text,integer,integer,integer) to service_role;
grant execute on function public.community_record_actor(text,uuid,text,text) to service_role;
grant execute on function public.community_toggle_tip_like(uuid,text) to service_role;
grant execute on function public.community_tip_like_state(uuid,text) to service_role;
grant execute on function public.community_create_report(text,uuid,text,text,text,text) to service_role;
grant execute on function public.community_health_and_prune() to service_role;

commit;
