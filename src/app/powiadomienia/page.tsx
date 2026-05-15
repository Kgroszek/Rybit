import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { NotificationsActions } from "@/components/dashboard/NotificationsActions";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await prisma.userNotification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Powiadomienia
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Tutaj znajdziesz informacje dotyczące Twoich zgłoszeń, poprawek i
            aktywności w aplikacji.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          Nieprzeczytane: {unreadCount}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-3xl border p-5 shadow-sm ${
                notification.isRead
                  ? "border-slate-200 bg-white"
                  : "border-blue-100 bg-blue-50"
              }`}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        notification.isRead
                          ? "bg-slate-100 text-slate-500"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {notification.isRead ? "Przeczytane" : "Nowe"}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-950">
                    {notification.title}
                  </h2>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>

                  <p className="mt-4 text-xs font-semibold text-slate-400">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
                  {notification.href && (
                    <Link
                      href={notification.href}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Zobacz szczegóły
                    </Link>
                  )}

                  <NotificationsActions
                    notificationId={notification.id}
                    isRead={notification.isRead}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak powiadomień
          </p>

          <p className="mt-2 text-slate-500">
            Gdy pojawią się nowe informacje, zobaczysz je tutaj.
          </p>
        </section>
      )}
    </DashboardLayout>
  );
}

function getNotificationTypeLabel(type: string) {
  if (type === "lake_submission_rejected") return "Zgłoszenie łowiska";
  if (type === "lake_submission_approved") return "Zgłoszenie łowiska";
  if (type === "correction_report") return "Poprawka łowiska";
  return "Powiadomienie";
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}