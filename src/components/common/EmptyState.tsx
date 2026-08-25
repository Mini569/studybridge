import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
