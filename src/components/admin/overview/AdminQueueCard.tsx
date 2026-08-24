import {
  ArrowSmallRightIcon,
} from "@/components/icons/ArrowSmallRightIcon";
import {
  Card,
} from "@/components/ui/Card";
import {
  ButtonLink,
} from "@/components/ui/Button";
import type {
  AdminOverviewQueue,
} from "@/lib/admin/admin-types";
import { cn } from "@/lib/cn";

export function AdminQueueCard({
  item,
}: {
  item: AdminOverviewQueue;
}) {
  const needsAttention =
    item.count > 0;

  return (
    <Card
      className={cn(
        "flex min-h-[210px] flex-col p-5 sm:p-6",
        needsAttention &&
          "border-warning-border"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">
            Do obsłużenia
          </p>

          <h3 className="mt-2 font-display text-lg font-extrabold tracking-[-0.025em] text-text">
            {item.title}
          </h3>
        </div>

        <span
          className={cn(
            "flex min-h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-black",
            needsAttention
              ? "bg-warning-subtle text-warning-foreground"
              : "bg-success-subtle text-success-foreground"
          )}
        >
          {item.count}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {item.description}
      </p>

      <div className="mt-auto pt-5">
        <ButtonLink
          href={item.href}
          variant={
            needsAttention
              ? "primary"
              : "outline"
          }
          size="sm"
        >
          Przejdź
          <ArrowSmallRightIcon className="h-4 w-4" />
        </ButtonLink>
      </div>
    </Card>
  );
}
