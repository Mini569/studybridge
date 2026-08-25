import { AlertTriangle, Loader2 } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
}

export function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="불러오는 중">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100" key={index} />
      ))}
    </div>
  );
}

export function InlineLoading({ label = "처리 중입니다" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      {label}
    </span>
  );
}

export function ErrorState({ title = "문제가 발생했습니다", message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>
      </div>
    </div>
  );
}
