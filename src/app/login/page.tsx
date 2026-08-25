import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-emerald-800">StudyBridge</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950">로그인</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">이메일과 비밀번호로 교내 멘토링 활동을 이어가세요.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
