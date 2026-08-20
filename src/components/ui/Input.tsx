import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-sm text-text shadow-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-text-muted hover:border-primary-200 focus:border-primary focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted aria-invalid:border-danger aria-invalid:ring-danger-subtle",
        className
      )}
      {...props}
    />
  );
}
