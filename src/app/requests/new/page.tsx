import { LinkButton } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { LearningRequestForm } from "@/components/forms/LearningRequestForm";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "도움 요청 작성",
};

export default function NewRequestPage() {
  return (
    <AppShell>
      <PageHeader
        actions={<LinkButton href="/requests" variant="secondary">목록으로</LinkButton>}
        description="어려운 점과 원하는 도움 방식을 구체적으로 작성하면 추천 멘토 점수가 더 정확해집니다."
        title="도움 요청 작성"
      />
      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <LearningRequestForm />
      </section>
    </AppShell>
  );
}
