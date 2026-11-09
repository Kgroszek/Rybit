import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function SpotsStats({
  total,
  active,
  occupied,
  free,
}: {
  total: number;
  active: number;
  occupied: number;
  free: number;
}) {
  const stats = [
    {
      label: "Wszystkie",
      value: total,
      hint: "łącznie stanowisk",
    },
    {
      label: "Aktywne",
      value: active,
      hint: "dostępne w rezerwacjach",
      tone: "success" as const,
    },
    {
      label: "Zajęte teraz",
      value: occupied,
      hint: "trwające rezerwacje",
      tone:
        occupied > 0
          ? ("primary" as const)
          : ("default" as const),
    },
    {
      label: "Wolne teraz",
      value: free,
      hint: "aktywne i niezajęte",
      tone: "aqua" as const,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
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
                stat.tone === "success" &&
                  "text-success-foreground",
                stat.tone === "primary" &&
                  "text-primary-700",
                stat.tone === "aqua" &&
                  "text-aqua-700"
              )}
            >
              {stat.value}
            </p>

            <p className="mt-1 text-xs leading-5 text-text-muted">
              {stat.hint}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
