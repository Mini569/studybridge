# StudyBridge 개발·배포 프로젝트 계획서

작성 기준: 2026-09-07. 이 문서는 로컬 프로젝트와 공식 문서를 참고한 개발 계획이다. GitHub·Vercel·Supabase의 실제 연결 상태나 운영 DB 반영 여부를 확인한 배포 결과 보고서는 아니다.

## 1. 프로젝트 목표

교내 학생이 과목, 세부 단원, 현재 이해 수준, 학습 목표와 희망 시간을 입력하면 조건에 맞는 또래 멘토를 추천받고 신청할 수 있는 웹서비스를 개발한다. 신청 수락 후에는 만남 일정과 학습 피드백을 기록한다. 화면 제작, 데이터 저장, 사용자별 접근 권한, 자동 검사, 인터넷 배포까지 하나의 흐름으로 완성한다.

첫 완성 범위는 로그인 → 도움 요청 저장 → 멘토 추천 → 신청 → 멘토 수락·거절 → 상태 확인이다. 회차 기록·피드백·알림은 이 흐름을 확인한 뒤 확장한다.

## 2. 서비스별 역할과 쉬운 용어

| 도구·용어 | 학생 프로젝트에서 설명할 표현 |
|---|---|
| Next.js | 사용자가 보는 화면과 서버에서 실행할 기능을 만드는 도구 |
| Git | 코드가 어떻게 바뀌었는지 내 컴퓨터에 기록하는 도구 |
| GitHub | 코드, 변경 기록, 할 일을 팀과 공유하는 공간 |
| Vercel | Next.js 프로그램을 실행해 인터넷 주소로 공개하는 서비스 |
| Supabase Database | 학생 정보, 도움 요청, 신청을 표 형태로 저장하는 곳 |
| Supabase Auth | 회원가입과 로그인, 로그인 상태를 관리하는 기능 |
| 브랜치 | 새 기능을 따로 작업하는 코드 작업 공간 |
| 커밋 | 변경 이유를 메모한 코드 저장 지점 |
| PR(Pull Request) | 작업한 내용을 검토하고 기준 코드에 합치기 위한 요청 |
| CI | 코드를 올릴 때 오류와 테스트를 자동 검사하는 과정 |
| 빌드 | 작성한 코드를 배포해서 실행할 수 있는 형태로 만드는 과정 |
| 환경 변수 | 프로그램 밖에서 전달하는 주소·연결 키·실행 설정값 |
| 마이그레이션 | 데이터 표의 구조와 규칙을 바꾼 내용을 기록한 SQL 파일 |
| RLS | 데이터 표의 각 줄을 누가 읽고 고칠 수 있는지 정하는 규칙 |
| 트랜잭션 | 여러 저장 작업을 하나로 묶어 모두 성공하거나 모두 취소하는 처리 |

코드 전달 경로는 내 컴퓨터 → GitHub → Vercel이다. 서비스 이용 시에는 사용자가 Vercel의 StudyBridge에 접속하고, 프로그램이 Supabase와 통신하여 로그인과 데이터 저장·조회를 처리한다. GitHub에 SQL 파일을 올리는 일과 실제 Supabase에 적용하는 일은 별도 단계다.

## 3. 권장 개발 순서

아래 회차는 작업 묶음이며, 반드시 한 수업 시간에 끝난다는 뜻은 아니다.

| 단계 | 할 일 | 완료 판단 기준 | 탐구 일지에 남길 자료 |
|---|---|---|---|
| 1. 요구사항과 GitHub 준비 | 멘티·멘토 행동, 필수 입력값, 신청 상태를 정한다. 저장소와 기능별 Issue를 만든다. | 핵심 사용자 흐름과 첫 완성 범위가 정해짐 | 요구사항 표, Issue 번호 |
| 2. 프론트 화면 | 메인, 도움 요청 작성, 멘토 목록, 신청 관리 화면을 데모 데이터로 연결한다. | 입력 → 추천 → 신청 확인·취소를 화면에서 시연 가능 | PC·모바일 화면, 커밋 |
| 3. DB와 권한 설계 | 테이블, 연결 고유번호, 중복 방지, RLS를 SQL 변경 파일로 정리한다. 테스트 DB에 적용한다. | 표 생성 및 기본 과목 입력, 예상 접근 규칙 확인 | 테이블 관계도, 적용 기록 |
| 4. 로그인과 실제 저장·조회 | Supabase Auth를 연결하고, 로그인한 사용자 ID로 프로필·요청·멘토·신청 데이터를 조회한다. | 새로고침과 재로그인 후에도 저장 내용이 유지됨 | 가입·로그인·조회 테스트 |
| 5. 추천 계산 | 단원·수준·목표·시간·정원 조건과 점수 근거를 구현한다. | 수기 계산과 함수 결과 일치, 시간 불일치·정원 마감 제외 | 입력 사례, 예상·실제 점수 |
| 6. 신청과 권한 검증 | 중복 신청 차단, 수락·거절·취소 권한, 동시 수락 시 정원 검사를 구현한다. | 당사자별 허용 동작과 제삼자 차단, 정원 초과 없음 | 역할별 검사표, 실패와 수정 기록 |
| 7. Vercel 미리보기 | GitHub를 연결하고 Preview 환경 변수를 설정한다. 모바일·실제 계정 흐름을 검사한다. | 테스트 주소에서 핵심 흐름 통과 | 미리보기 주소, 검사 로그 |
| 8. 운영 배포·평가 | 검증된 DB 변경을 운영에 적용하고 main 코드를 배포한다. 운영 주소와 인증 복귀 주소를 맞춘다. | 운영 주소에서 저장·조회·권한 검사 통과 | 배포 커밋, 주소, 점검 결과, 개선점 |

## 4. GitHub 코드 관리

### 기본 규칙

- `main`: 검사를 통과해 배포할 기준 코드.
- 기능별 작업 브랜치: `codex/request-form`, `codex/mentor-matching`, `codex/application-flow`처럼 목적을 드러낸다.
- 한 Issue에 하나의 기능이나 문제를 기록한다. 예: "희망 시간이 30분 이상 겹치는 멘토만 추천한다."
- 의미 있는 작업 단위로 커밋한다. 예: `feat: 도움 요청 저장 기능 추가`, `fix: 시간 경계가 맞닿는 멘토 제외`, `docs: 배포 환경 변수 설명 보완`.
- PR에는 문제, 바뀐 동작, 확인한 방법, 화면 변경 예시를 적는다.
- 자동 검사와 검토 후 main에 합친다. 가능한 경우 main 보호 규칙에서 PR과 필수 검사 통과를 요구한다.

일상 작업 흐름: Issue 작성 → 브랜치 생성 → 구현 → 로컬 검사 → 커밋·push → PR → 미리보기 확인 → main에 합치기.

### 저장소에 넣을 파일

소스 코드, 테스트, `package.json`, `package-lock.json`, SQL 마이그레이션, README, 배포 문서, 값이 비어 있는 `.env.example`을 함께 관리한다. SQL 파일을 함께 저장해야 다른 컴퓨터나 새 DB에서도 같은 구조를 재현할 수 있다.

실제 비밀값이 들어 있는 `.env.local`, 관리 키, DB 비밀번호, 배포 토큰과 실제 학생 데이터는 올리지 않는다. `node_modules`, `.next`, `.vercel`도 코드 변경 기록에 넣지 않는다.

현재 `.gitignore`는 `.env.production`을 예외적으로 추적하도록 되어 있다. 공개 URL·publishable key 자체는 비밀값이 아니지만, 테스트와 운영 연결이 섞이지 않도록 환경별 값은 Vercel 설정에서 명시하는 방식을 권한다. 관리 키를 이 파일에 추가하지 않는다.

### 자동 검사와 배포 경로

학생 프로젝트의 첫 구성은 GitHub Actions에서 검사하고 Vercel Git 연동으로 배포하는 방식이 단순하다.

- PR: GitHub 검사 + Vercel Preview 생성.
- main 반영: 검사 통과를 확인한 코드만 합치고 Vercel Production 배포.
- DB 변경: 웹 배포와 별도로 테스트한 마이그레이션 적용.

현재 프로젝트에는 `ci.yml`, `vercel.yml`, `supabase.yml`이 이미 있다. Vercel Git 연동을 배포 담당으로 선택한다면 `vercel.yml`의 별도 배포는 비활성화하는 변경이 필요하다. 처음에는 `supabase.yml`의 운영 DB 자동 적용도 수동 실행 단계로 제한하는 편이 순서를 확인하기 쉽다. 이 문서는 해당 설정을 변경하지 않는다.

기존 Actions 배포를 유지하고 싶다면 Vercel Git 자동 배포와 중복되지 않게 설정하고, 검사 성공 → DB 변경 성공 → 앱 배포 순서를 하나의 의존 관계로 연결한다. 현재 세 workflow는 독립적이므로 서로의 성공을 자동으로 기다리지 않는다.

로컬 기본 검사:

```bash
npm ci
npm run ci
```

`npm run ci`는 코드 규칙·타입·단위 테스트·빌드를 확인한다. 사용자 흐름 검사에는 별도로 `npm run test:e2e`를 사용한다. 현재 CI는 데모 모드 검사이므로 실제 DB 권한 검사를 추가로 수행해야 한다. `npm ci`는 설치, `npm run ci`는 프로젝트 검사 명령이다.

GitHub의 브랜치·PR 방식: [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow). Vercel의 브랜치별 배포: [GitHub 연동 문서](https://vercel.com/docs/git/vercel-for-github).

## 5. Supabase 테이블 설계

`auth.users`는 Supabase Auth가 관리한다. 학생 비밀번호를 별도 일반 테이블에 저장하지 않는다. 학생·요청·신청에는 고유번호를 두고, 다른 표의 고유번호를 연결해 관계를 만든다.

첫 핵심 기능을 이해할 때 중심이 되는 표는 아래 8개다. 표 이름은 현재 프로젝트와 맞췄다. 기존 승인 함수가 알림 표도 사용하므로, 현재 프로젝트를 설치할 때는 8개만 골라 만들지 않고 전체 마이그레이션과 필요한 보완 파일을 순서대로 적용한다.

| 테이블 | 쉬운 이름 | 주요 항목·관계 |
|---|---|---|
| `profiles` | 학생 기본 정보 | `id`는 로그인 사용자 ID와 연결. 표시 이름, 학년, 소개, 멘토 활동 여부, 역할 |
| `subjects` | 과목 목록 | 과목 ID, 과목명, 활성 여부. 과목명 중복 금지 |
| `mentor_settings` | 멘토 모집 설정 | 멘토 ID, 소개, 최대 수용 인원, 모집 여부. 학생 한 명당 설정 하나 |
| `mentor_subjects` | 멘토의 과목별 지도 정보 | 멘토 ID, 과목 ID, 단원, 숙련도, 선호 학년. 같은 멘토·과목 중복 금지 |
| `availability_slots` | 멘토의 가능 시간 | 사용자 ID, 요일, 시작·종료. 종료가 시작보다 늦어야 함 |
| `learning_requests` | 멘티의 도움 요청 | 멘티 ID, 과목 ID, 제목, 단원, 설명, 도움 유형, 희망 시간, 공개 범위, 상태 |
| `mentoring_applications` | 멘토에게 보낸 신청 | 요청 ID, 멘토 ID, 멘티 ID, 신청 내용, 상태, 신청일. 자기 신청·같은 요청으로 같은 멘토에게 보내는 중복 신청 차단 |
| `mentorships` | 수락된 멘토링 연결 | 요청 ID, 멘토 ID, 멘티 ID, 과목, 목표, 진행 상태. 요청당 최종 연결 하나 |

현재 추가로 정의된 4개 표는 `mentoring_sessions`(회차별 만남), `session_feedback`(회차별 평가), `notifications`(앱 안 알림), `content_reports`(신고 처리)이다. 화면 구현은 핵심 신청 흐름 다음으로 진행할 수 있다.

관계 설명:

> 학생 한 명은 도움 요청을 여러 개 작성할 수 있다. 도움 요청 하나로 여러 멘토에게 신청할 수 있지만 최종 연결은 한 명의 멘토에게만 허용한다. 연결이 성립하면 여러 번의 만남을 기록하고, 각 만남에 피드백을 남긴다.

현재 중복 방지 규칙은 `(learning_request_id, mentor_id)`를 항상 하나로 제한한다. 따라서 취소 후에도 같은 요청으로 같은 멘토에게 새 신청을 삽입할 수 없다. 재신청을 지원하려면 기존 신청을 다시 여는 절차나 중복 제한 정책을 먼저 정한다.

### 앞선 추천 계획에 필요한 보완

- `learning_requests.current_understanding`: 현재 이해 수준 3단계 추가.
- `learning_requests.goal_difficulty`: 기초·응용·심화 추가. 기존 `desired_level`과 중복 의미를 정리하고 기존 데이터를 어떻게 옮길지 정한다.
- 기존 `help_type`: 개념 설명·문제 풀이·시험 대비 등 목표 유형으로 활용하되 화면과 계산 함수에서 뜻을 통일한다.
- `mentor_subjects.preferred_understanding_levels`, `goal_tags`: 선호 지도 수준과 지도 목표 추가.
- 첫 버전 단원은 선택 항목의 표기를 통일한다. 단원 ID를 도입할 때는 과목별 단원 목록 표와 연결 구조를 추가한다.
- 현재 희망 시간은 여러 요일에 같은 시작·종료를 적용한다. 요일별로 다른 시간을 받으려면 `request_availability_slots(request_id, day_of_week, start_time, end_time)`을 추가한다.

남은 정원은 최대 수용 인원에서 현재 진행 예정·진행 중인 멘티 수를 빼서 계산한다. 앞선 추천 계획은 동일 학생 중복 제외 기준이다. 현재 승인 SQL은 연결 건수를 세므로, 추천과 승인 모두 같은 기준으로 맞춰야 한다.

### 권한 규칙

RLS는 데이터 표의 줄마다 읽기·작성·수정 권한을 확인하는 규칙이다. 로그인 여부와 함께 본인 또는 신청 당사자인지도 확인한다. 버튼을 숨기는 것만으로는 데이터 변경을 막을 수 없다.

- 학생은 본인 프로필과 가능 시간만 수정한다. 학생이 관리자 역할을 스스로 지정할 수 없게 한다.
- 멘티는 본인 요청으로만 신청하고, 대기 중인 본인 신청만 취소한다.
- 멘토는 자신에게 온 대기 신청만 수락·거절한다.
- 신청·연결·회차 기록은 필요한 당사자와 관리자에게만 공개한다.
- 비공개 요청도 신청받은 멘토가 필요한 내용을 볼 수 있도록 권한을 설계한다.
- 일반 화면에는 이메일을 표시하지 않고 전화번호·집 주소·외부 메신저 계정을 수집하지 않는다.
- 교내 구성원 확인은 학교 이메일 확인 또는 초대 방식 중 프로젝트 운영 조건에 맞게 정한다. 로그인 기능만 있다고 교내 학생임이 자동 확인되는 것은 아니다.

신청 수락은 신청 상태 변경, 연결 생성, 요청 마감, 다른 대기 신청 정리를 하나로 묶는다. 마지막 한 자리를 여러 명에게 동시에 배정하지 않도록 같은 멘토의 수락 처리를 순서대로 검사한다. `SECURITY DEFINER`가 필요한 기존 함수는 `search_path`, `auth.uid()` 검사, 호출 권한을 함께 관리한다.

권한 문서: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 6. DB 변경 파일 적용 순서

테이블·제약·인덱스·함수·권한 변경은 `supabase/migrations`에 새 SQL 파일로 남긴다. 이미 공유·적용한 파일을 고쳐 과거 기록을 바꾸지 않는다. 기존 4개 파일에 필요한 보완 마이그레이션을 추가하고 테스트 DB에서 먼저 확인한다.

1. Supabase 프로젝트를 준비하고 CLI에서 로그인한다.
2. 대상이 테스트 DB인지 확인하고 프로젝트를 연결한다.
3. 마이그레이션을 순서대로 적용한다.
4. 기본 과목 등 필요한 초기 데이터를 입력한다. 일반 `db push`와 seed 입력은 구분한다.
5. 테스트 계정으로 저장·조회·권한·동시 수락을 검증한다.
6. 운영 적용 전 변경 파일과 대상 프로젝트를 다시 확인한다.

현재 프로젝트의 명령 예시:

```bash
npm run supabase:link -- --project-ref YOUR_PROJECT_REF
npm run supabase:db:push
```

`YOUR_PROJECT_REF`는 실제 대상 프로젝트의 식별자로 바꾼다. 이 명령은 DB에 변경을 적용하므로 테스트와 운영 대상을 구분해서 사용한다. 기본 과목은 `supabase/seed.sql`로 관리한다. 데모 계정 생성 스크립트는 개발용으로만 사용한다.

운영 반영 순서는 구버전 앱에서도 문제없는 DB 변경 추가 → DB 확인 → 새 앱 배포로 잡는다. 예전 열 삭제 같은 정리 작업은 뒤에 수행한다. 웹 앱을 이전 배포로 되돌려도 DB 구조와 데이터가 자동으로 되돌아가지는 않는다.

참고: [Supabase 마이그레이션](https://supabase.com/docs/guides/deployment/database-migrations).

## 7. 환경 변수 연결

환경 변수는 코드가 실행될 때 밖에서 전달하는 설정값이다. 코드에는 변수 이름을 쓰고 실제 값은 로컬 또는 배포 환경에 입력한다.

### 웹서비스 실행에 필요한 값

| 변수 | 넣을 값 | 얻는 곳 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 연결할 Supabase 프로젝트 URL | Supabase 프로젝트 Connect 화면 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 같은 프로젝트의 공개 연결 키 | Connect 또는 Settings → API Keys |
| `NEXT_PUBLIC_SITE_URL` | 해당 환경의 StudyBridge 주소 | 로컬 주소 또는 Vercel 배포 주소 |
| `NEXT_PUBLIC_DEMO_MODE` | 데모는 `true`, 실제 DB 연결은 `false` | 개발자가 정하는 실행 설정 |

로컬 실제 DB 연결 예시이며 값은 모두 자리표시자다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false
```

위 값은 로컬 `.env.local`에 넣는다. Vercel에서는 프로젝트 Settings → Environment Variables에 같은 이름을 등록하되 환경별 값을 구분한다.

| 환경 | 쉬운 뜻 | DB·실행 설정 |
|---|---|---|
| Development | 내 컴퓨터에서 개발 | 개발·테스트용 DB, 로컬 주소 |
| Preview | 새 코드를 확인하는 미리보기 | 테스트 DB 또는 `NEXT_PUBLIC_DEMO_MODE=true`. 실제 로그인 검증에는 별도 테스트 DB 사용 |
| Production | 학생들이 사용할 실제 서비스 | 운영 DB, 운영 주소, `NEXT_PUBLIC_DEMO_MODE=false` |

현재 코드는 데모 설정이 없거나 Supabase URL·공개 키가 부족해도 데모 모드로 동작한다. 따라서 배포 화면이 열린다는 사실만으로 실제 DB 연결 성공을 판단하지 않는다. 두 계정으로 새 요청을 저장하고 재로그인 후 다시 조회하는 검사가 필요하다.

`NEXT_PUBLIC_` 값은 브라우저에 전달될 수 있다. Publishable key는 공개 사용을 위한 키이며, 실제 데이터 접근은 로그인과 RLS로 제한한다. Secret key와 기존 service-role key는 넓은 권한을 가지므로 브라우저용 변수로 쓰지 않는다. 일반 학생의 저장·조회는 공개 키와 로그인 정보로 처리한다.

현재 `.env.example`에는 호환용 `NEXT_PUBLIC_SUPABASE_ANON_KEY`도 있다. 새 설정은 publishable key를 우선 사용한다. `SUPABASE_SERVICE_ROLE_KEY`는 현재 데모 계정 생성 스크립트에서 사용하며, 일반 웹서비스 실행 때문에 Vercel에 반드시 넣어야 하는 값은 아니다.

참고: [Supabase API 키](https://supabase.com/docs/guides/getting-started/api-keys), [Next.js 환경 변수](https://nextjs.org/docs/app/guides/environment-variables).

### GitHub Actions를 통한 배포를 선택할 때의 값

GitHub 저장소 Settings → Secrets and variables → Actions에 등록한다. 이 값들이 Vercel 실행 환경에 자동 복사되는 것은 아니다.

| 사용 목적 | 기존 workflow가 읽는 이름 |
|---|---|
| Actions에서 Vercel CLI로 배포 | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| Actions에서 Supabase DB 변경 적용 | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` |

실제 값은 각 서비스의 계정·프로젝트 설정에서 확인한다. 계정 토큰과 DB 비밀번호는 비밀값이며 코드에 넣지 않는다. ORG/PROJECT ID는 연결 대상을 가리키는 식별자다.

Vercel Git 연동으로 배포하고 DB 변경도 로컬에서 적용하는 초기 방식에는 위 6개 값을 GitHub에 모두 등록할 필요가 없다. 실제 선택한 자동화가 사용하는 값만 등록한다.

## 8. Vercel과 로그인 주소 설정

1. Vercel에서 GitHub 저장소를 가져온다.
2. Framework를 Next.js로 선택하고 Root Directory를 `package.json`이 있는 폴더로 맞춘다.
3. 현재 프로젝트 설정대로 Install Command는 `npm ci`, Build Command는 `npm run build`로 둔다. Next.js의 출력 폴더는 기본 설정을 사용한다. Node.js 버전은 현재 CI의 24와 맞춘다.
4. Preview 환경을 설정하고 먼저 테스트 배포한다.
5. 브라우저에서 가입·로그인·요청 저장·추천·신청·수락을 확인한다.
6. Production에 운영 Supabase URL·공개 키와 운영 사이트 주소를 등록한다.
7. Supabase Auth의 URL Configuration에서 Site URL을 운영 주소로 설정한다.
8. Redirect URLs에는 앱에서 구현한 인증 복귀 경로를 정확히 등록한다. 예를 들어 `/auth/confirm`을 구현했다면 로컬·검증·운영의 해당 URL을 등록한다. 주소를 등록하는 것만으로 이 경로가 구현되지는 않는다.
9. 인증 메일 확인 후 서버가 로그인 상태를 만들고 프로필을 생성할 수 있는지 확인한다. 메일 확인 전에는 로그인 상태가 없을 수 있으므로 가입 직후 프로필 저장이 무조건 성공한다고 가정하지 않는다.
10. 환경 변수를 수정한 뒤 새 배포를 만들고 다시 검사한다. `NEXT_PUBLIC_` 값은 빌드 결과에 포함될 수 있어 기존 배포가 자동으로 바뀌지 않는다.

Preview 인증을 지원할 때는 고정된 검증 주소 또는 본인 프로젝트·팀에 제한한 주소 규칙을 사용한다. 모든 Vercel 사이트를 허용하는 `https://*.vercel.app` 규칙은 사용하지 않는다. 운영 주소는 정확한 도메인과 복귀 경로로 제한한다.

참고: [Vercel 환경 변수](https://vercel.com/docs/environment-variables), [Supabase 인증 복귀 주소](https://supabase.com/docs/guides/auth/redirect-urls), [Next.js 서버 로그인 연결](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs).

## 9. 배포 완료 기준

- 새로 가입한 학생의 인증·프로필 생성·로그인·로그아웃이 이어진다.
- 멘토가 등록한 과목과 시간이 다른 학생의 실제 추천 결과에 반영된다.
- 요청과 신청이 DB에 저장되고 새로고침·재로그인 후 유지된다.
- 두 단원 중 하나 일치, 시간 경계가 맞닿음, 연속 시간 부족, 정원 마감 등 추천 사례를 확인한다.
- 멘티는 자신의 요청만 신청에 사용하고, 멘토만 본인에게 온 신청을 수락할 수 있다.
- 제삼자 계정으로 다른 사람 신청·기록을 조회하거나 수정할 수 없다.
- 학생이 관리자 역할을 직접 지정할 수 없다.
- 두 수락이 동시에 발생해도 마지막 한 자리가 중복 배정되지 않는다.
- 모바일에서 입력·추천 비교·신청 확인이 가능하다.
- Vercel 빌드·실행 로그에 오류와 비밀값 출력이 없다.
- 테스트·운영 환경이 구분되고, 배포 커밋·DB 변경 파일·검사 결과가 기록되어 있다.

## 10. 현재 로컬 프로젝트에서 먼저 보완할 부분

1. 다수의 목록·상세 페이지가 `demoMentors`, `demoRequests`, `demoApplications`, `demoCurrentUser`를 직접 사용한다. 실제 모드에서는 로그인한 사용자와 DB 조회 결과를 사용하도록 변경해야 한다.
2. 현재 회원가입은 가입 직후 프로필 삽입을 시도한다. 인증 메일 확인이 필요한 설정에서도 프로필 생성과 로그인 복귀가 이어지도록 보완해야 한다.
3. 로컬 RLS의 프로필 INSERT는 본인 ID만 검사하므로 최초 생성 시 관리자 역할 지정 차단을 보강해야 한다. 신청 INSERT는 요청 소유자 확인을, UPDATE는 상태 변경 주체와 참여자 고유번호 변경 방지를 보강해야 한다.
4. 승인 함수는 같은 멘토의 서로 다른 요청을 동시에 수락할 때 정원을 함께 보호하도록 보완해야 한다. 현재 연결 건수와 추천의 서로 다른 멘티 수 기준도 통일해야 한다.
5. 독립된 검사·DB·앱 배포 workflow 사이의 실행 순서와 중복 배포 경로를 정리해야 한다.

테이블·권한·배포 파일이 존재하는 것은 확인했지만, 실제 원격 DB에 적용되어 검증된 상태라는 뜻은 아니다. 위 항목을 개발 단계와 탐구 과제로 기록하고 검증 후 완료 실적으로 전환한다.
