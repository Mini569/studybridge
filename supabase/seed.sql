insert into public.subjects (name, category, description, is_active)
values
  ('국어', '인문', '문학, 비문학, 화법과 작문', true),
  ('수학', '수리', '공통수학, 수학 I/II, 미적분, 확률과 통계', true),
  ('영어', '외국어', '독해, 어법, 어휘, 서술형', true),
  ('물리학', '과학', '역학, 전기, 파동, 현대물리', true),
  ('화학', '과학', '화학 반응, 몰, 산화 환원', true),
  ('생명과학', '과학', '세포, 유전, 항상성, 생태계', true),
  ('지구과학', '과학', '지권, 대기와 해양, 천체', true),
  ('정보', '기술', '파이썬, 알고리즘, 데이터, 프로젝트', true),
  ('한국사', '사회', '전근대사, 근현대사, 사료 분석', true),
  ('기타', '기타', '학교 안에서 도울 수 있는 기타 학습 주제', true)
on conflict (name) do update
set
  category = excluded.category,
  description = excluded.description,
  is_active = excluded.is_active;

-- 테스트 계정, 프로필, 멘토 설정, 요청, 신청, 멘토링, 세션, 알림은
-- Supabase Auth 사용자와 연결되어야 합니다.
-- 로컬 테스트 데이터는 README의 `npm run seed:demo` 절차를 사용하세요.
