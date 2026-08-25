create or replace function public.is_admin()
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

create or replace function public.is_mentorship_member(target_mentorship_id uuid)
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

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.mentor_settings enable row level security;
alter table public.mentor_subjects enable row level security;
alter table public.availability_slots enable row level security;
alter table public.learning_requests enable row level security;
alter table public.mentoring_applications enable row level security;
alter table public.mentorships enable row level security;
alter table public.mentoring_sessions enable row level security;
alter table public.session_feedback enable row level security;
alter table public.notifications enable row level security;
alter table public.content_reports enable row level security;

create policy "profiles_select_authenticated_visible"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or mentor_enabled = true
  or (select public.is_admin())
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
using (id = (select auth.uid()) or (select public.is_admin()))
with check (
  (select public.is_admin())
  or (
    id = (select auth.uid())
    and role = 'student'
  )
);

create policy "subjects_select_active"
on public.subjects
for select
to authenticated, anon
using (is_active = true);

create policy "subjects_select_admin"
on public.subjects
for select
to authenticated
using ((select public.is_admin()));

create policy "subjects_admin_insert"
on public.subjects
for insert
to authenticated
with check ((select public.is_admin()));

create policy "subjects_admin_update"
on public.subjects
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "mentor_settings_select_visible"
on public.mentor_settings
for select
to authenticated
using (
  mentor_id = (select auth.uid())
  or (select public.is_admin())
  or exists (
    select 1 from public.profiles
    where profiles.id = mentor_settings.mentor_id
      and profiles.mentor_enabled = true
  )
);

create policy "mentor_settings_manage_own"
on public.mentor_settings
for all
to authenticated
using (mentor_id = (select auth.uid()) or (select public.is_admin()))
with check (mentor_id = (select auth.uid()) or (select public.is_admin()));

create policy "mentor_subjects_select_visible"
on public.mentor_subjects
for select
to authenticated
using (
  mentor_id = (select auth.uid())
  or (select public.is_admin())
  or exists (
    select 1 from public.profiles
    where profiles.id = mentor_subjects.mentor_id
      and profiles.mentor_enabled = true
  )
);

create policy "mentor_subjects_manage_own"
on public.mentor_subjects
for all
to authenticated
using (mentor_id = (select auth.uid()) or (select public.is_admin()))
with check (mentor_id = (select auth.uid()) or (select public.is_admin()));

create policy "availability_slots_select_visible"
on public.availability_slots
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_admin())
  or exists (
    select 1 from public.profiles
    where profiles.id = availability_slots.user_id
      and profiles.mentor_enabled = true
  )
);

create policy "availability_slots_manage_own"
on public.availability_slots
for all
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()))
with check (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "learning_requests_select_visible"
on public.learning_requests
for select
to authenticated
using (
  (select public.is_admin())
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
using (mentee_id = (select auth.uid()) or (select public.is_admin()))
with check (
  (select public.is_admin())
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
  (select public.is_admin())
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
  (select public.is_admin())
  or mentor_id = (select auth.uid())
  or mentee_id = (select auth.uid())
)
with check (
  (select public.is_admin())
  or mentor_id = (select auth.uid())
  or mentee_id = (select auth.uid())
);

create policy "mentorships_select_members"
on public.mentorships
for select
to authenticated
using (
  (select public.is_admin())
  or (select auth.uid()) in (mentor_id, mentee_id)
);

create policy "mentorships_admin_insert"
on public.mentorships
for insert
to authenticated
with check ((select public.is_admin()));

create policy "mentorships_update_members"
on public.mentorships
for update
to authenticated
using (
  (select public.is_admin())
  or (select auth.uid()) in (mentor_id, mentee_id)
)
with check (
  (select public.is_admin())
  or (select auth.uid()) in (mentor_id, mentee_id)
);

create policy "mentoring_sessions_select_members"
on public.mentoring_sessions
for select
to authenticated
using (
  (select public.is_admin())
  or public.is_mentorship_member(mentorship_id)
);

create policy "mentoring_sessions_insert_members"
on public.mentoring_sessions
for insert
to authenticated
with check (
  (select public.is_admin())
  or public.is_mentorship_member(mentorship_id)
);

create policy "mentoring_sessions_update_members"
on public.mentoring_sessions
for update
to authenticated
using (
  (select public.is_admin())
  or public.is_mentorship_member(mentorship_id)
)
with check (
  (select public.is_admin())
  or public.is_mentorship_member(mentorship_id)
);

create policy "session_feedback_select_members"
on public.session_feedback
for select
to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1
      from public.mentoring_sessions
      where mentoring_sessions.id = session_feedback.session_id
        and public.is_mentorship_member(mentoring_sessions.mentorship_id)
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
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()))
with check (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "notifications_admin_insert"
on public.notifications
for insert
to authenticated
with check ((select public.is_admin()));

create policy "content_reports_insert_authenticated"
on public.content_reports
for insert
to authenticated
with check (reporter_id = (select auth.uid()));

create policy "content_reports_select_reporter_or_admin"
on public.content_reports
for select
to authenticated
using (reporter_id = (select auth.uid()) or (select public.is_admin()));

create policy "content_reports_admin_update"
on public.content_reports
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create index if not exists mentor_subjects_subject_full_idx
  on public.mentor_subjects(subject_id);

create index if not exists learning_requests_mentee_status_idx
  on public.learning_requests(mentee_id, status);

create index if not exists mentorships_mentee_status_idx
  on public.mentorships(mentee_id, status);

create index if not exists mentorships_subject_status_idx
  on public.mentorships(subject_id, status);

create index if not exists session_feedback_author_idx
  on public.session_feedback(author_id);

create index if not exists session_feedback_target_user_idx
  on public.session_feedback(target_user_id);

create index if not exists content_reports_resolved_by_idx
  on public.content_reports(resolved_by);

grant usage on schema public to anon, authenticated;

grant select on table public.subjects to anon;

grant select, insert, update, delete on table
  public.profiles,
  public.subjects,
  public.mentor_settings,
  public.mentor_subjects,
  public.availability_slots,
  public.learning_requests,
  public.mentoring_applications,
  public.mentorships,
  public.mentoring_sessions,
  public.session_feedback,
  public.notifications,
  public.content_reports
to authenticated;

revoke execute on function public.set_updated_at() from PUBLIC, anon, authenticated;

revoke execute on function public.is_admin() from PUBLIC, anon;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.is_mentorship_member(uuid) from PUBLIC, anon;
grant execute on function public.is_mentorship_member(uuid) to authenticated;

revoke execute on function public.accept_mentoring_application(uuid) from PUBLIC, anon;
grant execute on function public.accept_mentoring_application(uuid) to authenticated;

revoke execute on function public.cancel_mentoring_application(uuid) from PUBLIC, anon;
grant execute on function public.cancel_mentoring_application(uuid) to authenticated;

revoke execute on function public.complete_mentorship(uuid) from PUBLIC, anon;
grant execute on function public.complete_mentorship(uuid) to authenticated;
