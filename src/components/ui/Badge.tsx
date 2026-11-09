import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant =
  | "neutral"
  | "primary"
  | "aqua"
  | "success"
  | "warning"
  | "danger"
  | "dark";

type BadgeSize = "sm" | "md";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClassNames: Record<BadgeVariant, string> = {
  neutral:
    "border-border bg-surface-muted text-text-secondary",
  primary:
    "border-primary-200 bg-primary-100 text-primary-700",
  aqua:
    "border-aqua-200 bg-aqua-50 text-aqua-700",
  success:
    "border-success-border bg-success-subtle text-success-foreground",
  warning:
    "border-warning-border bg-warning-subtle text-warning-foreground",
  danger:
    "border-danger-border bg-danger-subtle text-danger-foreground",
  dark:
    "border-navy-800 bg-navy-950 text-white",
};

const sizeClassNames: Record<BadgeSize, string> = {
  sm: "min-h-6 px-2.5 py-1 text-[11px]",
  md: "min-h-7 px-3 py-1.5 text-xs",
};

export function Badge({
  variant = "neutral",
  size = "sm",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center justify-center gap-1.5 rounded-full border font-bold leading-none",
        variantClassNames[variant],
        sizeClassNames[size],
        className
      )}
      {...props}
    />
  );
}