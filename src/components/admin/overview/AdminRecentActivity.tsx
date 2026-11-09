import Link from "next/link";

import {
  ArrowSmallRightIcon,
} from "@/components/icons/ArrowSmallRightIcon";
import {
  AdminStatusBadge,
} from "@/components/admin/shared/AdminStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type {
  AdminActivityItem,
} from "@/lib/admin/admin-types";
import {
  formatAdminDate,
} from "@/lib/admin/admin-formatters";

const KIND_LABELS: Record<
  AdminActivityItem["kind"],
  string
> = {
  lake: "Łowisko",
  "lake-submission":
    "Zgłoszenie łowiska",
  correction: "Poprawka",
  "catch-report":
    "Zgłoszenie połowu",
  "owner-claim":
    "Właściciel",
};

export function AdminRecentActivity({
  items,
}: {
  items: AdminActivityItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Ostatnia aktywność
        </CardTitle>

        <CardDescription>
          Najnowsze zdarzenia z
          głównych obszarów
          administracyjnych.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-3">
        {items.length > 0 ? (
          <div className="divide-y divide-border">
            {items.map(
              (item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex min-w-0 items-center gap-3 py-4 first:pt-1 last:pb-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
                        {
                          KIND_LABELS[
                            item.kind
                          ]
                        }
                      </span>

                      {item.status && (
                        <AdminStatusBadge
                          status={
                            item.status
                          }
                        />
                      )}
                    </div>

                    <p className="mt-1.5 truncate text-sm font-extrabold text-text">
                      {
                        item.title
                      }
                    </p>

                    <p className="mt-1 line-clamp-1 text-xs text-text-muted">
                      {
                        item.description
                      }
                      {" · "}
                      {formatAdminDate(
                        item.createdAt
                      )}
                    </p>
                  </div>

                  <ArrowSmallRightIcon className="h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-primary-700" />
                </Link>
              )
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-text-muted">
            Brak ostatniej
            aktywności.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
