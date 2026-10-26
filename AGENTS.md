# StudyBridge Agent Guide

## 프로젝트 목적

StudyBridge는 교내 학생이 학습 도움 요청을 등록하고, 적합한 또래 멘토와 연결되어 멘토링 세션과 피드백을 관리하는 웹서비스입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Supabase Auth, RLS
- React Hook Form, Zod
- Vitest, React Testing Library, Playwright

## 주요 폴더

- `src/app`: 페이지, 서버 액션, API 라우트
- `src/components`: 공통 UI와 기능별 컴포넌트
- `src/lib`: 상수, 데모 데이터, Supabase, 검증, 추천 알고리즘
- `src/types`: 도메인 타입
- `supabase/migrations`: DB 스키마, 함수, RLS 정책
- `tests`: 단위, 컴포넌트, E2E 테스트

## 코드 스타일

- UI 텍스트는 한국어로 작성합니다.
- TypeScript `any`는 피하고 명시적 도메인 타입을 사용합니다.
- 같은 UI는 공통 컴포넌트로 재사용합니다.
- 사용자 입력은 클라이언트와 서버에서 모두 Zod로 검증합니다.
- 오류 메시지는 사용자에게 이해 가능한 한국어로 변환합니다.

## 데이터베이스 수정 규칙

- 테이블, 제약, 인덱스, 함수 변경은 `supabase/migrations`에 추가합니다.
- RLS 정책을 우회하지 않습니다.
- `SECURITY DEFINER` 함수는 반드시 `search_path`를 명시하고 `auth.uid()` 검사를 포함합니다.
- 관리자 작업은 클라이언트 표시 여부가 아니라 DB 정책과 서버 액션에서 보호합니다.

## 보안 규칙

- 전화번호, 집 주소, 외부 메신저 계정을 수집하지 않습니다.
- 이메일은 일반 사용자 화면에 노출하지 않습니다.
- 비밀키를 커밋하지 않습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트 코드에서 사용하지 않습니다.

## 테스트 명령

```bash
npm run ci
```

개별 확인이 필요하면 아래 명령을 실행합니다.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Playwright 테스트를 수정했다면 다음도 실행합니다.

```bash
npm run test:e2e
```

## 완료 전 확인

- `.env.example` 변경이 필요한지 확인합니다.
- DB 변경이 있으면 README의 마이그레이션 설명도 갱신합니다.
- 배포 설정 변경이 있으면 `docs/deployment.md`와 GitHub Actions secret 목록도 갱신합니다.
- 사용자 흐름이 모바일에서도 깨지지 않는지 확인합니다.
- 데모 모드와 실제 Supabase 연결 구조를 모두 고려합니다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
