"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createLearningRequest } from "@/app/actions/requests";
import { Button } from "@/components/common/Button";
import { FormField, inputStyles, textareaStyles } from "@/components/forms/FormField";
import { DAY_OPTIONS, HELP_TYPE_OPTIONS } from "@/lib/constants/options";
import { learningRequestSchema, type LearningRequestFormValues, type LearningRequestInput } from "@/lib/validation/schemas";
import type { Subject } from "@/types/domain";

export function LearningRequestForm({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LearningRequestFormValues, unknown, LearningRequestInput>({
    resolver: zodResolver(learningRequestSchema),
    defaultValues: {
      title: "",
      subjectId: "",
      topics: "",
      description: "",
      helpType: "concept",
      desiredLevel: 3,
      preferredDays: [],
      preferredStartTime: "17:00",
      preferredEndTime: "19:00",
      expectedSessions: 3,
      visibility: "school",
    },
  });

  function submit(values: LearningRequestInput) {
    setServerMessage(null);
    startTransition(async () => {
      const result = await createLearningRequest(values);
      setServerMessage(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <FormField error={errors.title?.message} htmlFor="title" label="제목">
        <input className={inputStyles} id="title" placeholder="예: 미적분 접선 문제가 어려워요" {...register("title")} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.subjectId?.message} htmlFor="subjectId" label="과목">
          <select className={inputStyles} id="subjectId" {...register("subjectId")}>
            <option value="">과목 선택</option>
            {subjects.filter((subject) => subject.isActive).map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField error={errors.helpType?.message} htmlFor="helpType" label="원하는 도움 방식">
          <select className={inputStyles} id="helpType" {...register("helpType")}>
            {HELP_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField error={errors.topics?.message} hint="쉼표로 여러 단원을 구분할 수 있습니다." htmlFor="topics" label="세부 단원 또는 주제">
        <input className={inputStyles} id="topics" placeholder="예: 미적분, 함수, 접선" {...register("topics")} />
      </FormField>

      <FormField
        error={errors.description?.message}
        hint="전화번호, 집 주소, 외부 메신저 계정 등 개인 연락처는 입력하지 마세요."
        htmlFor="description"
        label="현재 어려운 점"
      >
        <textarea className={textareaStyles} id="description" placeholder="어떤 부분에서 막히는지, 어떤 방식의 도움이 필요한지 적어 주세요." {...register("description")} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.desiredLevel?.message} htmlFor="desiredLevel" label="희망 난이도">
          <input className={inputStyles} id="desiredLevel" max={5} min={1} type="number" {...register("desiredLevel", { valueAsNumber: true })} />
        </FormField>
        <FormField error={errors.expectedSessions?.message} htmlFor="expectedSessions" label="예상 멘토링 횟수">
          <input className={inputStyles} id="expectedSessions" max={20} min={1} type="number" {...register("expectedSessions", { valueAsNumber: true })} />
        </FormField>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-900">희망 요일</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DAY_OPTIONS.map((day) => (
            <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm" key={day.value}>
              <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={day.value} {...register("preferredDays")} />
              {day.label}
            </label>
          ))}
        </div>
        {errors.preferredDays ? <p className="mt-2 text-xs font-medium text-red-700">{errors.preferredDays.message}</p> : null}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={errors.preferredStartTime?.message} htmlFor="preferredStartTime" label="희망 시작 시간">
          <input className={inputStyles} id="preferredStartTime" type="time" {...register("preferredStartTime")} />
        </FormField>
        <FormField error={errors.preferredEndTime?.message} htmlFor="preferredEndTime" label="희망 종료 시간">
          <input className={inputStyles} id="preferredEndTime" type="time" {...register("preferredEndTime")} />
        </FormField>
      </div>

      <FormField error={errors.visibility?.message} htmlFor="visibility" label="공개 범위">
        <select className={inputStyles} id="visibility" {...register("visibility")}>
          <option value="school">교내 공개</option>
          <option value="mentor_only">멘토에게만 공개</option>
        </select>
      </FormField>

      {serverMessage ? (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {serverMessage}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        <FilePlus2 aria-hidden="true" className="h-4 w-4" />
        {isPending ? "작성 중" : "도움 요청 작성"}
      </Button>
    </form>
  );
}
