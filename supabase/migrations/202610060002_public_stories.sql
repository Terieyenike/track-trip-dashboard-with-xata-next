-- Separate opt-in snapshots: private workspaces and photos remain private.
begin;
create table public.travel_stories (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 trip_id text not null check(length(trip_id) between 1 and 150),
 story jsonb not null check(jsonb_typeof(story) = 'object' and octet_length(story::text) <= 350000),
 published boolean not null default false,
 published_at timestamptz not null default now(),
 unique(owner_id,trip_id)
);
alter table public.travel_stories enable row level security;
revoke all on public.travel_stories from public,anon,authenticated;
grant select(id,story,published_at,published) on public.travel_stories to anon;
grant select,insert,update on public.travel_stories to authenticated;
create policy "Read published stories" on public.travel_stories for select to anon,authenticated using(published);
create policy "Read own story drafts" on public.travel_stories for select to authenticated using((select auth.uid())=owner_id);
create policy "Create own story" on public.travel_stories for insert to authenticated with check((select auth.uid())=owner_id);
create policy "Manage own story" on public.travel_stories for update to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create index travel_stories_published_date on public.travel_stories(published_at desc) where published;
commit;
