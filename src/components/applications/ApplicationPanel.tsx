"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { createApplication } from "@/app/actions/applications";
import { Button } from "@/components/common/Button";
import { FormField, textareaStyles } from "@/components/forms/FormField";
import { hasCapacity } from "@/lib/matching/calculate-mentor-score";
import { applicationSchema } from "@/lib/validation/schemas";
import type { MentorProfile } from "@/types/domain";

type ApplicationInput = z.infer<typeof applicationSchema>;

interface ApplicationPanelProps {
  learningRequestId: string;
  mentor: MentorProfile;
  currentUserId: string;
}

export function ApplicationPanel({ learningRequestId, mentor, currentUserId }: ApplicationPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isSelf = mentor.profile.id === currentUserId;
  const canApply = !isSelf && hasCapacity(mentor);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      learningRequestId,
      mentorId: mentor.profile.id,
      message: "",
    },
  });

  function submit(values: ApplicationInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await createApplication(values);
      setMessage(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  }

  if (isSelf) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
        자기 자신에게는 멘토링을 신청할 수 없습니다.
      </div>
    );
  }

  if (!canApply) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
        현재 이 멘토는 최대 멘티 수에 도달했거나 신청을 받지 않습니다.
      </div>
    );
  }

  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit(submit)}>
      <h2 className="text-lg font-bold text-zinc-950">멘토링 신청</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">학습 목표와 원하는 도움 방식을 간단히 적어 주세요. 개인 연락처는 적지 마세요.</p>
      <input type="hidden" {...register("learningRequestId")} />
      <input type="hidden" {...register("mentorId")} />
      <div className="mt-4">
        <FormField error={errors.message?.message} htmlFor="applicationMessage" label="신청 메시지">
          <textarea className={textareaStyles} id="applicationMessage" {...register("message")} />
        </FormField>
      </div>
      {message ? (
        <p className="mt-3 rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {message}
        </p>
      ) : null}
      <Button className="mt-4 w-full" disabled={isPending} type="submit">
        <Send aria-hidden="true" className="h-4 w-4" />
        {isPending ? "신청 중" : "멘토링 신청"}
      </Button>
    </form>
  );
}
