create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  team_name text not null,
  team_size text not null check (team_size in ('solo', 'duo', 'trio', 'squad')),
  participant_type text not null check (participant_type in ('student', 'professional')),
  lead_name text not null,
  lead_email text not null,
  lead_phone text not null,
  lead_linkedin text not null,
  lead_repost_url text not null,
  lead_affiliation text not null,
  lead_note text not null default '',
  members_snapshot jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'disapproved')),
  admin_notes text not null default '',
  reviewed_at timestamptz,
  reviewed_by text
);

create table if not exists public.registration_members (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  role text not null check (role in ('lead', 'member')),
  member_order int not null check (member_order >= 1),
  full_name text not null,
  email text not null,
  linkedin_url text not null,
  repost_url text not null,
  affiliation text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists registrations_team_name_unique
  on public.registrations (lower(team_name));

create unique index if not exists registration_members_email_unique
  on public.registration_members (lower(email));

create unique index if not exists registration_members_registration_member_order_unique
  on public.registration_members (registration_id, member_order);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists registrations_touch_updated_at on public.registrations;
create trigger registrations_touch_updated_at
before update on public.registrations
for each row
execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.require_admin()
returns void
language plpgsql
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
end;
$$;

create or replace function public.submit_registration(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registration_id uuid;
  v_team_name text := nullif(btrim(payload->>'team_name'), '');
  v_team_size text := lower(nullif(btrim(payload->>'team_size'), ''));
  v_participant_type text := lower(nullif(btrim(payload->>'participant_type'), ''));
  v_lead_name text := nullif(btrim(payload->>'lead_name'), '');
  v_lead_email text := lower(nullif(btrim(payload->>'lead_email'), ''));
  v_lead_phone text := nullif(btrim(payload->>'lead_phone'), '');
  v_lead_linkedin text := nullif(btrim(payload->>'lead_linkedin'), '');
  v_lead_repost_url text := nullif(btrim(payload->>'lead_repost_url'), '');
  v_lead_affiliation text := coalesce(nullif(btrim(payload->>'lead_affiliation'), ''), '');
  v_lead_note text := coalesce(nullif(btrim(payload->>'lead_note'), ''), '');
  v_members jsonb := coalesce(payload->'members', '[]'::jsonb);
  v_expected_count int;
  v_member_count int;
  v_distinct_count int;
begin
  if v_team_name is null or v_team_size is null or v_participant_type is null then
    raise exception 'Missing required registration fields';
  end if;

  if v_team_size not in ('solo', 'duo', 'trio', 'squad') then
    raise exception 'Invalid team size';
  end if;

  if v_participant_type not in ('student', 'professional') then
    raise exception 'Invalid participant type';
  end if;

  v_expected_count := case v_team_size
    when 'solo' then 1
    when 'duo' then 2
    when 'trio' then 3
    when 'squad' then 4
  end;

  v_member_count := jsonb_array_length(v_members);
  if v_member_count <> v_expected_count then
    raise exception 'Member count does not match team size';
  end if;

  if exists (
    select 1
    from public.registrations
    where lower(team_name) = lower(v_team_name)
  ) then
    raise exception 'Team name already exists';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(v_members) as m("fullName" text, email text, "linkedinUrl" text, "repostUrl" text)
    where coalesce(lower(email), '') = ''
       or coalesce(btrim("fullName"), '') = ''
       or coalesce(btrim("linkedinUrl"), '') = ''
       or coalesce(btrim("repostUrl"), '') = ''
  ) then
    raise exception 'Every participant must have complete details';
  end if;

  select count(distinct lower(email)), count(*)
    into v_distinct_count, v_member_count
  from jsonb_to_recordset(v_members) as m(email text);

  if v_distinct_count <> v_member_count then
    raise exception 'Duplicate participant emails are not allowed';
  end if;

  if exists (
    select 1
    from public.registration_members
    where lower(email) in (
      select lower(email)
      from jsonb_to_recordset(v_members) as m(email text)
    )
  ) then
    raise exception 'One or more participant emails already exist';
  end if;

  insert into public.registrations (
    team_name,
    team_size,
    participant_type,
    lead_name,
    lead_email,
    lead_phone,
    lead_linkedin,
    lead_repost_url,
    lead_affiliation,
    lead_note,
    members_snapshot
  ) values (
    v_team_name,
    v_team_size,
    v_participant_type,
    v_lead_name,
    v_lead_email,
    coalesce(v_lead_phone, ''),
    coalesce(v_lead_linkedin, ''),
    coalesce(v_lead_repost_url, ''),
    v_lead_affiliation,
    v_lead_note,
    v_members
  )
  returning id into v_registration_id;

  insert into public.registration_members (
    registration_id,
    role,
    member_order,
    full_name,
    email,
    linkedin_url,
    repost_url,
    affiliation,
    note
  )
  select
    v_registration_id,
    coalesce(member->>'role', 'member')::text,
    (member->>'member_order')::int,
    member->>'fullName',
    lower(member->>'email'),
    member->>'linkedinUrl',
    member->>'repostUrl',
    coalesce(member->>'affiliation', ''),
    coalesce(member->>'note', '')
  from jsonb_array_elements(v_members) with ordinality as item(member, ordinality);

  return v_registration_id;
end;
$$;

create or replace function public.check_registration_availability(
  team_name_input text default null,
  emails_input text[] default array[]::text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_name text := nullif(btrim(team_name_input), '');
  v_team_exists boolean := false;
  v_existing_emails text[] := array[]::text[];
begin
  if v_team_name is not null then
    select exists (
      select 1
      from public.registrations
      where lower(team_name) = lower(v_team_name)
    )
    into v_team_exists;
  end if;

  if coalesce(array_length(emails_input, 1), 0) > 0 then
    select coalesce(array_agg(email order by email), array[]::text[])
      into v_existing_emails
    from public.registration_members
    where lower(email) in (
      select lower(nullif(btrim(email), ''))
      from unnest(emails_input) as email
      where nullif(btrim(email), '') is not null
    );
  end if;

  return jsonb_build_object(
    'team_exists', v_team_exists,
    'existing_emails', to_jsonb(v_existing_emails)
  );
end;
$$;

create or replace function public.admin_update_registration(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registration_id uuid := (payload->>'id')::uuid;
  v_team_name text := nullif(btrim(payload->>'team_name'), '');
  v_team_size text := lower(nullif(btrim(payload->>'team_size'), ''));
  v_participant_type text := lower(nullif(btrim(payload->>'participant_type'), ''));
  v_lead_name text := nullif(btrim(payload->>'lead_name'), '');
  v_lead_email text := lower(nullif(btrim(payload->>'lead_email'), ''));
  v_lead_phone text := nullif(btrim(payload->>'lead_phone'), '');
  v_lead_linkedin text := nullif(btrim(payload->>'lead_linkedin'), '');
  v_lead_repost_url text := nullif(btrim(payload->>'lead_repost_url'), '');
  v_lead_affiliation text := coalesce(nullif(btrim(payload->>'lead_affiliation'), ''), '');
  v_lead_note text := coalesce(nullif(btrim(payload->>'lead_note'), ''), '');
  v_members jsonb := coalesce(payload->'members', '[]'::jsonb);
  v_status text := lower(nullif(btrim(payload->>'status'), ''));
  v_admin_notes text := coalesce(nullif(btrim(payload->>'admin_notes'), ''), '');
  v_expected_count int;
  v_member_count int;
  v_distinct_count int;
begin
  perform public.require_admin();

  if v_registration_id is null then
    raise exception 'Registration id is required';
  end if;

  if not exists (select 1 from public.registrations where id = v_registration_id) then
    raise exception 'Registration not found';
  end if;

  if exists (
    select 1
    from public.registrations
    where lower(team_name) = lower(v_team_name)
      and id <> v_registration_id
  ) then
    raise exception 'Team name already exists';
  end if;

  if v_team_size not in ('solo', 'duo', 'trio', 'squad') then
    raise exception 'Invalid team size';
  end if;

  if v_participant_type not in ('student', 'professional') then
    raise exception 'Invalid participant type';
  end if;

  v_expected_count := case v_team_size
    when 'solo' then 1
    when 'duo' then 2
    when 'trio' then 3
    when 'squad' then 4
  end;

  v_member_count := jsonb_array_length(v_members);
  if v_member_count <> v_expected_count then
    raise exception 'Member count does not match team size';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(v_members) as m("fullName" text, email text, "linkedinUrl" text, "repostUrl" text)
    where coalesce(lower(email), '') = ''
       or coalesce(btrim("fullName"), '') = ''
       or coalesce(btrim("linkedinUrl"), '') = ''
       or coalesce(btrim("repostUrl"), '') = ''
  ) then
    raise exception 'Every participant must have complete details';
  end if;

  select count(distinct lower(email)), count(*)
    into v_distinct_count, v_member_count
  from jsonb_to_recordset(v_members) as m(email text);

  if v_distinct_count <> v_member_count then
    raise exception 'Duplicate participant emails are not allowed';
  end if;

  if exists (
    select 1
    from public.registration_members
    where lower(email) in (
      select lower(email)
      from jsonb_to_recordset(v_members) as m(email text)
    )
      and registration_id <> v_registration_id
  ) then
    raise exception 'One or more participant emails already exist';
  end if;

  update public.registrations
  set
    team_name = v_team_name,
    team_size = v_team_size,
    participant_type = v_participant_type,
    lead_name = v_lead_name,
    lead_email = v_lead_email,
    lead_phone = coalesce(v_lead_phone, ''),
    lead_linkedin = coalesce(v_lead_linkedin, ''),
    lead_repost_url = coalesce(v_lead_repost_url, ''),
    lead_affiliation = v_lead_affiliation,
    lead_note = v_lead_note,
    members_snapshot = v_members,
    status = coalesce(v_status, status),
    admin_notes = v_admin_notes,
    reviewed_at = case when v_status in ('approved', 'disapproved') then now() else reviewed_at end,
    reviewed_by = case when v_status in ('approved', 'disapproved') then coalesce(auth.jwt() ->> 'email', reviewed_by) else reviewed_by end
  where id = v_registration_id;

  delete from public.registration_members where registration_id = v_registration_id;

  insert into public.registration_members (
    registration_id,
    role,
    member_order,
    full_name,
    email,
    linkedin_url,
    repost_url,
    affiliation,
    note
  )
  select
    v_registration_id,
    coalesce(member->>'role', 'member')::text,
    (member->>'member_order')::int,
    member->>'fullName',
    lower(member->>'email'),
    member->>'linkedinUrl',
    member->>'repostUrl',
    coalesce(member->>'affiliation', ''),
    coalesce(member->>'note', '')
  from jsonb_array_elements(v_members) with ordinality as item(member, ordinality);

  return v_registration_id;
end;
$$;

create or replace function public.admin_delete_registration(registration_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.registrations where id = registration_id;
end;
$$;

grant execute on function public.submit_registration(jsonb) to anon, authenticated;
grant execute on function public.check_registration_availability(text, text[]) to anon, authenticated;
grant execute on function public.admin_update_registration(jsonb) to authenticated;
grant execute on function public.admin_delete_registration(uuid) to authenticated;
grant select on public.admin_users to authenticated;
grant select, update, delete on public.registrations to authenticated;
grant select, update, insert, delete on public.registration_members to authenticated;

alter table public.registrations enable row level security;
alter table public.registration_members enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
  on public.admin_users
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Admins can read registrations" on public.registrations;
create policy "Admins can read registrations"
  on public.registrations
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update registrations" on public.registrations;
create policy "Admins can update registrations"
  on public.registrations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read members" on public.registration_members;
create policy "Admins can read members"
  on public.registration_members
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update members" on public.registration_members;
create policy "Admins can update members"
  on public.registration_members
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can insert members" on public.registration_members;
create policy "Admins can insert members"
  on public.registration_members
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can delete members" on public.registration_members;
create policy "Admins can delete members"
  on public.registration_members
  for delete
  to authenticated
  using (public.is_admin());
