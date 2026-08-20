import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import type { DashboardRecentCatch } from "@/components/dashboard/home/types";
import { ButtonLink } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function RecentCatches({
  catches,
}: {
  catches: DashboardRecentCatch[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Dziennik
            </p>

            <CardTitle className="mt-1 text-2xl">
              Ostatnie połowy
            </CardTitle>

            <CardDescription>
              Najnowsze wpisy z Twojego
              dziennika połowów.
            </CardDescription>
          </div>

          <ButtonLink
            href="/polowy"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Zobacz wszystkie
          </ButtonLink>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {catches.length > 0 ? (
          <>
            <div className="divide-y divide-border">
              {catches.map((item) => (
                <Link
                  key={item.id}
                  href="/polowy"
                  className="group flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-surface-muted"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary group-hover:text-white sm:h-[52px] sm:w-[52px]">
                    <FishIcon className="h-6 w-6 -scale-x-100" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-extrabold text-text transition-colors group-hover:text-primary-700">
                      {item.fishName}
                    </p>

                    <p className="mt-1 truncate text-sm text-text-secondary">
                      {formatCatchResult(item)}
                    </p>

                    <p className="mt-1 truncate text-xs font-semibold text-text-muted">
                      {item.lakeName ||
                        item.tripTitle ||
                        getMethodLabel(item.method)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="whitespace-nowrap text-xs font-semibold text-text-muted">
                      {formatShortDate(
                        item.caughtAt
                      )}
                    </p>

                    <ArrowRightIcon className="ml-auto mt-2 h-4 w-4 text-text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>

            <ButtonLink
              href="/polowy"
              variant="outline"
              fullWidth
              className="mt-5 sm:hidden"
            >
              Zobacz wszystkie połowy
            </ButtonLink>
          </>
        ) : (
          <EmptyState
            icon={
              <FishIcon className="h-6 w-6 -scale-x-100" />
            }
            title="Twój dziennik jest jeszcze pusty"
            description="Dodaj pierwszy połów, aby zacząć budować historię swoich wyników nad wodą."
            action={
              <ButtonLink href="/polowy">
                Dodaj połów
              </ButtonLink>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

function formatCatchResult(item: {
  weight: number | null;
  length: number | null;
  bait: string | null;
}) {
  const parts: string[] = [];

  if (item.length !== null) {
    parts.push(`${Math.round(item.length)} cm`);
  }

  if (item.weight !== null) {
    parts.push(
      `${Number(item.weight).toFixed(2)} kg`
    );
  }

  if (item.bait) {
    parts.push(item.bait);
  }

  return parts.length > 0
    ? parts.join(" • ")
    : "Bez dodatkowych parametrów";
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function getMethodLabel(value: string) {
  if (value === "spinning") return "Spinning";
  if (value === "feeder") return "Feeder";
  if (value === "method_feeder")
    return "Method feeder";
  if (value === "carp") return "Karpiówka";
  if (value === "float") return "Spławik";
  if (value === "fly") return "Muchówka";
  if (value === "other") return "Inna metoda";

  return value || "Bez przypisanego miejsca";
}
