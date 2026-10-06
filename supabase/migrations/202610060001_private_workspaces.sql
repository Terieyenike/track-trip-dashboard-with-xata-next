-- Atomic migration: any failure leaves the previous database unchanged.
begin;

-- Run once against the chosen Supabase project. No service-role key is required by the app.
create table public.travel_workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"trips":[],"notes":[]}'::jsonb,
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  constraint workspace_shape check (
    data ?& array['trips','notes'] and jsonb_typeof(data) = 'object' and jsonb_typeof(data->'trips') = 'array'
    and jsonb_typeof(data->'notes') = 'array' and octet_length(data::text) <= 8388608
  )
);
alter table public.travel_workspaces enable row level security;
revoke all on public.travel_workspaces from public, anon, authenticated;
grant select, insert, update on public.travel_workspaces to authenticated;
create policy "Read own workspace" on public.travel_workspaces for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Create own workspace" on public.travel_workspaces for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Update own workspace" on public.travel_workspaces for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- Transactional compare-and-swap prevents silent overwrite from another tab or device.
create function public.save_travel_workspace(next_data jsonb, expected_revision bigint)
returns table(data jsonb, revision bigint)
language plpgsql security invoker set search_path = '' as $$
declare current_revision bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  insert into public.travel_workspaces(owner_id) values(auth.uid()) on conflict(owner_id) do nothing;
  select w.revision into current_revision from public.travel_workspaces w where w.owner_id = auth.uid() for update;
  if current_revision <> expected_revision then raise exception 'Workspace changed' using errcode = '40001'; end if;
  return query update public.travel_workspaces w set data = next_data, revision = current_revision + 1, updated_at = now()
    where w.owner_id = auth.uid() returning w.data, w.revision;
end;
$$;
revoke all on function public.save_travel_workspace(jsonb,bigint) from public, anon;
grant execute on function public.save_travel_workspace(jsonb,bigint) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('travel-photos','travel-photos',false,2097152,array['image/jpeg','image/png','image/webp','image/gif']);
create policy "Read own trip photos" on storage.objects for select to authenticated using (bucket_id = 'travel-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Upload own trip photos" on storage.objects for insert to authenticated with check (bucket_id = 'travel-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- No public URLs, overwrite permissions, or bucket listing permissions are granted.

-- Existing permissive policies in a shared project cannot broaden access to this bucket.
create policy "Enforce private travel photo ownership" on storage.objects as restrictive for all to public
using (bucket_id <> 'travel-photos' or (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id <> 'travel-photos' or (storage.foldername(name))[1] = (select auth.uid())::text);

-- Shared account-level abuse limits, independent of server instance count.
create table public.travel_request_limits (
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('workspace-write','photo-upload')),
  window_start timestamptz not null,
  hits integer not null,
  primary key(owner_id,kind)
);
alter table public.travel_request_limits enable row level security;
revoke all on public.travel_request_limits from public,anon,authenticated;
create function public.consume_travel_request(request_kind text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare limit_count integer; window_size interval; used integer;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if request_kind = 'workspace-write' then limit_count := 120; window_size := interval '1 minute';
  elsif request_kind = 'photo-upload' then limit_count := 20; window_size := interval '1 hour';
  else raise exception 'Invalid request kind' using errcode = '22023'; end if;
  insert into public.travel_request_limits as limits(owner_id,kind,window_start,hits)
  values(auth.uid(),request_kind,now(),1)
  on conflict(owner_id,kind) do update set
    hits = case when limits.window_start <= now() - window_size then 1 else least(limits.hits + 1, limit_count + 1) end,
    window_start = case when limits.window_start <= now() - window_size then now() else limits.window_start end
  returning hits into used;
  return used <= limit_count;
end;
$$;
revoke all on function public.consume_travel_request(text) from public,anon;
grant execute on function public.consume_travel_request(text) to authenticated;

commit;
