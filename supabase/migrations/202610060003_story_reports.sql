begin;
create table public.travel_story_reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references auth.users(id) on delete cascade,
 story_id uuid not null references public.travel_stories(id) on delete cascade,
 reason text not null check(reason in ('Privacy','Harassment','Misleading content','Spam','Other')),
 details text not null default '' check(length(details)<=1000),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 unique(reporter_id,story_id)
);
alter table public.travel_story_reports enable row level security;
revoke all on public.travel_story_reports from public,anon,authenticated;
grant select,insert on public.travel_story_reports to authenticated;
create policy "Read own reports" on public.travel_story_reports for select to authenticated using((select auth.uid())=reporter_id);
create policy "Report a published story" on public.travel_story_reports for insert to authenticated with check((select auth.uid())=reporter_id and exists(select 1 from public.travel_stories s where s.id=story_id and s.published));
commit;
