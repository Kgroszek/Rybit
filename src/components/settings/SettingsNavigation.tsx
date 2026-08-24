"use client";

import type {
  SettingsSection,
} from "@/lib/account/account-types";
import { cn } from "@/lib/cn";

const SETTINGS_NAV_ITEMS: Array<{
  value: SettingsSection;
  label: string;
  description: string;
  index: string;
}> = [
  {
    value: "account",
    label: "Konto",
    description:
      "Nazwa, e-mail i profil publiczny",
    index: "01",
  },
  {
    value: "security",
    label: "Bezpieczeństwo",
    description:
      "Hasło i ochrona konta",
    index: "02",
  },
];

export function SettingsNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: SettingsSection;
  onSectionChange: (
    section: SettingsSection
  ) => void;
}) {
  return (
    <>
      <nav
        aria-label="Sekcje ustawień"
        className="hidden rounded-panel border border-border bg-surface p-2 shadow-card lg:block"
      >
        <div className="px-3 pb-3 pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
            Ustawienia
          </p>

          <p className="mt-1.5 text-xs leading-5 text-text-muted">
            Wybierz obszar, którym chcesz zarządzać.
          </p>
        </div>

        <div className="space-y-1">
          {SETTINGS_NAV_ITEMS.map(
            (item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={
                  activeSection ===
                  item.value
                }
                onClick={() =>
                  onSectionChange(
                    item.value
                  )
                }
                className={cn(
                  "grid w-full grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-control px-3 py-3 text-left transition",
                  activeSection ===
                    item.value
                    ? "bg-primary-50 text-primary-800"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-black tabular-nums",
                    activeSection ===
                      item.value
                      ? "bg-surface text-primary-700 shadow-sm"
                      : "bg-surface-muted text-text-muted"
                  )}
                >
                  {item.index}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-extrabold">
                    {item.label}
                  </span>

                  <span className="mt-1 block text-[11px] leading-4 text-text-muted">
                    {
                      item.description
                    }
                  </span>
                </span>
              </button>
            )
          )}
        </div>
      </nav>

      <div className="overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="grid min-w-[360px] grid-cols-2 gap-1 rounded-control bg-surface-muted p-1"
          role="group"
          aria-label="Sekcje ustawień"
        >
          {SETTINGS_NAV_ITEMS.map(
            (item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={
                  activeSection ===
                  item.value
                }
                onClick={() =>
                  onSectionChange(
                    item.value
                  )
                }
                className={cn(
                  "min-h-11 rounded-xl px-3 py-2 text-xs font-bold transition",
                  activeSection ===
                    item.value
                    ? "bg-surface text-primary-700 shadow-sm"
                    : "text-text-muted hover:text-text"
                )}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}
