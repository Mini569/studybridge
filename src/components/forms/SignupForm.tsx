"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { signupWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/common/Button";
import { FormField, inputStyles } from "@/components/forms/FormField";
import { GRADE_OPTIONS } from "@/lib/constants/options";
import { signupSchema, type SignupFormValues, type SignupInput } from "@/lib/validation/schemas";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues, unknown, SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      grade: 1,
      termsAccepted: false,
    },
  });

  function submit(values: SignupInput) {
    setServerMessage(null);
    startTransition(async () => {
      const result = await signupWithPassword(values);
      setServerMessage(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      <FormField error={errors.displayName?.message} htmlFor="displayName" label="표시 이름">
        <input className={inputStyles} id="displayName" {...register("displayName")} aria-invalid={Boolean(errors.displayName)} />
      </FormField>

      <FormField error={errors.email?.message} htmlFor="email" label="이메일">
        <input autoComplete="email" className={inputStyles} id="email" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.password?.message} htmlFor="password" label="비밀번호">
          <div className="relative">
            <input
              autoComplete="new-password"
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

        <FormField error={errors.confirmPassword?.message} htmlFor="confirmPassword" label="비밀번호 확인">
          <input
            autoComplete="new-password"
            className={inputStyles}
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            {...register("confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
        </FormField>
      </div>

      <FormField error={errors.grade?.message} htmlFor="grade" label="학년">
        <select className={inputStyles} id="grade" {...register("grade", { valueAsNumber: true })}>
          {GRADE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <label className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
        <input className="mt-1 h-4 w-4 accent-emerald-700" type="checkbox" {...register("termsAccepted")} />
        <span>
          교내 학습 목적에 맞게 서비스를 이용하고, 전화번호·집 주소·외부 메신저 계정을 수집하지 않는 원칙에 동의합니다.
        </span>
      </label>
      {errors.termsAccepted ? <p className="text-xs font-medium text-red-700">{errors.termsAccepted.message}</p> : null}

      {serverMessage ? (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {serverMessage}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        <UserPlus aria-hidden="true" className="h-4 w-4" />
        {isPending ? "가입 처리 중" : "회원가입"}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        이미 계정이 있나요?{" "}
        <Link className="font-semibold text-emerald-800 hover:text-emerald-950" href="/login">
          로그인
        </Link>
      </p>
    </form>
  );
}
