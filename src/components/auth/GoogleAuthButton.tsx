"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface GoogleAuthButtonProps {
  mode: "login" | "signup";
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M21.6 12.23c0-.71-.06-1.23-.2-1.77H12v3.4h5.52a4.73 4.73 0 0 1-2.05 3.02l-.02.11 2.98 2.31.21.02c1.95-1.8 3.07-4.45 3.07-7.09Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.97-.89 6.63-2.42l-3.17-2.45c-.85.57-1.99.97-3.46.97a6 6 0 0 1-5.67-4.14l-.1.01-3.1 2.4-.04.1A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.33 13.96A6.2 6.2 0 0 1 6 12c0-.68.12-1.34.32-1.96v-.12L3.2 7.48l-.1.05A10 10 0 0 0 2 12c0 1.6.38 3.1 1.09 4.47l3.24-2.51Z" fill="#FBBC05" />
      <path d="M12 5.9c1.88 0 3.15.81 3.87 1.47l2.83-2.76A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.91 5.53l3.23 2.51A6.02 6.02 0 0 1 12 5.9Z" fill="#EA4335" />
    </svg>
  );
}

export function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const label = mode === "login" ? "Google로 로그인" : "Google로 회원가입";

  async function authenticateWithGoogle() {
    setIsPending(true);
    setErrorMessage(null);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = new URL("/auth/callback", window.location.origin).toString();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      setErrorMessage("Google 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50" disabled={isPending} onClick={authenticateWithGoogle}>
        <GoogleIcon />
        {isPending ? "Google로 이동 중" : label}
      </Button>
      {errorMessage ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
