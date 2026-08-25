"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { createMentoringSession } from "@/app/actions/mentorships";
import { Button } from "@/components/common/Button";
import { FormField, inputStyles } from "@/components/forms/FormField";
import { LOCATION_LABELS } from "@/lib/constants/options";
import { sessionSchema } from "@/lib/validation/schemas";

type SessionFormValues = z.input<typeof sessionSchema>;
type SessionInput = z.output<typeof sessionSchema>;

interface SessionFormProps {
  mentorshipId: string;
}

export function SessionForm({ mentorshipId }: SessionFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionFormValues, unknown, SessionInput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      mentorshipId,
      scheduledAt: "",
      durationMinutes: 60,
      topic: "",
      locationType: "library",
    },
  });

  function submit(values: SessionInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await createMentoringSession(values);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit(submit)}>
      <h2 className="text-lg font-bold text-zinc-950">새 세션 등록</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" {...register("mentorshipId")} />
        <FormField error={errors.scheduledAt?.message} htmlFor="scheduledAt" label="일정">
          <input className={inputStyles} id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
        </FormField>
        <FormField error={errors.durationMinutes?.message} htmlFor="durationMinutes" label="진행 시간">
          <input className={inputStyles} id="durationMinutes" max={240} min={10} type="number" {...register("durationMinutes", { valueAsNumber: true })} />
        </FormField>
        <FormField error={errors.topic?.message} htmlFor="topic" label="학습 주제">
          <input className={inputStyles} id="topic" {...register("topic")} />
        </FormField>
        <FormField error={errors.locationType?.message} htmlFor="locationType" label="장소">
          <select className={inputStyles} id="locationType" {...register("locationType")}>
            {Object.entries(LOCATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      {message ? (
        <p className="mt-3 rounded-lg bg-zinc-100 p-3 text-sm font-medium text-zinc-800" role="status">
          {message}
        </p>
      ) : null}
      <Button className="mt-4" disabled={isPending} type="submit">
        <CalendarPlus aria-hidden="true" className="h-4 w-4" />
        {isPending ? "등록 중" : "세션 등록"}
      </Button>
    </form>
  );
}
