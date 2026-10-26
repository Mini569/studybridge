alter table public.profiles
  add column if not exists interests text[] not null default '{}',
  add column if not exists needs text[] not null default '{}';

create or replace function private.can_view_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    (select auth.uid()) is not null
    and (
      target_profile_id = (select auth.uid())
      or exists (
        select 1 from public.profiles
        where id = target_profile_id and mentor_enabled = true
      )
      or exists (
        select 1 from public.mentoring_applications
        where (mentor_id = (select auth.uid()) and mentee_id = target_profile_id)
           or (mentee_id = (select auth.uid()) and mentor_id = target_profile_id)
      )
      or exists (
        select 1 from public.mentorships
        where (mentor_id = (select auth.uid()) and mentee_id = target_profile_id)
           or (mentee_id = (select auth.uid()) and mentor_id = target_profile_id)
      )
      or private.is_admin()
    );
$$;

create or replace function private.is_active_mentor()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and mentor_enabled = true
    );
$$;

drop policy if exists "profiles_select_authenticated_visible" on public.profiles;
create policy "profiles_select_authenticated_visible"
on public.profiles
for select
to authenticated
using (private.can_view_profile(id));

drop policy if exists "learning_requests_select_visible" on public.learning_requests;
create policy "learning_requests_select_visible"
on public.learning_requests
for select
to authenticated
using (
  (select private.is_admin())
  or mentee_id = (select auth.uid())
  or (visibility = 'school' and status <> 'hidden')
  or (visibility = 'mentor_only' and status <> 'hidden' and private.is_active_mentor())
);

drop policy if exists "mentoring_applications_update_members" on public.mentoring_applications;
drop policy if exists "mentoring_applications_update_admin" on public.mentoring_applications;
drop policy if exists "mentoring_applications_insert_mentee" on public.mentoring_applications;
create policy "mentoring_applications_insert_mentee"
on public.mentoring_applications
for insert
to authenticated
with check (
  mentee_id = (select auth.uid())
  and mentor_id <> (select auth.uid())
  and status = 'pending'
  and exists (
    select 1 from public.learning_requests
    where id = learning_request_id
      and learning_requests.mentee_id = (select auth.uid())
      and learning_requests.status = 'open'
  )
  and exists (
    select 1 from public.profiles
    where id = mentor_id and mentor_enabled = true
  )
);

create policy "mentoring_applications_update_admin"
on public.mentoring_applications
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "mentorships_update_members" on public.mentorships;
drop policy if exists "mentorships_update_admin" on public.mentorships;
create policy "mentorships_update_admin"
on public.mentorships
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create or replace function public.reject_mentoring_application(application_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_application public.mentoring_applications%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  select * into target_application
  from public.mentoring_applications
  where id = application_id
  for update;

  if target_application.id is null
     or target_application.mentor_id <> (select auth.uid())
     or target_application.status <> 'pending' then
    raise exception 'application cannot be rejected';
  end if;

  update public.mentoring_applications
  set status = 'rejected', responded_at = now()
  where id = application_id;

  insert into public.notifications (user_id, type, title, message, link)
  values (
    target_application.mentee_id,
    'application_rejected',
    '멘토링 신청이 거절되었습니다',
    '다른 멘토의 가능 과목과 시간을 확인해 보세요.',
    '/applications?tab=sent'
  );
end;
$$;

create or replace function public.get_mentor_stats()
returns table (
  mentor_id uuid,
  average_rating double precision,
  completed_mentorships bigint,
  active_mentees bigint,
  last_active_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  return query
  select
    p.id,
    avg(sf.rating)::double precision,
    count(distinct m.id) filter (where m.status = 'completed'),
    count(distinct m.id) filter (where m.status in ('planned', 'active')),
    p.updated_at
  from public.profiles p
  left join public.mentorships m on m.mentor_id = p.id
  left join public.mentoring_sessions ms on ms.mentorship_id = m.id
  left join public.session_feedback sf on sf.session_id = ms.id and sf.target_user_id = p.id
  where p.mentor_enabled = true
  group by p.id, p.updated_at;
end;
$$;

revoke execute on function private.can_view_profile(uuid) from PUBLIC, anon;
grant execute on function private.can_view_profile(uuid) to authenticated;
revoke execute on function private.is_active_mentor() from PUBLIC, anon;
grant execute on function private.is_active_mentor() to authenticated;
revoke execute on function public.reject_mentoring_application(uuid) from PUBLIC, anon;
grant execute on function public.reject_mentoring_application(uuid) to authenticated;
revoke execute on function public.get_mentor_stats() from PUBLIC, anon;
grant execute on function public.get_mentor_stats() to authenticated;

create index if not exists mentoring_applications_mentor_mentee_idx
  on public.mentoring_applications(mentor_id, mentee_id);

create index if not exists mentorships_mentor_mentee_idx
  on public.mentorships(mentor_id, mentee_id);
