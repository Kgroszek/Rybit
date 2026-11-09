import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Stat = {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "warning" | "success";
};

export function ReservationsStats({
  activeNow,
  pendingCount,
  upcomingCount,
  spotsCount,
}: {
  activeNow: number;
  pendingCount: number;
  upcomingCount: number;
  spotsCount: number;
}) {
  const stats: Stat[] = [
    {
      label: "Aktywne teraz",
      value: String(activeNow),
      hint: "trwające rezerwacje",
      tone: activeNow > 0 ? "success" : "default",
    },
    {
      label: "Do potwierdzenia",
      value: String(pendingCount),
      hint: "wymagają działania",
      tone: pendingCount > 0 ? "warning" : "default",
    },
    {
      label: "W okresie",
      value: String(upcomingCount),
      hint: "widoczne w kalendarzu",
    },
    {
      label: "Stanowiska",
      value: String(spotsCount),
      hint: "aktywne miejsca",
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
              index % 2 === 1 && "border-l border-border",
              index >= 2 && "border-t border-border xl:border-t-0",
              index >= 1 && "xl:border-l xl:border-border"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                  {stat.label}
                </p>

                <p
                  className={cn(
                    "mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-text sm:text-3xl",
                    stat.tone === "warning" &&
                      "text-warning-foreground",
                    stat.tone === "success" &&
                      "text-success-foreground"
                  )}
                >
                  {stat.value}
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {stat.hint}
                </p>
              </div>

              <span
                className={cn(
                  "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary",
                  stat.tone === "warning" &&
                    "bg-warning",
                  stat.tone === "success" &&
                    "bg-success"
                )}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
