import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  const descriptionId = `${htmlFor}-description`;
  const errorId = `${htmlFor}-error`;

  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-900" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? (
        <p className="mt-1.5 text-xs leading-5 text-zinc-500" id={descriptionId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-700" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputStyles =
  "block min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-100";

export const textareaStyles =
  "block min-h-28 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
