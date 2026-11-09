import {
  redirect,
} from "next/navigation";

import {
  AdminEmptyState,
} from "@/components/admin/shared/AdminEmptyState";
import {
  AdminFilterToolbar,
} from "@/components/admin/shared/AdminFilterToolbar";
import {
  AdminMetricCard,
} from "@/components/admin/shared/AdminMetricCard";
import {
  AdminPagination,
} from "@/components/admin/shared/AdminPagination";
import {
  DashboardLayout,
} from "@/components/dashboard/DashboardLayout";
import {
  ButtonLink,
} from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  PageHeader,
} from "@/components/ui/PageHeader";
import {
  clampAdminPage,
  formatAdminDate,
  getAdminPagination,
} from "@/lib/admin/admin-formatters";
import {
  getAdminUserDisplayName,
  getAllAdminUsers,
} from "@/lib/admin/admin-users";
import {
  requireAdmin,
} from "@/lib/auth";

export const dynamic =
  "force-dynamic";

const PER_PAGE = 50;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    emailStatus?: string;
    page?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: PageProps) {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const params =
    await searchParams;

  const query =
    params.q?.trim() ?? "";

  const emailStatus =
    params.emailStatus ===
      "confirmed" ||
    params.emailStatus ===
      "unconfirmed"
      ? params.emailStatus
      : "";

  const requestedPage =
    clampAdminPage(params.page);

  let users: Awaited<
    ReturnType<
      typeof getAllAdminUsers
    >
  > = [];

  let loadError = "";

  try {
    users =
      await getAllAdminUsers();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Nie udało się pobrać użytkowników.";
  }

  const confirmedCount =
    users.filter(
      (user) =>
        Boolean(
          user.email_confirmed_at
        )
    ).length;

  const unconfirmedCount =
    users.length -
    confirmedCount;

  const normalizedQuery =
    query.toLocaleLowerCase(
      "pl-PL"
    );

  const filteredUsers =
    users
      .filter((user) => {
        if (
          emailStatus ===
            "confirmed" &&
          !user.email_confirmed_at
        ) {
          return false;
        }

        if (
          emailStatus ===
            "unconfirmed" &&
          user.email_confirmed_at
        ) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const searchable = [
          user.id,
          user.email ?? "",
          getAdminUserDisplayName(
            user
          ),
        ]
          .join(" ")
          .toLocaleLowerCase(
            "pl-PL"
          );

        return searchable.includes(
          normalizedQuery
        );
      })
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      );

  const pagination =
    getAdminPagination(
      filteredUsers.length,
      requestedPage,
      PER_PAGE
    );

  const pageUsers =
    filteredUsers.slice(
      pagination.skip,
      pagination.skip +
        PER_PAGE
    );

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="System"
          title="Użytkownicy"
          description="Przeglądaj konta z Supabase Auth, status potwierdzenia e-maila oraz ostatnie logowania."
          actions={
            <ButtonLink
              href="/admin"
              variant="outline"
            >
              Panel admina
            </ButtonLink>
          }
        />

        {loadError && (
          <div
            role="alert"
            className="rounded-card border border-danger-border bg-danger-subtle px-4 py-3 text-sm font-semibold text-danger-foreground"
          >
            Nie udało się pobrać użytkowników:{" "}
            {loadError}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <AdminMetricCard
            label="Wszyscy użytkownicy"
            value={users.length}
          />

          <AdminMetricCard
            label="Potwierdzone e-maile"
            value={
              confirmedCount
            }
          />

          <AdminMetricCard
            label="Niepotwierdzone e-maile"
            value={
              unconfirmedCount
            }
            emphasis={
              unconfirmedCount >
              0
            }
          />
        </section>

        <AdminFilterToolbar
          action="/admin/uzytkownicy"
          query={query}
          queryPlaceholder="Szukaj po nazwie, e-mailu lub ID..."
          selectFields={[
            {
              name:
                "emailStatus",
              label:
                "Status e-maila",
              value:
                emailStatus,
              options: [
                {
                  value: "",
                  label:
                    "Wszystkie statusy",
                },
                {
                  value:
                    "confirmed",
                  label:
                    "Potwierdzony",
                },
                {
                  value:
                    "unconfirmed",
                  label:
                    "Niepotwierdzony",
                },
              ],
            },
          ]}
          resetHref="/admin/uzytkownicy"
        />

        {pageUsers.length >
        0 ? (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-5">
                <CardTitle>
                  Lista użytkowników
                </CardTitle>

                <CardDescription>
                  {
                    filteredUsers.length
                  }{" "}
                  wyników. Na stronie
                  maksymalnie{" "}
                  {PER_PAGE}.
                </CardDescription>
              </CardHeader>

              <CardContent className="py-0">
                <div className="hidden grid-cols-[minmax(180px,1fr)_minmax(240px,1.3fr)_160px_170px_170px] gap-4 border-b border-border py-3 text-[9px] font-black uppercase tracking-[0.12em] text-text-muted xl:grid">
                  <span>
                    Użytkownik
                  </span>
                  <span>
                    E-mail
                  </span>
                  <span>
                    Status
                  </span>
                  <span>
                    Utworzono
                  </span>
                  <span>
                    Ostatnie
                    logowanie
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {pageUsers.map(
                    (user) => (
                      <article
                        key={
                          user.id
                        }
                        className="grid gap-4 py-5 xl:grid-cols-[minmax(180px,1fr)_minmax(240px,1.3fr)_160px_170px_170px] xl:items-center"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-text">
                            {getAdminUserDisplayName(
                              user
                            )}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-text-muted">
                            ID:{" "}
                            {
                              user.id
                            }
                          </p>
                        </div>

                        <p className="break-all text-sm text-text-secondary">
                          {user.email ||
                            "Brak"}
                        </p>

                        <div>
                          <span
                            className={
                              user.email_confirmed_at
                                ? "inline-flex rounded-full border border-success-border bg-success-subtle px-2.5 py-1 text-[11px] font-bold text-success-foreground"
                                : "inline-flex rounded-full border border-warning-border bg-warning-subtle px-2.5 py-1 text-[11px] font-bold text-warning-foreground"
                            }
                          >
                            {user.email_confirmed_at
                              ? "Potwierdzony"
                              : "Niepotwierdzony"}
                          </span>
                        </div>

                        <UserDate
                          label="Utworzono"
                          value={
                            user.created_at
                          }
                        />

                        <UserDate
                          label="Ostatnie logowanie"
                          value={
                            user.last_sign_in_at
                          }
                        />
                      </article>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <AdminPagination
              pathname="/admin/uzytkownicy"
              page={
                pagination.page
              }
              totalPages={
                pagination.totalPages
              }
              params={{
                q:
                  query ||
                  undefined,
                emailStatus:
                  emailStatus ||
                  undefined,
              }}
            />
          </>
        ) : (
          <AdminEmptyState
            title="Brak użytkowników"
            description={
              loadError
                ? "Nie udało się pobrać listy kont."
                : "Nie znaleziono użytkowników pasujących do aktualnych filtrów."
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function UserDate({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-text-muted xl:hidden">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-text-secondary xl:mt-0">
        {formatAdminDate(
          value
        )}
      </p>
    </div>
  );
}
