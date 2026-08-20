import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 pr-9 text-sm text-text shadow-sm outline-none transition-[border-color,box-shadow,background-color] hover:border-primary-200 focus:border-primary focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted aria-invalid:border-danger aria-invalid:ring-danger-subtle",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
