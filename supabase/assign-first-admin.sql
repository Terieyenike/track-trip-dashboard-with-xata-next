-- Run only after explicitly approving admin access for this account.
-- Existing app login required; this creates no credentials or service-role keys.
do $$
declare chosen_id uuid;
begin
 select id into strict chosen_id from auth.users where lower(email)='teyenike@duck.com';
 insert into public.travel_admins(user_id) values(chosen_id) on conflict do nothing;
end;$$;
