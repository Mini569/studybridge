import type { ReactNode } from "react";

interface SubjectBadgeProps {
  children: ReactNode;
}

export function SubjectBadge({ children }: SubjectBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
      {children}
    </span>
  );
}
