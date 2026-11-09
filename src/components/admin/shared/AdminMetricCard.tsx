import {
  Card,
} from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function AdminMetricCard({
  label,
  value,
  description,
  emphasis = false,
}: {
  label: string;
  value: number;
  description?: string;
  emphasis?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-5 sm:p-6",
        emphasis &&
          "border-primary-200 bg-primary-50/50"
      )}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">
        {label}
      </p>

      <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-text">
        {value}
      </p>

      {description && (
        <p className="mt-1.5 text-xs leading-5 text-text-muted">
          {description}
        </p>
      )}
    </Card>
  );
}
