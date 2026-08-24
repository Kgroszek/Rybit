import type {
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

export function AdminInfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-control bg-surface-muted px-4 py-3",
        className
      )}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>

      <div className="mt-1.5 break-words text-sm font-bold leading-5 text-text-secondary">
        {value}
      </div>
    </div>
  );
}
