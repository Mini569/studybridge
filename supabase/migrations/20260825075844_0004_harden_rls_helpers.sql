create schema if not exists private;
revoke all on schema private from PUBLIC;
grant usage on schema private to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
  );
$$;

create or replace function private.is_mentorship_member(target_mentorship_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.mentorships
      where id = target_mentorship_id
        and (select auth.uid()) in (mentor_id, mentee_id)
  );
$$;

drop policy if exists "profiles_select_authenticated_visible" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "subjects_select_active" on public.subjects;
drop policy if exists "subjects_select_admin" on public.subjects;
drop policy if exists "subjects_select_anon_active" on public.subjects;
drop policy if exists "subjects_select_authenticated_visible" on public.subjects;
drop policy if exists "subjects_admin_insert" on public.subjects;
drop policy if exists "subjects_admin_update" on public.subjects;
drop policy if exists "mentor_settings_select_visible" on public.mentor_settings;
drop policy if exists "mentor_settings_manage_own" on public.mentor_settings;
drop policy if exists "mentor_settings_insert_own" on public.mentor_settings;
drop policy if exists "mentor_settings_update_own" on public.mentor_settings;
drop policy if exists "mentor_settings_delete_own" on public.mentor_settings;
drop policy if exists "mentor_subjects_select_visible" on public.mentor_subjects;
drop policy if exists "mentor_subjects_manage_own" on public.mentor_subjects;
drop policy if exists "mentor_subjects_insert_own" on public.mentor_subjects;
drop policy if exists "mentor_subjects_update_own" on public.mentor_subjects;
drop policy if exists "mentor_subjects_delete_own" on public.mentor_subjects;
drop policy if exists "availability_slots_select_visible" on public.availability_slots;
drop policy if exists "availability_slots_manage_own" on public.availability_slots;
drop policy if exists "availability_slots_insert_own" on public.availability_slots;
drop policy if exists "availability_slots_update_own" on public.availability_slots;
drop policy if exists "availability_slots_delete_own" on public.availability_slots;
drop policy if exists "learning_requests_select_visible" on public.learning_requests;
drop policy if exists "learning_requests_insert_own" on public.learning_requests;
drop policy if exists "learning_requests_update_owner_or_admin" on public.learning_requests;
drop policy if exists "mentoring_applications_select_members" on public.mentoring_applications;
drop policy if exists "mentoring_applications_insert_mentee" on public.mentoring_applications;
drop policy if exists "mentoring_applications_update_members" on public.mentoring_applications;
drop policy if exists "mentorships_select_members" on public.mentorships;
drop policy if exists "mentorships_admin_insert" on public.mentorships;
drop policy if exists "mentorships_update_members" on public.mentorships;
drop policy if exists "mentoring_sessions_select_members" on public.mentoring_sessions;
drop policy if exists "mentoring_sessions_insert_members" on public.mentoring_sessions;
drop policy if exists "mentoring_sessions_update_members" on public.mentoring_sessions;
drop policy if exists "session_feedback_select_members" on public.session_feedback;
drop policy if exists "session_feedback_insert_member" on public.session_feedback;
drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;
drop policy if exists "notifications_admin_insert" on public.notifications;
drop policy if exists "content_reports_insert_authenticated" on public.content_reports;
drop policy if exists "content_reports_select_reporter_or_admin" on public.content_reports;
drop policy if exists "content_reports_admin_update" on public.content_reports;

create policy "profiles_select_authenticated_visible"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or mentor_enabled = true
  or (select private.is_admin())
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()) or (select private.is_admin()))
with check (
  (select private.is_admin())
  or (
    id = (select auth.uid())
    and role = 'student'
  )
);

create policy "subjects_select_anon_active"
on public.subjects
for select
to anon
using (is_active = true);

create policy "subjects_select_authenticated_visible"
on public.subjects
for select
to authenticated
using (is_active = true or (select private.is_admin()));

create policy "subjects_admin_insert"
on public.subjects
for insert
to authenticated
with check ((select private.is_admin()));

create policy "subjects_admin_update"
on public.subjects
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "mentor_settings_select_visible"
on public.mentor_settings
for select
to authenticated
using (
  mentor_id = (select auth.uid())
  or (select private.is_admin())
  or exists (
    select 1 from public.profiles
    where profiles.id = mentor_settings.mentor_id
      and profiles.mentor_enabled = true
  )
);

create policy "mentor_settings_insert_own"
on public.mentor_settings
for insert
to authenticated
with check (mentor_id = (select auth.uid()) or (select private.is_admin()));

create policy "mentor_settings_update_own"
on public.mentor_settings
for update
to authenticated
using (mentor_id = (select auth.uid()) or (select private.is_admin()))
with check (mentor_id = (select auth.uid()) or (select private.is_admin()));

create policy "mentor_settings_delete_own"
on public.mentor_settings
for delete
to authenticated
using (mentor_id = (select auth.uid()) or (select private.is_admin()));

create policy "mentor_subjects_select_visible"
on public.mentor_subjects
for select
to authenticated
using (
  mentor_id = (select auth.uid())
  or (select private.is_admin())
  or exists (
    select 1 from public.profiles
    where profiles.id = mentor_subjects.mentor_id
      and profiles.mentor_enabled = true
  )
);

create policy "mentor_subjects_insert_own"
on public.mentor_subjects
for insert
to authenticated
with check (mentor_id = (select auth.uid()) or (select private.is_admin()));

create policy "mentor_subjects_update_own"
on public.mentor_subjects
for update
to authenticated
using (mentor_id = (select auth.uid()) or (select private.is_admin()))
with check (mentor_id = (select auth.uid()) or (select private.is_admin()));

create policy "mentor_subjects_delete_own"
on public.mentor_subjects
for delete
to authenticated
using (mentor_id = (select auth.uid()) or (select private.is_admin()));

create policy "availability_slots_select_visible"
on public.availability_slots
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
  or exists (
    select 1 from public.profiles
    where profiles.id = availability_slots.user_id
      and profiles.mentor_enabled = true
  )
);

create policy "availability_slots_insert_own"
on public.availability_slots
for insert
to authenticated
with check (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "availability_slots_update_own"
on public.availability_slots
for update
to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()))
with check (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "availability_slots_delete_own"
on public.availability_slots
for delete
to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "learning_requests_select_visible"
on public.learning_requests
for select
to authenticated
using (
  (select private.is_admin())
  or mentee_id = (select auth.uid())
  or (visibility = 'school' and status <> 'hidden')
);

create policy "learning_requests_insert_own"
on public.learning_requests
for insert
to authenticated
with check (mentee_id = (select auth.uid()));

create policy "learning_requests_update_owner_or_admin"
on public.learning_requests
for update
to authenticated
using (mentee_id = (select auth.uid()) or (select private.is_admin()))
with check (
  (select private.is_admin())
  or (
    mentee_id = (select auth.uid())
    and status in ('open', 'closed', 'cancelled')
  )
);

create policy "mentoring_applications_select_members"
on public.mentoring_applications
for select
to authenticated
using (
  (select private.is_admin())
  or mentor_id = (select auth.uid())
  or mentee_id = (select auth.uid())
);

create policy "mentoring_applications_insert_mentee"
on public.mentoring_applications
for insert
to authenticated
with check (
  mentee_id = (select auth.uid())
  and mentor_id <> (select auth.uid())
  and status = 'pending'
);

create policy "mentoring_applications_update_members"
on public.mentoring_applications
for update
to authenticated
using (
  (select private.is_admin())
  or mentor_id = (select auth.uid())
  or mentee_id = (select auth.uid())
)
with check (
  (select private.is_admin())
  or mentor_id = (select auth.uid())
  or mentee_id = (select auth.uid())
);

create policy "mentorships_select_members"
on public.mentorships
for select
to authenticated
using (
  (select private.is_admin())
  or (select auth.uid()) in (mentor_id, mentee_id)
);

create policy "mentorships_admin_insert"
on public.mentorships
for insert
to authenticated
with check ((select private.is_admin()));

create policy "mentorships_update_members"
on public.mentorships
for update
to authenticated
using (
  (select private.is_admin())
  or (select auth.uid()) in (mentor_id, mentee_id)
)
with check (
  (select private.is_admin())
  or (select auth.uid()) in (mentor_id, mentee_id)
);

create policy "mentoring_sessions_select_members"
on public.mentoring_sessions
for select
to authenticated
using (
  (select private.is_admin())
  or private.is_mentorship_member(mentorship_id)
);

create policy "mentoring_sessions_insert_members"
on public.mentoring_sessions
for insert
to authenticated
with check (
  (select private.is_admin())
  or private.is_mentorship_member(mentorship_id)
);

create policy "mentoring_sessions_update_members"
on public.mentoring_sessions
for update
to authenticated
using (
  (select private.is_admin())
  or private.is_mentorship_member(mentorship_id)
)
with check (
  (select private.is_admin())
  or private.is_mentorship_member(mentorship_id)
);

create policy "session_feedback_select_members"
on public.session_feedback
for select
to authenticated
using (
  (select private.is_admin())
  or exists (
    select 1
      from public.mentoring_sessions
      where mentoring_sessions.id = session_feedback.session_id
        and private.is_mentorship_member(mentoring_sessions.mentorship_id)
  )
);

create policy "session_feedback_insert_member"
on public.session_feedback
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and author_id <> target_user_id
  and exists (
    select 1
      from public.mentoring_sessions
      join public.mentorships on mentorships.id = mentoring_sessions.mentorship_id
      where mentoring_sessions.id = session_feedback.session_id
        and (select auth.uid()) in (mentorships.mentor_id, mentorships.mentee_id)
        and target_user_id in (mentorships.mentor_id, mentorships.mentee_id)
  )
);

create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()))
with check (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "notifications_admin_insert"
on public.notifications
for insert
to authenticated
with check ((select private.is_admin()));

create policy "content_reports_insert_authenticated"
on public.content_reports
for insert
to authenticated
with check (reporter_id = (select auth.uid()));

create policy "content_reports_select_reporter_or_admin"
on public.content_reports
for select
to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()));

create policy "content_reports_admin_update"
on public.content_reports
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke execute on function private.is_admin() from PUBLIC, anon;
grant execute on function private.is_admin() to authenticated;

revoke execute on function private.is_mentorship_member(uuid) from PUBLIC, anon;
grant execute on function private.is_mentorship_member(uuid) to authenticated;

drop function if exists public.is_admin();
drop function if exists public.is_mentorship_member(uuid);
