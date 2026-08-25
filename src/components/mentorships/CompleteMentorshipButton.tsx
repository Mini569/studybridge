"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

import { completeMentorship } from "@/app/actions/mentorships";
import { Button } from "@/components/common/Button";

interface CompleteMentorshipButtonProps {
  mentorshipId: string;
}

export function CompleteMentorshipButton({ mentorshipId }: CompleteMentorshipButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function complete() {
    startTransition(async () => {
      const result = await completeMentorship(mentorshipId);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <div>
      <Button disabled={isPending} onClick={complete}>
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        {isPending ? "완료 처리 중" : "멘토링 완료 처리"}
      </Button>
      {message ? (
        <p className="mt-2 text-sm font-medium text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
