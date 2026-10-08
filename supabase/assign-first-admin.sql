-- Replace admin@example.com with the intended confirmed account after approving access.
-- Existing app login required; this creates no credentials or service-role keys.
do $$
declare chosen_id uuid;
begin
 select id into strict chosen_id from auth.users where lower(email)='admin@example.com' and email_confirmed_at is not null;
 insert into public.travel_admins(user_id) values(chosen_id) on conflict do nothing;
end;$$;
