"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";

import { resolveReport, suspendMentor } from "@/app/actions/admin";
import { hideLearningRequest } from "@/app/actions/requests";
import { Button } from "@/components/common/Button";

interface AdminActionButtonProps {
  action: "suspendMentor" | "hideRequest" | "resolveReport";
  targetId: string;
  label: string;
  danger?: boolean;
}

export function AdminActionButton({ action, targetId, label, danger = false }: AdminActionButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction() {
    startTransition(async () => {
      const result =
        action === "suspendMentor"
          ? await suspendMentor(targetId)
          : action === "hideRequest"
            ? await hideLearningRequest(targetId)
            : await resolveReport(targetId);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <div>
      <Button disabled={isPending} onClick={runAction} variant={danger ? "danger" : "secondary"}>
        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
        {isPending ? "처리 중" : label}
      </Button>
      {message ? (
        <p className="mt-2 text-sm font-medium text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
