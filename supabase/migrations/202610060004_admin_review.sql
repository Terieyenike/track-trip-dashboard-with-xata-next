begin;
-- Administrators are assigned only through trusted database management, never signup metadata.
create table public.travel_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.travel_admins enable row level security;
revoke all on public.travel_admins from public,anon,authenticated;
create function public.is_travel_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.travel_admins where user_id=auth.uid());
$$;
revoke all on function public.is_travel_admin() from public,anon;
grant execute on function public.is_travel_admin() to authenticated;
alter table public.travel_stories add column moderation_hidden boolean not null default false;
alter table public.travel_story_reports add column resolution text check(resolution in ('hidden','restored','resolved'));
alter policy "Read published stories" on public.travel_stories using(published and not moderation_hidden);
-- Even direct owner API writes cannot bypass a moderation hold.
create function public.guard_story_moderation() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if current_setting('role',true) in ('authenticated','anon') and not public.is_travel_admin() then
  if (tg_op='INSERT' and new.moderation_hidden) or (tg_op='UPDATE' and new.moderation_hidden is distinct from old.moderation_hidden) then
   raise exception 'Moderation access required' using errcode='42501';
  end if;
  if new.moderation_hidden and new.published then raise exception 'Story is held for review' using errcode='42501';end if;
 end if;
 return new;
end;$$;
create trigger protect_story_moderation before insert or update on public.travel_stories for each row execute function public.guard_story_moderation();
revoke all on function public.guard_story_moderation() from public,anon,authenticated;
create function public.guard_report_review() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if current_setting('role',true) in ('authenticated','anon') and not public.is_travel_admin() and (new.reviewed_at is not null or new.resolution is not null) then raise exception 'Review access required' using errcode='42501';end if;
 return new;
end;$$;
create trigger protect_report_review before insert or update on public.travel_story_reports for each row execute function public.guard_report_review();
revoke all on function public.guard_report_review() from public,anon,authenticated;
create table public.travel_moderation_audit (
 id uuid primary key default gen_random_uuid(),
 admin_id uuid not null references auth.users(id),
 report_id uuid not null references public.travel_story_reports(id),
 story_id uuid not null references public.travel_stories(id),
 action text not null check(action in ('hide','restore','resolve')),
 note text not null check(length(note) between 1 and 1000),
 created_at timestamptz not null default now()
);
alter table public.travel_moderation_audit enable row level security;
revoke all on public.travel_moderation_audit from public,anon,authenticated;
create function public.travel_review_inbox(review_state text default 'open',page_number integer default 0) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.is_travel_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 if review_state not in ('open','reviewed','all') or page_number<0 or page_number>100000 then raise exception 'Invalid review filter';end if;
 select jsonb_build_object(
  'openCount',(select count(*) from public.travel_story_reports where reviewed_at is null),
  'total',(select count(*) from public.travel_story_reports r where review_state='all' or (review_state='open' and r.reviewed_at is null) or (review_state='reviewed' and r.reviewed_at is not null)),
  'reports',coalesce((select jsonb_agg(to_jsonb(q)) from (
   select r.id,r.story_id,r.reason,r.details,r.created_at,r.reviewed_at,r.resolution,s.story,s.published,s.moderation_hidden,
    (select coalesce(jsonb_agg(jsonb_build_object('action',a.action,'note',a.note,'created_at',a.created_at) order by a.created_at desc),'[]'::jsonb) from public.travel_moderation_audit a where a.report_id=r.id) as audit
   from public.travel_story_reports r join public.travel_stories s on s.id=r.story_id
   where review_state='all' or (review_state='open' and r.reviewed_at is null) or (review_state='reviewed' and r.reviewed_at is not null)
   order by r.created_at asc,r.id limit 20 offset page_number*20
  ) q),'[]'::jsonb)
 ) into result;
 return result;
end;$$;
create function public.review_travel_report(target_report uuid,decision text,decision_note text,expected_reviewed_at timestamptz,expected_hidden boolean) returns void
language plpgsql security definer set search_path='' as $$
declare target_story uuid; current_reviewed_at timestamptz; current_hidden boolean;
begin
 if not public.is_travel_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 if decision not in ('hide','restore','resolve') or decision_note is null or length(trim(decision_note)) not between 1 and 1000 then raise exception 'Invalid review decision';end if;
 select story_id,reviewed_at into target_story,current_reviewed_at from public.travel_story_reports where id=target_report for update;
 if target_story is null then raise exception 'Report not found';end if;
 select moderation_hidden into current_hidden from public.travel_stories where id=target_story for update;
 if current_reviewed_at is distinct from expected_reviewed_at or current_hidden is distinct from expected_hidden then raise exception 'Review changed; refresh the inbox' using errcode='40001';end if;
 if decision='hide' then update public.travel_stories set moderation_hidden=true,published=false where id=target_story;
 elsif decision='restore' then update public.travel_stories set moderation_hidden=false,published=false where id=target_story;
 end if;
 update public.travel_story_reports set reviewed_at=now(),resolution=case decision when 'hide' then 'hidden' when 'restore' then 'restored' else 'resolved' end where id=target_report;
 insert into public.travel_moderation_audit(admin_id,report_id,story_id,action,note) values(auth.uid(),target_report,target_story,decision,trim(decision_note));
end;$$;
revoke all on function public.travel_review_inbox(text,integer),public.review_travel_report(uuid,text,text,timestamptz,boolean) from public,anon;
grant execute on function public.travel_review_inbox(text,integer),public.review_travel_report(uuid,text,text,timestamptz,boolean) to authenticated;
commit;
