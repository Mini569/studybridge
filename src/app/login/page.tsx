import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = {
  title: "로그인",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-emerald-800">StudyBridge</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950">로그인</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">이메일과 비밀번호로 교내 멘토링 활동을 이어가세요.</p>
        {notice === "confirmation-failed" ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900" role="alert">
            가입 확인 링크가 만료되었거나 프로필을 준비하지 못했습니다. 다시 로그인해 주세요.
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
