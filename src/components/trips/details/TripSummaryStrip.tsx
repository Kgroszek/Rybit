import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function TripSummaryStrip({
  checklist,
  gear,
  participants,
  catches,
  costs,
}: {
  checklist: string;
  gear: string;
  participants: number;
  catches: number;
  costs: string;
}) {
  const items = [
    {
      label: "Checklista",
      value: checklist,
    },
    {
      label: "Sprzęt",
      value: gear,
    },
    {
      label: "Uczestnicy",
      value: String(participants),
    },
    {
      label: "Połowy",
      value: String(catches),
    },
    {
      label: "Koszty",
      value: costs,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "min-w-0 px-5 py-4 sm:px-6",
              index > 0 && "border-l border-border",
              index >= 2 &&
                "border-t border-border sm:border-t-0",
              index === 3 &&
                "sm:border-t sm:border-l-0 xl:border-l xl:border-t-0",
              index === 4 &&
                "col-span-2 border-t border-border sm:col-span-1 xl:border-t-0"
            )}
          >
            <p className="text-[11px] font-bold text-text-muted">
              {item.label}
            </p>

            <p className="mt-1.5 truncate font-display text-lg font-extrabold text-text">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
