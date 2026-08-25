"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { markNotificationRead } from "@/app/actions/notifications";
import { Button } from "@/components/common/Button";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { Notification } from "@/types/domain";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markRead() {
    startTransition(async () => {
      const result = await markNotificationRead(notification.id);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <article className={cn("rounded-lg border p-5", notification.isRead ? "border-zinc-200 bg-white" : "border-emerald-200 bg-emerald-50")}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700">
          <Bell aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-zinc-950">{notification.title}</h2>
            <p className="text-xs text-zinc-500">{formatRelativeDate(notification.createdAt)}</p>
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-700">{notification.message}</p>
          {message ? (
            <p className="mt-2 text-xs font-medium text-emerald-800" role="status">
              {message}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {notification.link ? (
              <Link className="text-sm font-semibold text-emerald-800 hover:text-emerald-950" href={notification.link}>
                관련 페이지 열기
              </Link>
            ) : null}
            {!notification.isRead ? (
              <Button disabled={isPending} onClick={markRead} variant="secondary">
                <CheckCheck aria-hidden="true" className="h-4 w-4" />
                읽음 처리
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
