"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Check, Eye, X } from "lucide-react";

import { acceptApplication, cancelApplication, rejectApplication } from "@/app/actions/applications";
import { Button, LinkButton } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatRelativeDate } from "@/lib/utils";
import type { MentoringApplication } from "@/types/domain";

interface ApplicationCardProps {
  application: MentoringApplication;
  direction: "sent" | "received";
  requestTitle?: string;
  mentorName?: string;
  menteeName?: string;
}

export function ApplicationCard({ application, direction, requestTitle = "학습 요청", mentorName = "멘토", menteeName = "멘티" }: ApplicationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function runAction(action: "accept" | "reject" | "cancel") {
    startTransition(async () => {
      const result =
        action === "accept"
          ? await acceptApplication(application.id)
          : action === "reject"
            ? await rejectApplication(application.id)
            : await cancelApplication(application.id);

      setMessage(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
      router.refresh();
    });
  }

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-950">{requestTitle}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {direction === "sent"
              ? `${mentorName}에게 보낸 신청`
              : `${menteeName}에게 받은 신청`}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">{application.message}</p>
      <p className="mt-3 text-xs text-zinc-500">신청일: {formatRelativeDate(application.createdAt)}</p>

      {message ? (
        <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-900" role="status">
          {message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col flex-wrap gap-2 sm:flex-row">
        <LinkButton href={`/requests/${application.learningRequestId}`} variant="secondary">
          <Eye aria-hidden="true" className="h-4 w-4" />
          요청 상세
        </LinkButton>
        {application.status === "pending" && direction === "received" ? (
          <>
            <Button disabled={isPending} onClick={() => runAction("accept")}>
              <Check aria-hidden="true" className="h-4 w-4" />
              승인
            </Button>
            <Button disabled={isPending} onClick={() => runAction("reject")} variant="danger">
              <X aria-hidden="true" className="h-4 w-4" />
              거절
            </Button>
          </>
        ) : null}
        {application.status === "pending" && direction === "sent" ? (
          <Button disabled={isPending} onClick={() => runAction("cancel")} variant="secondary">
            <X aria-hidden="true" className="h-4 w-4" />
            신청 취소
          </Button>
        ) : null}
      </div>
    </article>
  );
}
