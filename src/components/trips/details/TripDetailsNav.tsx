import Link from "next/link";

import type {
  TripDetailsMainTab,
  TripPreparationTab,
} from "@/lib/trips/details-utils";
import { cn } from "@/lib/cn";

const tabs: Array<{
  value: TripDetailsMainTab;
  label: string;
}> = [
  { value: "przeglad", label: "Przegląd" },
  {
    value: "przygotowanie",
    label: "Przygotowanie",
  },
  { value: "notatki", label: "Notatki" },
  { value: "koszty", label: "Koszty" },
  { value: "zdjecia", label: "Zdjęcia" },
  { value: "polowy", label: "Połowy" },
  {
    value: "uczestnicy",
    label: "Uczestnicy",
  },
];

export function TripDetailsNav({
  tripId,
  activeTab,
  preparationTab,
  pendingMembers,
}: {
  tripId: string;
  activeTab: TripDetailsMainTab;
  preparationTab: TripPreparationTab;
  pendingMembers: number;
}) {
  return (
    <nav className="sticky top-20 z-30 overflow-x-auto rounded-card border border-border bg-surface/95 p-1.5 shadow-card backdrop-blur">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active =
            tab.value === activeTab;

          const href =
            tab.value === "przygotowanie"
              ? `/wyprawy/${tripId}?tab=przygotowanie&prep=${preparationTab}`
              : `/wyprawy/${tripId}?tab=${tab.value}`;

          return (
            <Link
              key={tab.value}
              href={href}
              className={cn(
                "flex min-h-10 items-center whitespace-nowrap rounded-xl px-4 text-sm font-bold transition-[background-color,color,box-shadow]",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text"
              )}
            >
              {tab.label}

              {tab.value === "uczestnicy" &&
                pendingMembers > 0 && (
                  <span
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-[10px] font-black",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-warning-subtle text-warning-foreground"
                    )}
                  >
                    {pendingMembers}
                  </span>
                )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
