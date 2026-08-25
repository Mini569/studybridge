alter table public.session_feedback
  add column if not exists clarity_rating smallint not null default 5,
  add column if not exists punctuality_rating smallint not null default 5,
  add column if not exists goal_progress_rating smallint not null default 5,
  add column if not exists retry_preference text not null default 'yes',
  add column if not exists improvement_tags text[] not null default '{}',
  add column if not exists improvement_note text,
  add column if not exists follow_up_needed boolean not null default false;

alter table public.session_feedback
  add constraint session_feedback_clarity_rating_check check (clarity_rating between 1 and 5),
  add constraint session_feedback_punctuality_rating_check check (punctuality_rating between 1 and 5),
  add constraint session_feedback_goal_progress_rating_check check (goal_progress_rating between 1 and 5),
  add constraint session_feedback_retry_preference_check check (retry_preference in ('yes', 'maybe', 'no')),
  add constraint session_feedback_improvement_tags_count_check check (array_length(improvement_tags, 1) is null or array_length(improvement_tags, 1) <= 4),
  add constraint session_feedback_follow_up_note_check check (
    follow_up_needed is false
    or (improvement_note is not null and char_length(btrim(improvement_note)) >= 10)
  );

create index if not exists session_feedback_follow_up_needed_idx
  on public.session_feedback(follow_up_needed, created_at desc)
  where follow_up_needed = true;
