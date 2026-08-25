import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpenCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { DemoBanner } from "@/components/layout/DemoBanner";
import { demoCurrentUser, demoNotifications } from "@/lib/demo/data";
import { isDemoMode } from "@/lib/env";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/mentors", label: "멘토 찾기", icon: UsersRound },
  { href: "/requests", label: "도움 요청", icon: ClipboardList },
  { href: "/applications", label: "내 신청", icon: BookOpenCheck },
  { href: "/mentorships", label: "내 멘토링", icon: GraduationCap },
  { href: "/notifications", label: "알림", icon: Bell },
  { href: "/profile", label: "프로필", icon: UserRound },
  { href: "/admin", label: "관리자", icon: ShieldCheck },
];

interface AppShellProps {
  children: ReactNode;
}

function Logo() {
  return (
    <Link className="flex items-center gap-2 font-bold text-zinc-950" href="/">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
        <GraduationCap aria-hidden="true" className="h-5 w-5" />
      </span>
      <span>StudyBridge</span>
    </Link>
  );
}

function NavList({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav aria-label="주요 메뉴" className={cn("grid gap-1", mobile ? "mt-3" : "mt-8")}>
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
            href={item.href}
            key={item.href}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  const unreadCount = demoNotifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      {isDemoMode ? <DemoBanner /> : null}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Logo />
          <details className="relative">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-300 text-zinc-700">
              <Menu aria-label="메뉴 열기" className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
              <NavList mobile />
            </div>
          </details>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-zinc-200 bg-white px-4 py-6 lg:block">
          <Logo />
          <NavList />
          <div className="absolute bottom-6 left-4 right-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-950">{demoCurrentUser.displayName}</p>
            <p className="mt-1 text-xs text-zinc-600">{demoCurrentUser.grade}학년 · 읽지 않은 알림 {unreadCount}개</p>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
