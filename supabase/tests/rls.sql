-- Run in Supabase SQL Editor after the migration. The transaction always rolls back test rows.
begin;

do $$
declare v_signature text;
begin
  if has_schema_privilege('anon', 'private', 'USAGE')
    or has_schema_privilege('authenticated', 'private', 'USAGE')
    or has_schema_privilege('service_role', 'private', 'USAGE') then
    raise exception 'private schema is directly accessible';
  end if;
  if has_table_privilege('anon', 'public.tips', 'INSERT')
    or has_table_privilege('anon', 'public.word_comments', 'INSERT')
    or has_table_privilege('anon', 'public.questions', 'INSERT')
    or has_table_privilege('anon', 'public.answers', 'INSERT') then
    raise exception 'anon can write a public community table';
  end if;
  foreach v_signature in array array[
    'public.community_rate_limit(text,text,text,integer,integer,integer)',
    'public.community_record_actor(text,uuid,text,text)',
    'public.community_toggle_tip_like(uuid,text)',
    'public.community_tip_like_state(uuid,text)',
    'public.community_create_report(text,uuid,text,text,text,text)',
    'public.community_health_and_prune()'
  ] loop
    if has_function_privilege('anon', v_signature, 'EXECUTE')
      or has_function_privilege('authenticated', v_signature, 'EXECUTE')
      or not has_function_privilege('service_role', v_signature, 'EXECUTE') then
      raise exception 'incorrect RPC permissions: %', v_signature;
    end if;
  end loop;
end;
$$;

insert into public.tips (word_id, display_name, body, status) values
  ('rls-test-word', 'Test', 'Visible test tip', 'published'),
  ('rls-test-word', 'Test', 'Hidden test tip', 'hidden');
insert into public.word_comments (word_id, display_name, body, status) values
  ('rls-test-word', 'Test', 'Visible test comment', 'published'),
  ('rls-test-word', 'Test', 'Hidden test comment', 'hidden');
insert into public.questions (display_name, title, body, category, status) values
  ('Test', 'Visible test question', 'Visible question body', 'hsk1', 'published'),
  ('Test', 'Hidden test question', 'Hidden question body', 'hsk1', 'hidden');
insert into public.answers (question_id, display_name, body, status)
select id, 'Test', 'Visible test answer', 'published' from public.questions where title like '%test question';
insert into public.answers (question_id, display_name, body, status)
select id, 'Test', 'Hidden test answer', 'hidden' from public.questions where title = 'Visible test question';

do $$
declare v_tip uuid; v_liked boolean; v_count integer;
begin
  if not public.community_rate_limit('rlstest', repeat('a',64), repeat('b',64), 1, 1, 60) then
    raise exception 'first rate limit use failed';
  end if;
  if public.community_rate_limit('rlstest', repeat('a',64), repeat('b',64), 1, 1, 60) then
    raise exception 'rate limit allowed a second use';
  end if;
  if (select count(*) from private.rate_buckets where bucket_key like 'rlstest:%' and attempts = 1) <> 2 then
    raise exception 'rate limit did not roll back both bucket increments';
  end if;
  select id into v_tip from public.tips where body = 'Visible test tip';
  select liked, likes_count into v_liked, v_count from public.community_toggle_tip_like(v_tip, repeat('a',64));
  if not v_liked or v_count <> 1 or not public.community_tip_like_state(v_tip, repeat('a',64)) then
    raise exception 'like RPC failed';
  end if;
  select liked, likes_count into v_liked, v_count from public.community_toggle_tip_like(v_tip, repeat('a',64));
  if v_liked or v_count <> 0 then raise exception 'unlike RPC failed'; end if;
end;
$$;

set local role anon;
do $$
begin
  if (select count(*) from public.tips where word_id = 'rls-test-word') <> 1
    or (select count(*) from public.word_comments where word_id = 'rls-test-word') <> 1
    or (select count(*) from public.questions where title like '%test question') <> 1
    or (select count(*) from public.answers where body like '%test answer') <> 1 then
    raise exception 'anon RLS did not expose exactly the published rows';
  end if;
  begin
    perform public.community_health_and_prune();
    raise exception 'anon unexpectedly called privileged RPC';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
rollback;

-- Expected SQL Editor result: Success. No test rows persist.
