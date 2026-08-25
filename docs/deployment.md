# GitHub, Vercel, Supabase 배포 가이드

이 문서는 StudyBridge를 GitHub 저장소, Vercel 배포, Supabase 운영 DB에 연결하기 위한 절차입니다. 비밀키는 저장소에 커밋하지 않고 GitHub Secrets, Vercel Environment Variables, 로컬 `.env.local`에만 저장합니다.

## 1. GitHub 저장소 연결

현재 로컬 프로젝트에는 원격 저장소가 연결되어 있지 않습니다. GitHub에서 빈 저장소를 만든 뒤 아래 명령으로 연결합니다.

```bash
git branch -M main
git remote add origin https://github.com/Mini569/studybridge.git
git push -u origin main
```

저장소 이름을 다르게 만들었다면 `origin` URL만 해당 저장소 주소로 바꿉니다.

## 2. GitHub Secrets

GitHub 저장소의 `Settings > Secrets and variables > Actions`에 아래 값을 추가합니다.

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
SUPABASE_DB_PASSWORD
```

이 값들이 있어야 `.github/workflows/vercel.yml`과 `.github/workflows/supabase.yml`이 원격에서 정상 실행됩니다.

## 3. Supabase 설정

1. Supabase에서 새 프로젝트를 만듭니다.
2. `Project Settings > API`에서 `Project URL`, `anon public key`, `service_role key`를 확인합니다.
3. 로컬 `.env.local`과 Vercel 환경변수에 아래 값을 입력합니다. `NEXT_PUBLIC_` 공개값은 `.env.production`에도 포함되어 Git 기반 Vercel 배포에서 바로 사용됩니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_DEMO_MODE=false
```

4. Auth redirect URL에 로컬과 Vercel 주소를 등록합니다.

```text
http://localhost:3000
https://*.vercel.app
운영 Vercel 도메인
```

5. Supabase CLI로 프로젝트를 연결하고 마이그레이션을 적용합니다.

```bash
npm run supabase:link -- --project-ref <SUPABASE_PROJECT_REF>
npm run supabase:db:push
```

CLI를 쓰지 않는 경우 Supabase SQL Editor에서 아래 순서대로 실행합니다.

```text
supabase/migrations/20260825075323_0001_initial_schema.sql
supabase/migrations/20260825075440_0002_rls_policies.sql
supabase/migrations/20260825075454_0003_structured_feedback.sql
supabase/migrations/20260825075844_0004_harden_rls_helpers.sql
supabase/seed.sql
```

## 4. Vercel 설정

1. Vercel에서 GitHub 저장소를 Import 합니다.
2. Framework Preset은 Next.js를 사용합니다.
3. Environment Variables에 `.env.example`의 운영 값을 입력합니다. Supabase 공개 키는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 우선 사용하고, 기존 `anon public key`만 있는 프로젝트는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 입력합니다. 현재 저장소에는 공개 Supabase URL/key가 `.env.production`에 들어 있어 Vercel Git 배포가 실제 Supabase 프로젝트에 연결됩니다.
4. 첫 연결 이후 로컬에서 Vercel 프로젝트 정보를 내려받을 수 있습니다.

```bash
npm run vercel:pull
npm run vercel:build
npm run vercel:deploy
```

GitHub Actions 배포는 `.github/workflows/vercel.yml`이 담당합니다. PR은 preview 배포, `main` 또는 `master` push는 production 배포로 실행됩니다.

## 5. 자동화된 검증과 배포

- `.github/workflows/ci.yml`: PR과 `main`/`master` push에서 lint, typecheck, test, build, E2E를 실행합니다.
- `.github/workflows/vercel.yml`: Vercel preview/production 배포를 실행합니다.
- `.github/workflows/supabase.yml`: `supabase/**` 변경 시 또는 수동 실행으로 DB 마이그레이션을 적용합니다.

## 6. 배포 전 체크리스트

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- Supabase 마이그레이션 적용 완료
- Vercel 환경변수 입력 완료
- GitHub Secrets 입력 완료
- 운영 `NEXT_PUBLIC_SITE_URL`이 실제 Vercel 도메인과 일치
