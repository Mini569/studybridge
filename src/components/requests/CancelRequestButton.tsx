"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { XCircle } from "lucide-react";

import { cancelLearningRequest } from "@/app/actions/requests";
import { Button } from "@/components/common/Button";

interface CancelRequestButtonProps {
  requestId: string;
}

export function CancelRequestButton({ requestId }: CancelRequestButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    startTransition(async () => {
      const result = await cancelLearningRequest(requestId);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <div>
      <Button disabled={isPending} onClick={cancel} variant="danger">
        <XCircle aria-hidden="true" className="h-4 w-4" />
        {isPending ? "취소 중" : "요청 취소"}
      </Button>
      {message ? (
        <p className="mt-2 text-sm font-medium text-red-800" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
