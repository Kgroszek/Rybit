import Link from "next/link";
import type {
  ComponentPropsWithoutRef,
  HTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

type InteractiveRowProps = ComponentPropsWithoutRef<typeof Link>;

export function InteractiveRow({ className, ...props }: InteractiveRowProps) {
  return (
    <Link
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-150 hover:bg-surface-muted focus-visible:bg-surface-muted",
        className
      )}
      {...props}
    />
  );
}

export function InteractiveRowIcon({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary-100 text-primary-700 transition-colors duration-150 group-hover:bg-primary group-hover:text-white group-focus-visible:bg-primary group-focus-visible:text-white",
        className
      )}
      {...props}
    />
  );
}
