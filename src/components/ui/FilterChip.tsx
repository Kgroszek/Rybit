import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type FilterChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed"
> & {
  active?: boolean;
};

export function FilterChip({
  active = false,
  className,
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border px-3.5 py-2 text-sm font-semibold transition-[background-color,border-color,color] duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        active
          ? "border-primary bg-primary text-white"
          : "border-transparent bg-surface-muted text-text-secondary hover:border-border-strong hover:bg-surface-hover hover:text-text",
        className
      )}
      {...props}
    />
  );
}
