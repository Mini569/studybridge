"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { completeOnboarding } from "@/app/actions/auth";
import { Button } from "@/components/common/Button";
import { FormField, inputStyles, textareaStyles } from "@/components/forms/FormField";
import { DAY_OPTIONS, GRADE_OPTIONS } from "@/lib/constants/options";
import { onboardingSchema } from "@/lib/validation/schemas";
import type { Subject } from "@/types/domain";

type OnboardingFormValues = z.input<typeof onboardingSchema>;
type OnboardingInput = z.output<typeof onboardingSchema>;

export function OnboardingForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormValues, unknown, OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "김민서",
      grade: 2,
      bio: "",
      interests: ["수학"],
      needs: ["수학"],
      wantsToMentor: false,
      mentorSubjectIds: [],
      mentorTopics: "",
      proficiencyLevel: 3,
      availableDays: [],
      availableStartTime: "17:00",
      availableEndTime: "19:00",
      maxActiveMentees: 3,
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const wantsToMentor = watch("wantsToMentor");

  function submit(values: OnboardingInput) {
    setServerMessage(null);
    startTransition(async () => {
      const result = await completeOnboarding(values);
      setServerMessage(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.displayName?.message} htmlFor="displayName" label="닉네임">
          <input className={inputStyles} id="displayName" {...register("displayName")} />
        </FormField>
        <FormField error={errors.grade?.message} htmlFor="grade" label="학년">
          <select className={inputStyles} id="grade" {...register("grade", { valueAsNumber: true })}>
            {GRADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField error={errors.bio?.message} htmlFor="bio" label="간단한 자기소개">
        <textarea className={textareaStyles} id="bio" placeholder="어떤 과목을 배우고 싶은지 간단히 적어 주세요." {...register("bio")} />
      </FormField>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-900">관심 과목</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm" key={subject.id}>
              <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={subject.name} {...register("interests")} />
              {subject.name}
            </label>
          ))}
        </div>
        {errors.interests ? <p className="mt-2 text-xs font-medium text-red-700">{errors.interests.message}</p> : null}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-900">도움받고 싶은 과목</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm" key={subject.id}>
              <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={subject.name} {...register("needs")} />
              {subject.name}
            </label>
          ))}
        </div>
        {errors.needs ? <p className="mt-2 text-xs font-medium text-red-700">{errors.needs.message}</p> : null}
      </fieldset>

      <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <span>
          <span className="block text-sm font-semibold text-zinc-950">멘토로도 활동할 의향이 있습니다</span>
          <span className="mt-1 block text-xs leading-5 text-zinc-500">가능 과목과 시간을 공개해 멘티의 신청을 받을 수 있습니다.</span>
        </span>
        <input className="h-5 w-5 accent-emerald-700" type="checkbox" {...register("wantsToMentor")} />
      </label>

      {wantsToMentor ? (
        <section className="space-y-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-base font-bold text-emerald-950">멘토 활동 정보</h2>
          <fieldset>
            <legend className="text-sm font-semibold text-zinc-900">멘토링 가능한 과목</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <label className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-3 text-sm" key={subject.id}>
                  <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={subject.id} {...register("mentorSubjectIds")} />
                  {subject.name}
                </label>
              ))}
            </div>
            {errors.mentorSubjectIds ? <p className="mt-2 text-xs font-medium text-red-700">{errors.mentorSubjectIds.message}</p> : null}
          </fieldset>

          <FormField error={errors.mentorTopics?.message} htmlFor="mentorTopics" label="자신 있는 세부 단원">
            <input className={inputStyles} id="mentorTopics" placeholder="예: 미적분, 함수, 수열" {...register("mentorTopics")} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField error={errors.proficiencyLevel?.message} htmlFor="proficiencyLevel" label="숙련도">
              <input className={inputStyles} id="proficiencyLevel" max={5} min={1} type="number" {...register("proficiencyLevel", { valueAsNumber: true })} />
            </FormField>
            <FormField error={errors.maxActiveMentees?.message} htmlFor="maxActiveMentees" label="최대 멘티 수">
              <input className={inputStyles} id="maxActiveMentees" max={10} min={1} type="number" {...register("maxActiveMentees", { valueAsNumber: true })} />
            </FormField>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-zinc-900">가능한 요일</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {DAY_OPTIONS.map((day) => (
                <label className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-3 text-sm" key={day.value}>
                  <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={day.value} {...register("availableDays")} />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField htmlFor="availableStartTime" label="가능 시작 시간">
              <input className={inputStyles} id="availableStartTime" type="time" {...register("availableStartTime")} />
            </FormField>
            <FormField htmlFor="availableEndTime" label="가능 종료 시간">
              <input className={inputStyles} id="availableEndTime" type="time" {...register("availableEndTime")} />
            </FormField>
          </div>
        </section>
      ) : null}

      {serverMessage ? (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {serverMessage}
        </p>
      ) : null}

      <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "온보딩 완료"}
      </Button>
    </form>
  );
}
