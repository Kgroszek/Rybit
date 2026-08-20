import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  className,
  rows = 5,
  ...props
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "min-h-28 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-sm leading-6 text-text shadow-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-text-muted hover:border-primary-200 focus:border-primary focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted aria-invalid:border-danger aria-invalid:ring-danger-subtle",
        className
      )}
      {...props}
    />
  );
}
