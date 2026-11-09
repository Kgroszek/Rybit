import type {
  ReactNode,
} from "react";

import {
  Card,
} from "@/components/ui/Card";

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="px-5 py-10 text-center sm:px-8">
      <p className="font-display text-xl font-extrabold tracking-[-0.025em] text-text">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
        {description}
      </p>

      {action && (
        <div className="mt-5 flex justify-center">
          {action}
        </div>
      )}
    </Card>
  );
}
