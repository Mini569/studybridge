import { Inbox } from "lucide-react";
import Link from "next/link";

import { LinkButton } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { AppShell } from "@/components/layout/AppShell";
import { loadApplications, loadCurrentProfile } from "@/lib/data/studybridge";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "내 신청",
};

type ApplicationSearchParams = {
  tab?: "sent" | "received";
};

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<ApplicationSearchParams> }) {
  const params = await searchParams;
  const [allApplications, currentUser] = await Promise.all([loadApplications(), loadCurrentProfile()]);
  const activeTab = params.tab === "received" ? "received" : "sent";
  const applications =
    activeTab === "received"
      ? allApplications.filter(({ application }) => application.mentorId === currentUser.id)
      : allApplications.filter(({ application }) => application.menteeId === currentUser.id);

  return (
    <AppShell>
      <PageHeader description="멘토링 신청 상태를 보낸 신청과 받은 신청으로 나누어 확인합니다." title="내 신청" />

      <div className="mt-6 flex rounded-lg border border-zinc-200 bg-white p-1 shadow-sm sm:w-fit">
        {[
          { href: "/applications?tab=sent", label: "보낸 신청", value: "sent" },
          { href: "/applications?tab=received", label: "받은 신청", value: "received" },
        ].map((tab) => (
          <Link
            className={cn(
              "flex min-h-10 flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold sm:flex-none",
              activeTab === tab.value ? "bg-emerald-700 text-white" : "text-zinc-700 hover:bg-zinc-100",
            )}
            href={tab.href}
            key={tab.value}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {applications.length > 0 ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {applications.map((item) => (
            <ApplicationCard {...item} direction={activeTab} key={item.application.id} />
          ))}
        </section>
      ) : (
        <div className="mt-6">
          <EmptyState
            action={<LinkButton href={activeTab === "sent" ? "/mentors" : "/profile"}>{activeTab === "sent" ? "멘토 찾기" : "멘토로 등록하기"}</LinkButton>}
            description={activeTab === "sent" ? "멘토에게 보낸 신청이 없습니다." : "멘토로 공개되면 받은 신청을 이곳에서 승인하거나 거절할 수 있습니다."}
            icon={Inbox}
            title="표시할 신청이 없습니다"
          />
        </div>
      )}
    </AppShell>
  );
}
