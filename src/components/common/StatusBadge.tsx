import { CheckCircle2, Clock3, EyeOff, XCircle } from "lucide-react";

import { STATUS_TONE } from "@/lib/constants/options";
import { cn, formatStatusLabel } from "@/lib/utils";
import type { ApplicationStatus, MentorshipStatus, RequestStatus, SessionStatus } from "@/types/domain";

interface StatusBadgeProps {
  status: RequestStatus | ApplicationStatus | MentorshipStatus | SessionStatus;
}

const toneStyles = {
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  yellow: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800",
  gray: "border-zinc-200 bg-zinc-100 text-zinc-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = STATUS_TONE[status] ?? "gray";
  const Icon = status === "accepted" || status === "completed" || status === "matched" ? CheckCircle2 : status === "rejected" || status === "cancelled" ? XCircle : status === "hidden" ? EyeOff : Clock3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneStyles[tone],
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {formatStatusLabel(status)}
    </span>
  );
}
