import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

export function ProfileFormSection({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card
      id={id}
      className="scroll-mt-6 overflow-hidden"
    >
      <div className="border-b border-border px-5 py-5 sm:px-6">
        <div className="flex items-start">
          <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl bg-primary-100 px-2 text-[11px] font-black text-primary-700">
            {number}
          </span>

          <div className="ml-4 min-w-0 pt-0.5">
            <h2 className="font-display text-lg font-extrabold tracking-[-0.025em] text-text sm:text-xl">
              {title}
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-secondary">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6 sm:py-7">
        {children}
      </div>
    </Card>
  );
}
