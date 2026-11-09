import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type LakeSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function LakeSection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: LakeSectionProps) {
  return (
    <Card
      id={id}
      className={cn("scroll-mt-24 overflow-hidden", className)}
    >
      <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-xl font-bold tracking-[-0.025em] text-text sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </Card>
  );
}
