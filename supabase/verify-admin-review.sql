begin;
insert into auth.users(id) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
insert into public.travel_admins(user_id) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
insert into public.travel_stories(id,owner_id,trip_id,story,published) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd',auth.uid(),'admin-test','{}',true);
do $$ begin
 if public.is_travel_admin() then raise exception 'FAIL: non-admin recognized';end if;
 begin perform public.travel_review_inbox();raise exception 'FAIL: non-admin inbox';exception when insufficient_privilege then null;end;
 begin insert into public.travel_admins(user_id) values(auth.uid());raise exception 'FAIL: self promotion';exception when insufficient_privilege then null;end;
 begin insert into public.travel_story_reports(reporter_id,story_id,reason,reviewed_at) values(auth.uid(),'dddddddd-dddd-4ddd-8ddd-dddddddddddd','Spam',now());raise exception 'FAIL: forged reviewed report';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claims','{"sub":"cccccccc-cccc-4ccc-8ccc-cccccccccccc","role":"authenticated"}',true);
insert into public.travel_story_reports(id,reporter_id,story_id,reason,created_at) values('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',auth.uid(),'dddddddd-dddd-4ddd-8ddd-dddddddddddd','Spam','1970-01-01');
select set_config('request.jwt.claims','{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',true);
select public.review_travel_report('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','hide','Test hide',null,false);
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
do $$ begin
 begin update public.travel_stories set published=true where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';raise exception 'FAIL: author republished hidden story';exception when insufficient_privilege then null;end;
 begin update public.travel_stories set moderation_hidden=false where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';raise exception 'FAIL: author lifted hold';exception when insufficient_privilege then null;end;
end $$;
reset role;set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin if exists(select id from public.travel_stories where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd') then raise exception 'FAIL: hidden story public';end if;end $$;
reset role;set local role authenticated;
select set_config('request.jwt.claims','{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}',true);
do $$ declare item jsonb;stamp timestamptz;begin
 select r into item from jsonb_array_elements(public.travel_review_inbox('all',0)->'reports') r where r->>'id'='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
 if item is null or jsonb_array_length(item->'audit')<>1 then raise exception 'FAIL: missing audit';end if;
 stamp:=(item->>'reviewed_at')::timestamptz;
 begin perform public.review_travel_report('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','restore','Stale decision',null,true);raise exception 'FAIL: stale review accepted';exception when serialization_failure then null;end;
 perform public.review_travel_report('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','restore','Test restore',stamp,true);
end $$;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
do $$ begin if exists(select id from public.travel_stories where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd' and (published or moderation_hidden)) then raise exception 'FAIL: restore automatically published';end if;end $$;
update public.travel_stories set published=true where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
rollback;
select 'PASS: admin checks, self-promotion blocked, hide enforcement, report review guard, audit, stale decisions, restore' as verification;
