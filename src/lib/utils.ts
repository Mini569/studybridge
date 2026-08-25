import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  APPLICATION_STATUS_LABELS,
  DAY_LABELS,
  MENTORSHIP_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  SESSION_STATUS_LABELS,
} from "@/lib/constants/options";
import type { ApplicationStatus, DayOfWeek, MentorshipStatus, RequestStatus, SessionStatus } from "@/types/domain";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(value: string) {
  return `${formatDistanceToNowStrict(new Date(value), { addSuffix: true, locale: ko })}`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDayList(days: DayOfWeek[]) {
  if (days.length === 0) {
    return "요일 협의";
  }

  return days.map((day) => DAY_LABELS[day]).join(", ");
}

export function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) {
    return "시간 협의";
  }

  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

export function formatStatusLabel(status: RequestStatus | ApplicationStatus | MentorshipStatus | SessionStatus) {
  return (
    REQUEST_STATUS_LABELS[status as RequestStatus] ??
    APPLICATION_STATUS_LABELS[status as ApplicationStatus] ??
    MENTORSHIP_STATUS_LABELS[status as MentorshipStatus] ??
    SESSION_STATUS_LABELS[status as SessionStatus] ??
    status
  );
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function uniqueValues<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function normalizeKeyword(value: string) {
  return value.toLocaleLowerCase("ko-KR").replace(/\s+/g, "");
}

export function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}
