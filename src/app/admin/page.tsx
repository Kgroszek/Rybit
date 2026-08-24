import {
  redirect,
} from "next/navigation";

import {
  AdminQueueCard,
} from "@/components/admin/overview/AdminQueueCard";
import {
  AdminOverviewSummary,
} from "@/components/admin/overview/AdminOverviewSummary";
import {
  AdminRecentActivity,
} from "@/components/admin/overview/AdminRecentActivity";
import {
  AdminMetricCard,
} from "@/components/admin/shared/AdminMetricCard";
import {
  DashboardLayout,
} from "@/components/dashboard/DashboardLayout";
import {
  ButtonLink,
} from "@/components/ui/Button";
import {
  Card,
} from "@/components/ui/Card";
import {
  PageHeader,
} from "@/components/ui/PageHeader";
import {
  getAdminOverviewData,
} from "@/lib/admin/admin-overview-query";
import {
  requireAdmin,
} from "@/lib/auth";

export const dynamic =
  "force-dynamic";

export default async function AdminDashboardPage() {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const data =
    await getAdminOverviewData();

  return (
    <DashboardLayout>
      <div className="space-y-9 pb-8 lg:space-y-11">
        <PageHeader
          eyebrow="Panel administratora"
          title="Centrum zarządzania"
          description="Najważniejsze sprawy wymagające decyzji oraz szybki podgląd stanu platformy Rybio."
          actions={
            <ButtonLink
              href="/dashboard"
              variant="outline"
            >
              ← Wróć do aplikacji
            </ButtonLink>
          }
        />

        <AdminOverviewSummary
          pendingTotal={
            data.pendingTotal
          }
        />

        <section>
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Kolejka pracy
            </p>

            <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-text">
              Do obsłużenia
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Cztery obszary, które
              mogą wymagać decyzji
              administratora.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.queues.map(
              (item) => (
                <AdminQueueCard
                  key={item.key}
                  item={item}
                />
              )
            )}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Stan Rybio
            </p>

            <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-text">
              Najważniejsze liczby
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map(
              (metric) => (
                <AdminMetricCard
                  key={
                    metric.label
                  }
                  {...metric}
                />
              )
            )}
          </div>

          <Card className="mt-4 grid gap-px overflow-hidden bg-border sm:grid-cols-3">
            {data.secondaryMetrics.map(
              (metric) => (
                <div
                  key={
                    metric.label
                  }
                  className="bg-surface px-5 py-4"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
                    {
                      metric.label
                    }
                  </p>

                  <p className="mt-1.5 font-display text-xl font-extrabold tracking-[-0.03em] text-text">
                    {
                      metric.value
                    }
                  </p>
                </div>
              )
            )}
          </Card>
        </section>

        <AdminRecentActivity
          items={data.activity}
        />
      </div>
    </DashboardLayout>
  );
}
