"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { completeMentoringSession } from "@/app/actions/mentorships";
import { Button } from "@/components/common/Button";
import { textareaStyles } from "@/components/forms/FormField";

export function CompleteSessionForm({ sessionId, mentorshipId }: { sessionId: string; mentorshipId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 rounded-lg border border-emerald-200 bg-white p-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await completeMentoringSession({ sessionId, mentorshipId, note });
          setMessage(result.message);
          if (result.ok) {
            setNote("");
            router.refresh();
          }
        });
      }}
    >
      <label className="text-sm font-semibold text-zinc-900" htmlFor={`session-note-${sessionId}`}>
        활동 기록
      </label>
      <textarea
        className={`${textareaStyles} mt-2`}
        id={`session-note-${sessionId}`}
        onChange={(event) => setNote(event.target.value)}
        placeholder="이번 세션에서 다룬 내용과 다음에 이어서 할 내용을 10자 이상 적어 주세요."
        value={note}
      />
      {message ? <p className="mt-2 text-sm text-zinc-700" role="status">{message}</p> : null}
      <Button className="mt-3" disabled={isPending} type="submit">
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        {isPending ? "저장 중" : "세션 완료"}
      </Button>
    </form>
  );
}
