import { SignupForm } from "@/components/forms/SignupForm";

export const metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-emerald-800">StudyBridge</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950">회원가입</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">이메일, 닉네임, 학년으로 시작합니다. 전화번호와 집 주소는 수집하지 않습니다.</p>
        <div className="mt-6">
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
