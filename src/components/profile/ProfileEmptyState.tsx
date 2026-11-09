import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function ProfileEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-border-strong bg-surface-muted px-5 py-8 text-center",
        className
      )}
    >
      <p className="font-display text-base font-extrabold tracking-[-0.02em] text-text">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
        {description}
      </p>

      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
