"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { loginWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/common/Button";
import { FormField, inputStyles } from "@/components/forms/FormField";
import { loginSchema, type LoginInput } from "@/lib/validation/schemas";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function submit(values: LoginInput) {
    setServerMessage(null);
    startTransition(async () => {
      const result = await loginWithPassword(values);
      setServerMessage(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      <FormField error={errors.email?.message} htmlFor="email" label="이메일">
        <input
          autoComplete="email"
          className={inputStyles}
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>

      <FormField error={errors.password?.message} htmlFor="password" label="비밀번호">
        <div className="relative">
          <input
            autoComplete="current-password"
            className={`${inputStyles} pr-12`}
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
          />
          <button
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      {serverMessage ? (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {serverMessage}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        <LogIn aria-hidden="true" className="h-4 w-4" />
        {isPending ? "로그인 중" : "로그인"}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        아직 계정이 없나요?{" "}
        <Link className="font-semibold text-emerald-800 hover:text-emerald-950" href="/signup">
          회원가입
        </Link>
      </p>
    </form>
  );
}
