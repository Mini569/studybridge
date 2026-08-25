import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonStyles =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline-emerald-700",
  secondary: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 focus-visible:outline-emerald-700",
  danger: "bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700",
  ghost: "text-zinc-700 hover:bg-zinc-100 focus-visible:outline-emerald-700",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof variants;
}

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return <button className={cn(buttonStyles, variants[variant], className)} type={type} {...props} />;
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: keyof typeof variants;
  children: ReactNode;
}

export function LinkButton({ className, variant = "primary", children, ...props }: LinkButtonProps) {
  return (
    <Link className={cn(buttonStyles, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
