"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCheck } from "lucide-react";

import { markAllNotificationsRead } from "@/app/actions/notifications";
import { Button } from "@/components/common/Button";

export function MarkAllNotificationsButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <div>
      <Button disabled={isPending} onClick={markAll} variant="secondary">
        <CheckCheck aria-hidden="true" className="h-4 w-4" />
        모두 읽음
      </Button>
      {message ? (
        <p className="mt-2 text-sm font-medium text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
