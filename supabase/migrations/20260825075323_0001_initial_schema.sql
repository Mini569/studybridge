create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  grade smallint not null,
  bio text,
  avatar_url text,
  role text not null default 'student',
  onboarding_completed boolean not null default false,
  mentor_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) between 2 and 30),
  constraint profiles_grade_check check (grade between 1 and 3),
  constraint profiles_role_check check (role in ('student', 'admin'))
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.mentor_settings (
  mentor_id uuid primary key references public.profiles(id) on delete cascade,
  introduction text not null default '',
  max_active_mentees integer not null default 3,
  is_accepting boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentor_settings_max_active_mentees_check check (max_active_mentees between 1 and 10)
);

create table public.mentor_subjects (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  proficiency_level smallint not null,
  topics text[] not null default '{}',
  preferred_grades smallint[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint mentor_subjects_unique_mentor_subject unique (mentor_id, subject_id),
  constraint mentor_subjects_proficiency_check check (proficiency_level between 1 and 5),
  constraint mentor_subjects_preferred_grades_check check (
    preferred_grades <@ array[1, 2, 3]::smallint[]
  )
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint availability_slots_day_check check (day_of_week between 0 and 6),
  constraint availability_slots_time_check check (end_time > start_time),
  constraint availability_slots_unique_slot unique (user_id, day_of_week, start_time, end_time)
);

create table public.learning_requests (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  title text not null,
  topics text[] not null default '{}',
  description text not null,
  help_type text not null,
  desired_level smallint not null,
  preferred_days smallint[] not null default '{}',
  preferred_start_time time,
  preferred_end_time time,
  expected_sessions integer not null,
  visibility text not null default 'school',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_requests_title_length check (char_length(title) between 5 and 80),
  constraint learning_requests_description_length check (char_length(description) between 20 and 1000),
  constraint learning_requests_help_type_check check (
    help_type in ('concept', 'problem_solving', 'study_method', 'exam', 'project', 'other')
  ),
  constraint learning_requests_desired_level_check check (desired_level between 1 and 5),
  constraint learning_requests_preferred_days_check check (
    preferred_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
  ),
  constraint learning_requests_time_check check (
    preferred_start_time is null
    or preferred_end_time is null
    or preferred_end_time > preferred_start_time
  ),
  constraint learning_requests_expected_sessions_check check (expected_sessions between 1 and 20),
  constraint learning_requests_visibility_check check (visibility in ('school', 'mentor_only')),
  constraint learning_requests_status_check check (status in ('open', 'matched', 'closed', 'cancelled', 'hidden'))
);

create table public.mentoring_applications (
  id uuid primary key default gen_random_uuid(),
  learning_request_id uuid not null references public.learning_requests(id) on delete cascade,
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint mentoring_applications_unique_request_mentor unique (learning_request_id, mentor_id),
  constraint mentoring_applications_distinct_users check (mentor_id <> mentee_id),
  constraint mentoring_applications_status_check check (status in ('pending', 'accepted', 'rejected', 'cancelled'))
);

create table public.mentorships (
  id uuid primary key default gen_random_uuid(),
  learning_request_id uuid not null unique references public.learning_requests(id) on delete restrict,
  mentor_id uuid not null references public.profiles(id) on delete restrict,
  mentee_id uuid not null references public.profiles(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  goal text not null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentorships_distinct_users check (mentor_id <> mentee_id),
  constraint mentorships_status_check check (status in ('planned', 'active', 'completed', 'cancelled'))
);

create table public.mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  mentorship_id uuid not null references public.mentorships(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes integer not null,
  topic text not null,
  location_type text not null,
  status text not null default 'scheduled',
  mentor_note text,
  mentee_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentoring_sessions_duration_check check (duration_minutes between 10 and 240),
  constraint mentoring_sessions_location_check check (location_type in ('classroom', 'library', 'self_study', 'online', 'campus')),
  constraint mentoring_sessions_status_check check (status in ('scheduled', 'completed', 'cancelled'))
);

create table public.session_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mentoring_sessions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint session_feedback_rating_check check (rating between 1 and 5),
  constraint session_feedback_unique_author unique (session_id, author_id),
  constraint session_feedback_distinct_users check (author_id <> target_user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  description text,
  status text not null default 'pending',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint content_reports_target_type_check check (target_type in ('profile', 'learning_request', 'session')),
  constraint content_reports_status_check check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  constraint content_reports_unique_report unique (reporter_id, target_type, target_id)
);

create index profiles_role_idx on public.profiles(role);
create index profiles_mentor_enabled_idx on public.profiles(mentor_enabled) where mentor_enabled = true;
create index mentor_subjects_subject_idx on public.mentor_subjects(subject_id) where is_active = true;
create index availability_slots_user_day_idx on public.availability_slots(user_id, day_of_week);
create index learning_requests_subject_status_idx on public.learning_requests(subject_id, status);
create index mentoring_applications_mentor_status_idx on public.mentoring_applications(mentor_id, status);
create index mentoring_applications_mentee_status_idx on public.mentoring_applications(mentee_id, status);
create index mentorships_member_status_idx on public.mentorships(mentor_id, mentee_id, status);
create index mentoring_sessions_mentorship_schedule_idx on public.mentoring_sessions(mentorship_id, scheduled_at);
create index notifications_user_read_idx on public.notifications(user_id, is_read, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger mentor_settings_set_updated_at
before update on public.mentor_settings
for each row execute function public.set_updated_at();

create trigger learning_requests_set_updated_at
before update on public.learning_requests
for each row execute function public.set_updated_at();

create trigger mentorships_set_updated_at
before update on public.mentorships
for each row execute function public.set_updated_at();

create trigger mentoring_sessions_set_updated_at
before update on public.mentoring_sessions
for each row execute function public.set_updated_at();

create or replace function public.accept_mentoring_application(application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  application_row public.mentoring_applications%rowtype;
  request_row public.learning_requests%rowtype;
  settings_row public.mentor_settings%rowtype;
  active_mentee_count integer;
  new_mentorship_id uuid;
begin
  select *
    into application_row
    from public.mentoring_applications
    where id = application_id
    for update;

  if not found then
    raise exception 'application_not_found';
  end if;

  if auth.uid() is null or application_row.mentor_id <> auth.uid() then
    raise exception 'not_allowed';
  end if;

  if application_row.status <> 'pending' then
    raise exception 'application_already_processed';
  end if;

  select *
    into request_row
    from public.learning_requests
    where id = application_row.learning_request_id
    for update;

  if not found or request_row.status <> 'open' then
    raise exception 'request_not_open';
  end if;

  select *
    into settings_row
    from public.mentor_settings
    where mentor_id = application_row.mentor_id;

  if not found or settings_row.is_accepting is false then
    raise exception 'mentor_not_accepting';
  end if;

  select count(*)
    into active_mentee_count
    from public.mentorships
    where mentor_id = application_row.mentor_id
      and status in ('planned', 'active');

  if active_mentee_count >= settings_row.max_active_mentees then
    raise exception 'mentor_capacity_full';
  end if;

  update public.mentoring_applications
    set status = 'accepted',
        responded_at = now()
    where id = application_row.id;

  insert into public.mentorships (
    learning_request_id,
    mentor_id,
    mentee_id,
    subject_id,
    goal,
    status,
    started_at
  )
  values (
    request_row.id,
    application_row.mentor_id,
    application_row.mentee_id,
    request_row.subject_id,
    request_row.title,
    'active',
    now()
  )
  returning id into new_mentorship_id;

  update public.learning_requests
    set status = 'matched'
    where id = request_row.id;

  update public.mentoring_applications
    set status = 'rejected',
        responded_at = now()
    where learning_request_id = request_row.id
      and status = 'pending'
      and id <> application_row.id;

  insert into public.notifications (user_id, type, title, message, link)
  values
    (
      application_row.mentee_id,
      'application_accepted',
      '멘토링 신청이 승인되었습니다',
      '멘토가 신청을 승인했습니다. 멘토링 상세에서 일정을 확인하세요.',
      '/mentorships/' || new_mentorship_id
    ),
    (
      application_row.mentor_id,
      'application_accepted',
      '멘토링이 시작되었습니다',
      '승인한 신청으로 새 멘토링이 생성되었습니다.',
      '/mentorships/' || new_mentorship_id
    );

  return new_mentorship_id;
end;
$$;

create or replace function public.cancel_mentoring_application(application_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  application_row public.mentoring_applications%rowtype;
begin
  select *
    into application_row
    from public.mentoring_applications
    where id = application_id
    for update;

  if not found then
    raise exception 'application_not_found';
  end if;

  if auth.uid() is null or application_row.mentee_id <> auth.uid() then
    raise exception 'not_allowed';
  end if;

  if application_row.status <> 'pending' then
    raise exception 'application_already_processed';
  end if;

  update public.mentoring_applications
    set status = 'cancelled',
        responded_at = now()
    where id = application_id;

  insert into public.notifications (user_id, type, title, message, link)
  values (
    application_row.mentor_id,
    'application_cancelled',
    '멘토링 신청이 취소되었습니다',
    '멘티가 대기 중이던 신청을 취소했습니다.',
    '/applications'
  );
end;
$$;

create or replace function public.complete_mentorship(mentorship_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  mentorship_row public.mentorships%rowtype;
begin
  select *
    into mentorship_row
    from public.mentorships
    where id = mentorship_id
    for update;

  if not found then
    raise exception 'mentorship_not_found';
  end if;

  if auth.uid() is null or auth.uid() not in (mentorship_row.mentor_id, mentorship_row.mentee_id) then
    raise exception 'not_allowed';
  end if;

  if mentorship_row.status not in ('planned', 'active') then
    raise exception 'mentorship_not_active';
  end if;

  update public.mentorships
    set status = 'completed',
        completed_at = now()
    where id = mentorship_id;

  insert into public.notifications (user_id, type, title, message, link)
  values
    (
      mentorship_row.mentor_id,
      'feedback_requested',
      '멘토링 피드백을 작성해 주세요',
      '완료된 멘토링에 대한 피드백을 남길 수 있습니다.',
      '/mentorships/' || mentorship_id
    ),
    (
      mentorship_row.mentee_id,
      'feedback_requested',
      '멘토링 피드백을 작성해 주세요',
      '완료된 멘토링에 대한 피드백을 남길 수 있습니다.',
      '/mentorships/' || mentorship_id
    );
end;
$$;
