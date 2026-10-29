import Link from "next/link";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export const metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-emerald-800">StudyBridge</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950">회원가입</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">Google 계정으로 가입한 뒤 닉네임, 학년과 관심 과목만 설정합니다.</p>
        <div className="mt-6">
          <GoogleAuthButton mode="signup" />
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          계속하면 교내 학습 목적으로 서비스를 이용하는 데 동의한 것으로 봅니다. 전화번호, 집 주소, 외부 메신저 계정은 수집하지 않습니다.
        </p>
        <p className="mt-5 text-center text-sm text-zinc-600">
          이미 이용 중인가요?{" "}
          <Link className="font-semibold text-emerald-800 hover:text-emerald-950" href="/login">
            로그인
          </Link>
        </p>
      </section>
    </main>
  );
}
