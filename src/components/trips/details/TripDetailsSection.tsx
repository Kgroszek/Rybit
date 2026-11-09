import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function TripDetailsSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>

            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {action}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent
        className={cn("pt-5", contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}
