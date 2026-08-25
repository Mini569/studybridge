import { ArrowRight, BookOpen, CalendarClock, CheckCircle2, GraduationCap, Search, ShieldCheck, UsersRound } from "lucide-react";

import { LinkButton } from "@/components/common/Button";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { isDemoMode } from "@/lib/env";

const steps = [
  {
    title: "도움이 필요한 과목 등록",
    description: "과목, 세부 단원, 가능한 시간과 원하는 도움 방식을 작성합니다.",
    icon: BookOpen,
  },
  {
    title: "추천 멘토 확인",
    description: "과목, 단원, 시간, 학년 선호도 기반으로 설명 가능한 추천 점수를 보여줍니다.",
    icon: Search,
  },
  {
    title: "멘토링 기록 관리",
    description: "승인된 멘토링의 일정, 세션 기록, 피드백을 한곳에서 관리합니다.",
    icon: CalendarClock,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      {isDemoMode ? <DemoBanner /> : null}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <GraduationCap aria-hidden="true" className="h-6 w-6" />
            </span>
            <span>StudyBridge</span>
          </div>
          <nav className="hidden items-center gap-2 sm:flex" aria-label="랜딩 메뉴">
            <LinkButton href="/login" variant="ghost">
              로그인
            </LinkButton>
            <LinkButton href="/signup">회원가입</LinkButton>
          </nav>
          <LinkButton className="sm:hidden" href="/login" variant="secondary">
            로그인
          </LinkButton>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold text-emerald-800">교내 학습 멘토링 연결 서비스</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-zinc-950 sm:text-5xl">
              배움을 연결하고 함께 성장하세요
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
              도움이 필요한 학생은 과목과 학습 내용을 등록하고, 멘토 학생은 가능한 과목과 시간을 공개해 안전한 교내 멘토링을 시작합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/signup">
                시작하기
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/dashboard" variant="secondary">
                데모 대시보드 보기
              </LinkButton>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-zinc-950">추천 멘토</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">92점</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">수학 · 미적분 · 화요일 저녁 가능</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <UsersRound aria-hidden="true" className="h-5 w-5 text-emerald-700" />
                <p className="mt-3 text-sm font-semibold">활성 멘토 6명</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-sky-700" />
                <p className="mt-3 text-sm font-semibold">세션 기록 관리</p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-zinc-950">개인 연락처 없이 교내 장소 중심으로 진행</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">교실, 도서관, 자율학습실, 온라인, 기타 교내 공간만 선택합니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" key={step.title}>
                <Icon aria-hidden="true" className="h-6 w-6 text-emerald-700" />
                <h2 className="mt-4 text-lg font-bold text-zinc-950">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-bold">멘토가 되는 방법</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              프로필에서 멘토 활동을 활성화하고 가능한 과목, 세부 단원, 숙련도, 요일과 시간을 등록하면 신청을 받을 수 있습니다.
            </p>
          </section>
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-bold">멘티가 도움받는 방법</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              도움 요청을 작성하거나 멘토 목록을 필터링해 원하는 멘토에게 신청하고, 승인 후 세션을 기록합니다.
            </p>
          </section>
        </div>

        <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-emerald-800" />
            <p className="text-sm leading-6 text-emerald-950">
              StudyBridge는 학생 개인정보 보호를 우선합니다. 전화번호, 집 주소, 외부 메신저 계정은 수집하지 않고, 관리자 기능과 주요 데이터 변경은 서버와 DB 권한 정책으로 보호합니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
