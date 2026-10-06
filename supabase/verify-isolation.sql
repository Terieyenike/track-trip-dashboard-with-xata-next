-- Run after the migration. Transaction rolls back all temporary users and records.
begin;
insert into auth.users(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',true);
select * from public.save_travel_workspace('{"trips":[],"notes":[]}',0);
do $$ declare allowed boolean; begin
  for counter in 1..20 loop
    allowed := public.consume_travel_request('photo-upload');
    if not allowed then raise exception 'FAIL: valid upload limit was rejected'; end if;
  end loop;
  if public.consume_travel_request('photo-upload') then raise exception 'FAIL: excessive upload was allowed'; end if;
end $$;
do $$ begin
  begin
    insert into public.travel_workspaces(owner_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    raise exception 'FAIL: account A could insert account B workspace';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_travel_workspace('{"trips":[],"notes":[]}',0);
    raise exception 'FAIL: stale revision overwrote workspace';
  exception when serialization_failure then null;
  end;
end $$;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
do $$ begin
  if exists(select 1 from public.travel_workspaces) then raise exception 'FAIL: account B could read account A workspace'; end if;
  update public.travel_workspaces set revision=99 where owner_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if found then raise exception 'FAIL: account B could update account A workspace'; end if;
end $$;
select * from public.save_travel_workspace('{"trips":[],"notes":[]}',0);
reset role;
set local role anon;
do $$ begin
  begin
    perform 1 from public.travel_workspaces;
    raise exception 'FAIL: anonymous read succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;

select 'PASS: owner isolation, foreign writes, stale revisions, upload limits, anonymous access' as verification;
