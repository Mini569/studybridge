"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { submitFeedback } from "@/app/actions/mentorships";
import { Button } from "@/components/common/Button";
import { FormField, inputStyles, textareaStyles } from "@/components/forms/FormField";
import { FEEDBACK_RUBRIC, IMPROVEMENT_TAGS, RETRY_PREFERENCE_OPTIONS } from "@/lib/constants/feedback";
import { feedbackSchema } from "@/lib/validation/schemas";

type FeedbackFormValues = z.input<typeof feedbackSchema>;
type FeedbackInput = z.output<typeof feedbackSchema>;

interface FeedbackFormProps {
  sessionId: string;
  targetUserId: string;
}

export function FeedbackForm({ sessionId, targetUserId }: FeedbackFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedbackFormValues, unknown, FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      sessionId,
      targetUserId,
      rating: 5,
      clarityRating: 5,
      punctualityRating: 5,
      goalProgressRating: 5,
      retryPreference: "yes",
      improvementTags: [],
      improvementNote: "",
      followUpNeeded: false,
      comment: "",
    },
  });

  function submit(values: FeedbackInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await submitFeedback(values);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit(submit)}>
      <h2 className="text-lg font-bold text-zinc-950">피드백 작성</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        단순 만족도보다 다음 세션을 더 좋게 만들 수 있는 구체적인 기준으로 남겨 주세요.
      </p>
      <input type="hidden" {...register("sessionId")} />
      <input type="hidden" {...register("targetUserId")} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {FEEDBACK_RUBRIC.map((item) => (
          <FormField error={errors[item.name]?.message} hint={item.description} htmlFor={item.name} key={item.name} label={item.label}>
            <input className={inputStyles} id={item.name} max={5} min={1} type="number" {...register(item.name, { valueAsNumber: true })} />
          </FormField>
        ))}
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-zinc-900">다시 신청 의향</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {RETRY_PREFERENCE_OPTIONS.map((option) => (
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm" key={option.value}>
              <input className="h-4 w-4 accent-emerald-700" type="radio" value={option.value} {...register("retryPreference")} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-zinc-900">개선이 필요한 부분</legend>
        <p className="mt-1 text-xs leading-5 text-zinc-500">반복해서 선택되는 태그는 관리자 인사이트에서 우선 개선 대상으로 표시됩니다.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {IMPROVEMENT_TAGS.map((tag) => (
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm" key={tag}>
              <input className="h-4 w-4 accent-emerald-700" type="checkbox" value={tag} {...register("improvementTags")} />
              {tag}
            </label>
          ))}
        </div>
        {errors.improvementTags ? <p className="mt-2 text-xs font-medium text-red-700">{errors.improvementTags.message}</p> : null}
      </fieldset>

      <label className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <input className="mt-1 h-4 w-4 accent-emerald-700" type="checkbox" {...register("followUpNeeded")} />
        <span>
          후속 조치가 필요합니다
          <span className="mt-1 block text-xs leading-5">관리자가 세션 품질, 일정 조율, 안전 문제를 다시 확인해야 할 때 선택하세요.</span>
        </span>
      </label>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <FormField error={errors.improvementNote?.message} htmlFor="improvementNote" label="개선 메모">
          <textarea className={textareaStyles} id="improvementNote" placeholder="다음 세션에서 바뀌면 좋을 점을 구체적으로 적어 주세요." {...register("improvementNote")} />
        </FormField>
        <FormField error={errors.comment?.message} htmlFor="comment" label="좋았던 점">
          <textarea className={textareaStyles} id="comment" placeholder="도움이 되었던 설명, 자료, 진행 방식을 적어 주세요." {...register("comment")} />
        </FormField>
      </div>
      {message ? (
        <p className="mt-3 rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {message}
        </p>
      ) : null}
      <Button className="mt-4" disabled={isPending} type="submit">
        <Star aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "피드백 저장"}
      </Button>
    </form>
  );
}
