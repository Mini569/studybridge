# StudyBridge

StudyBridge는 교내 학생이 학습 도움 요청을 등록하고, 과목과 시간 조건에 맞는 또래 멘토를 찾아 멘토링 신청, 세션 기록, 피드백까지 관리하는 Next.js 웹서비스입니다.

## 핵심 기능

- 이메일/비밀번호 기반 회원가입, 로그인, 온보딩 구조
- 멘토 활동 설정, 과목/세부 단원/가능 시간 등록 구조
- 멘토 목록 검색, URL 쿼리 기반 필터와 정렬
- 학습 도움 요청 작성, 목록, 상세, 추천 멘토 표시
- 신청 승인/거절/취소 서버 액션과 PostgreSQL 트랜잭션 함수
- 멘토링 목록, 상세, 세션 등록, 완료 처리, 피드백 작성
- 세부 평가 항목, 개선 태그, 후속 조치 여부를 포함한 구조화 피드백
- 알림 목록과 읽음 처리
- 관리자 지표, 멘토 중지, 요청 숨김, 신고 처리
- 관리자 피드백 인사이트와 우선 개선 액션
- Supabase PostgreSQL 마이그레이션, RLS 정책, seed 절차
- Supabase 환경변수 없이 실행 가능한 데모 모드

## 사용 기술

- Next.js App Router, React, TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Supabase Auth, Row Level Security
- React Hook Form, Zod
- Lucide React, date-fns
- Vitest, React Testing Library, Playwright

## 폴더 구조

```text
src/
  app/              App Router 페이지, 서버 액션, API 라우트
  components/       공통 UI, 폼, 카드, 레이아웃 컴포넌트
  lib/              상수, 데모 데이터, 추천 알고리즘, Supabase 클라이언트
  types/            도메인 타입
supabase/
  migrations/       스키마, 함수, RLS 정책
  seed.sql          기본 과목 seed
scripts/
  seed-demo.ts      Supabase Auth 기반 데모 데이터 seed
tests/
  unit/             추천, 상태, 검증, 필터 테스트
  components/       주요 UI 컴포넌트 테스트
  e2e/              데모 사용자 흐름 테스트
```

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

Supabase 환경변수가 없거나 `NEXT_PUBLIC_DEMO_MODE=true`이면 샘플 데이터로 동작합니다.

## 환경변수 설정

`.env.example`을 기준으로 `.env.local`을 만듭니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ACCESS_TOKEN=
SUPABASE_PROJECT_REF=
SUPABASE_DB_PASSWORD=
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 우선 사용하고, 기존 프로젝트라면 `NEXT_PUBLIC_SUPABASE_ANON_KEY`도 사용할 수 있습니다. `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `VERCEL_TOKEN`은 서버/CI 전용 비밀값입니다. `NEXT_PUBLIC_` 접두사가 붙은 변수에는 비밀값을 넣지 마세요.

운영 배포용 공개 Supabase URL과 publishable key는 `.env.production`에 포함되어 있습니다. 비밀값은 Git에 커밋하지 말고 Supabase, Vercel, GitHub Secrets에서만 관리합니다.

## Supabase 프로젝트 생성

1. Supabase 프로젝트를 생성합니다.
2. Project Settings에서 URL과 anon key를 `.env.local`에 입력합니다.
3. service role key는 로컬 seed나 관리자 서버 작업에만 사용합니다.
4. SQL Editor 또는 Supabase CLI로 마이그레이션을 적용합니다.
5. Auth redirect URL에 `http://localhost:3000`, Vercel 운영 도메인, `https://*.vercel.app`을 등록합니다.

## SQL 마이그레이션 실행 순서

```bash
npm run supabase:link -- --project-ref <SUPABASE_PROJECT_REF>
npm run supabase:db:push
```

또는 SQL Editor에서 순서대로 실행합니다.

```text
supabase/migrations/20260825075323_0001_initial_schema.sql
supabase/migrations/20260825075440_0002_rls_policies.sql
supabase/migrations/20260825075454_0003_structured_feedback.sql
supabase/migrations/20260825075844_0004_harden_rls_helpers.sql
supabase/seed.sql
```

## RLS 정책 설명

- 인증되지 않은 사용자는 개인 데이터를 조회할 수 없습니다.
- 사용자는 자신의 프로필, 멘토 설정, 가능 시간을 수정할 수 있습니다.
- 인증 사용자는 공개 멘토와 공개 학습 요청을 조회할 수 있습니다.
- 신청, 멘토링, 세션, 피드백은 멘토와 멘티만 접근합니다.
- 알림은 본인만 조회하고 읽음 처리합니다.
- 관리자 작업은 `profiles.role = admin`인 사용자만 수행합니다.
- `accept_mentoring_application`, `cancel_mentoring_application`, `complete_mentorship` 함수는 `SECURITY DEFINER`와 명시적 `search_path`를 사용하고 내부에서 `auth.uid()`를 다시 확인합니다.

## 초기 데이터 입력

기본 과목은 `supabase/seed.sql`로 입력합니다.

테스트 계정과 연결 데이터는 Supabase Auth 사용자 ID가 필요하므로 별도 스크립트를 사용합니다.

```bash
npm run seed:demo
```

생성되는 테스트 계정 비밀번호는 스크립트 출력에 표시됩니다. 로컬 테스트용이며 실제 운영 환경에 사용하지 마세요.

## 데모 모드 실행

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

Windows PowerShell:

```powershell
$env:NEXT_PUBLIC_DEMO_MODE="true"; npm run dev
```

데모 모드에서는 가입, 신청, 저장, 관리자 작업이 실제 DB에 반영되지 않고 결과 메시지만 표시됩니다.

## 테스트 실행

```bash
npm run ci
```

개별 실행:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

E2E는 Playwright Chromium API로 데모 흐름을 실행합니다. 브라우저가 설치되어 있지 않다면 다음을 먼저 실행합니다.

```bash
npx playwright install chromium
```

## Vercel 배포

배포 상세 절차는 `docs/deployment.md`를 참고합니다.

1. GitHub 저장소를 Vercel에 연결합니다.
2. Environment Variables에 `.env.example`의 운영 값을 입력합니다.
3. Supabase 마이그레이션을 먼저 적용합니다.
4. Vercel 빌드 설정은 `vercel.json`을 사용합니다.

```bash
npm run vercel:pull
npm run vercel:build
npm run vercel:deploy
```

## GitHub Actions

- `.github/workflows/ci.yml`: PR과 `main`/`master` push에서 lint, typecheck, test, build, E2E를 실행합니다.
- `.github/workflows/vercel.yml`: Vercel preview/production 배포를 실행합니다.
- `.github/workflows/supabase.yml`: Supabase 마이그레이션을 운영 프로젝트에 적용합니다.

GitHub Secrets에는 `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`를 등록합니다.

## 관리자 계정 설정

관리자 계정으로 사용할 사용자를 Supabase Auth에서 만든 뒤 해당 사용자의 프로필을 업데이트합니다.

```sql
update public.profiles
set role = 'admin'
where id = '관리자 auth.users.id';
```

관리자 페이지는 클라이언트 버튼 숨김에 의존하지 않고 미들웨어, 서버 액션, RLS 정책에서 권한을 확인합니다.

## 주요 사용자 흐름

```text
회원가입 -> 온보딩 -> 멘토 찾기 -> 멘토링 신청 -> 승인 -> 세션 기록 -> 완료 -> 피드백
```

```text
회원가입 -> 도움 요청 작성 -> 추천 멘토 확인 -> 신청 -> 승인 -> 멘토링 시작
```

```text
프로필 -> 멘토 활동 활성화 -> 가능 과목/시간 등록 -> 신청 확인 -> 승인 또는 거절
```

## 알려진 제한 사항

- MVP에는 실시간 채팅, 영상 통화, 결제, 외부 AI API, SNS 로그인, 정확한 위치 추적이 없습니다.
- 데모 모드는 화면 확인용이며 데이터 변경을 유지하지 않습니다.
- 실제 운영에서는 학교 인증, 관리자 온보딩, 신고 운영 정책을 추가로 정해야 합니다.

## 향후 확장 기능

- Supabase Realtime 알림
- 관리자 감사 로그 상세화
- 학기별 과목 템플릿
- 멘토링 만족도 리포트
- 학교 공식 계정 기반 가입 승인
