import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function GearStats({
  positions,
  totalQuantity,
  tripPositions,
  tripQuantity,
  totalValue,
  attention,
}: {
  positions: number;
  totalQuantity: number;
  tripPositions: number;
  tripQuantity: number;
  totalValue: string;
  attention: number;
}) {
  const stats = [
    {
      label: "Pozycje",
      value: positions,
      hint: `${totalQuantity} szt. łącznie`,
    },
    {
      label: "Na wyprawę",
      value: tripPositions,
      hint: `${tripQuantity} szt. oznaczonych`,
      tone: "aqua" as const,
    },
    {
      label: "Wartość",
      value: totalValue,
      hint: "na podstawie podanych cen",
      tone: "primary" as const,
    },
    {
      label: "Do uwagi",
      value: attention,
      hint:
        attention > 0
          ? "sprawdź przed wyprawą"
          : "sprzęt bez alertów",
      tone:
        attention > 0
          ? ("warning" as const)
          : ("success" as const),
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-2 xl:grid-cols-4">
        {stats.map(
          (stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "min-w-0 px-5 py-5 sm:px-6",
                index % 2 === 1 &&
                  "border-l border-border",
                index >= 2 &&
                  "border-t border-border xl:border-t-0",
                index >= 1 &&
                  "xl:border-l xl:border-border"
              )}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                {stat.label}
              </p>

              <p
                className={cn(
                  "mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl",
                  stat.tone ===
                    "aqua" &&
                    "text-aqua-700",
                  stat.tone ===
                    "primary" &&
                    "text-primary-700",
                  stat.tone ===
                    "warning" &&
                    "text-warning-foreground",
                  stat.tone ===
                    "success" &&
                    "text-success-foreground"
                )}
              >
                {stat.value}
              </p>

              <p className="mt-1 text-xs leading-5 text-text-muted">
                {stat.hint}
              </p>
            </div>
          )
        )}
      </div>
    </Card>
  );
}
