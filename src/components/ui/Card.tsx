import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type CardVariant =
  | "default"
  | "subtle"
  | "elevated"
  | "interactive"
  | "dark";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClassNames: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-card",
  subtle: "border border-border bg-surface-muted shadow-none",
  elevated: "border border-border bg-surface shadow-card-hover",
  interactive:
    "border border-border bg-surface shadow-card transition-[border-color,box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/30 hover:shadow-card-hover",
  dark:
    "relative overflow-hidden border border-white/10 bg-[linear-gradient(145deg,var(--rybio-navy-950)_0%,var(--rybio-navy-900)_58%,var(--rybio-navy-800)_100%)] text-white shadow-[0_18px_48px_-26px_rgba(13,30,51,0.72)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(121,216,213,0.55),transparent)] [&_[data-slot='card-title']]:text-white [&_[data-slot='card-description']]:text-text-on-dark-muted [&_[data-slot='card-content']]:text-text-on-dark-muted [&_[data-slot='card-footer']]:border-white/10",
};

export function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <div
      data-card-variant={variant}
      className={cn("rounded-card", variantClassNames[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn("px-5 pt-5 sm:px-6 sm:pt-6", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "font-display text-lg font-bold leading-tight tracking-[-0.025em] text-text",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("mt-2 text-[15px] leading-6 text-text-secondary", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 py-5 text-text-secondary sm:px-6 sm:py-6", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 border-t border-border px-5 py-4 sm:px-6",
        className
      )}
      {...props}
    />
  );
}
