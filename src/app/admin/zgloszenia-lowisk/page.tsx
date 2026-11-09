import type { ReactNode } from "react";
import type {
  Prisma,
} from "@prisma/client";
import {
  redirect,
} from "next/navigation";

import {
  AdminLakeSubmissionActions,
} from "@/components/admin/moderation/AdminLakeSubmissionActions";
import {
  AdminEmptyState,
} from "@/components/admin/shared/AdminEmptyState";
import {
  AdminFilterToolbar,
} from "@/components/admin/shared/AdminFilterToolbar";
import {
  AdminInfoItem,
} from "@/components/admin/shared/AdminInfoItem";
import {
  AdminMetricCard,
} from "@/components/admin/shared/AdminMetricCard";
import {
  AdminPagination,
} from "@/components/admin/shared/AdminPagination";
import {
  AdminStatusBadge,
} from "@/components/admin/shared/AdminStatusBadge";
import {
  AdminStatusTabs,
} from "@/components/admin/shared/AdminStatusTabs";
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
  clampAdminPage,
  formatAdminDate,
  getAdminPagination,
} from "@/lib/admin/admin-formatters";
import {
  getAdminCatchMethodLabel,
  getAdminFishingTypeLabel,
  getAdminOwnerTypeLabel,
} from "@/lib/admin/admin-status";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  prisma,
} from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const PER_PAGE = 15;

type AdminLakeSubmissionsPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
};

const AMENITIES = [
  ["cottages", "Domki"],
  ["campfire", "Ognisko"],
  ["noKill", "No Kill"],
  ["tent", "Namiot"],
  ["parking", "Parking"],
  ["pier", "Pomost"],
  ["toilet", "Toaleta"],
  [
    "sanitaryFacilities",
    "Sanitariaty",
  ],
  ["shop", "Sklep"],
  [
    "nightFishing",
    "Wędkowanie nocne",
  ],
  [
    "boatRental",
    "Wypożyczalnia łodzi",
  ],
  [
    "camperCaravan",
    "Kamper / przyczepa",
  ],
  [
    "electricityHookup",
    "Przyłącze z prądem",
  ],
  [
    "gearRental",
    "Wypożyczalnia sprzętu",
  ],
  ["shelter", "Altana"],
  [
    "coveredSpots",
    "Zadaszone stanowiska",
  ],
  [
    "playground",
    "Plac zabaw",
  ],
  [
    "cardPayment",
    "Płatność kartą",
  ],
] as const;

export default async function LakeSubmissionsAdminPage({
  searchParams,
}: AdminLakeSubmissionsPageProps) {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const params =
    await searchParams;

  const status =
    normalizeStatus(
      params.status
    );

  const query =
    params.q?.trim() ?? "";

  const requestedPage =
    clampAdminPage(params.page);

  const baseSearch: Prisma.LakeSubmissionWhereInput =
    query
      ? {
          OR: [
            {
              name: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
            {
              city: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
            {
              voivodeship: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
            {
              fish: {
                contains:
                  query,
                mode:
                  "insensitive",
              },
            },
          ],
        }
      : {};

  const where: Prisma.LakeSubmissionWhereInput =
    {
      ...baseSearch,
      ...(status !== "all"
        ? {
            status,
          }
        : {}),
    };

  const [
    allCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    filteredCount,
  ] = await Promise.all([
    prisma.lakeSubmission.count(),
    prisma.lakeSubmission.count({
      where: {
        status: "pending",
      },
    }),
    prisma.lakeSubmission.count({
      where: {
        status:
          "approved",
      },
    }),
    prisma.lakeSubmission.count({
      where: {
        status:
          "rejected",
      },
    }),
    prisma.lakeSubmission.count({
      where,
    }),
  ]);

  const pagination =
    getAdminPagination(
      filteredCount,
      requestedPage,
      PER_PAGE
    );

  const submissions =
    await prisma.lakeSubmission.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.skip,
      take: PER_PAGE,
      include: {
        images: {
          orderBy: {
            createdAt: "desc",
          },
        },
        fishRecords: {
          orderBy: {
            weightKg: "desc",
          },
        },
        gearRequirements: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="Moderacja"
          title="Zgłoszenia łowisk"
          description="Przeglądaj propozycje użytkowników, sprawdzaj szczegóły i podejmuj decyzje bez przeciążania widoku wszystkimi danymi naraz."
          actions={
            <ButtonLink
              href="/admin"
              variant="outline"
            >
              Panel admina
            </ButtonLink>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Oczekujące"
            value={pendingCount}
            emphasis={
              pendingCount > 0
            }
          />

          <AdminMetricCard
            label="Zaakceptowane"
            value={approvedCount}
          />

          <AdminMetricCard
            label="Odrzucone"
            value={rejectedCount}
          />

          <AdminMetricCard
            label="Wszystkie"
            value={allCount}
          />
        </section>

        <div className="space-y-3">
          <AdminStatusTabs
            pathname="/admin/zgloszenia-lowisk"
            paramName="status"
            activeValue={status}
            params={{
              q:
                query ||
                undefined,
            }}
            items={[
              {
                value:
                  "pending",
                label:
                  "Oczekujące",
                count:
                  pendingCount,
              },
              {
                value:
                  "approved",
                label:
                  "Zaakceptowane",
                count:
                  approvedCount,
              },
              {
                value:
                  "rejected",
                label:
                  "Odrzucone",
                count:
                  rejectedCount,
              },
              {
                value: "all",
                label:
                  "Wszystkie",
                count: allCount,
              },
            ]}
          />

          <AdminFilterToolbar
            action="/admin/zgloszenia-lowisk"
            query={query}
            queryPlaceholder="Szukaj łowiska, miasta, województwa lub ryb..."
            hiddenFields={{
              status:
                status !==
                "all"
                  ? status
                  : undefined,
            }}
            resetHref={
              status === "all"
                ? "/admin/zgloszenia-lowisk"
                : `/admin/zgloszenia-lowisk?status=${status}`
            }
          />
        </div>

        {submissions.length >
        0 ? (
          <>
            <div className="space-y-3">
              {submissions.map(
                (
                  submission
                ) => {
                  const activeAmenities =
                    AMENITIES.filter(
                      ([key]) =>
                        Boolean(
                          submission[
                            key
                          ]
                        )
                    );

                  return (
                    <Card
                      key={
                        submission.id
                      }
                      className="overflow-hidden"
                    >
                      <details className="group">
                        <summary className="cursor-pointer list-none p-5 marker:hidden sm:p-6">
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <AdminStatusBadge
                                  status={
                                    submission.status
                                  }
                                />

                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-text-muted">
                                  {getAdminOwnerTypeLabel(
                                    submission.ownerType
                                  )}
                                </span>

                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-text-muted">
                                  {getAdminFishingTypeLabel(
                                    submission.fishingType
                                  )}
                                </span>
                              </div>

                              <h2 className="mt-3 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
                                {
                                  submission.name
                                }
                              </h2>

                              <p className="mt-1 text-sm text-text-secondary">
                                {
                                  submission.city
                                }
                                , woj.{" "}
                                {
                                  submission.voivodeship
                                }
                              </p>

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-text-muted">
                                <span>
                                  {
                                    submission.images.length
                                  }{" "}
                                  zdjęć
                                </span>

                                <span>
                                  {
                                    activeAmenities.length
                                  }{" "}
                                  udogodnień
                                </span>

                                <span>
                                  {formatAdminDate(
                                    submission.createdAt
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold text-primary-700">
                                Szczegóły
                              </span>

                              <span
                                aria-hidden="true"
                                className="text-lg font-black text-text-muted transition group-open:rotate-45"
                              >
                                +
                              </span>
                            </div>
                          </div>
                        </summary>

                        <div className="border-t border-border bg-surface-muted px-5 py-6 sm:px-6">
                          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
                            <div className="min-w-0 space-y-7">
                              <AdminDetailSection
                                title="Podstawowe informacje"
                              >
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                  <AdminInfoItem
                                    label="Ryby"
                                    value={
                                      submission.fish
                                    }
                                  />

                                  <AdminInfoItem
                                    label="Adres"
                                    value={`${submission.street}, ${submission.postalCode} ${submission.city}`}
                                  />

                                  <AdminInfoItem
                                    label="GPS"
                                    value={`${submission.lat}, ${submission.lng}`}
                                  />

                                  <AdminInfoItem
                                    label="Metody"
                                    value={
                                      submission.fishingMethods.length >
                                      0
                                        ? submission.fishingMethods
                                            .map(
                                              getAdminCatchMethodLabel
                                            )
                                            .join(
                                              ", "
                                            )
                                        : "Brak"
                                    }
                                  />
                                </div>

                                <div className="mt-3 rounded-control bg-surface px-4 py-4 text-sm leading-6 text-text-secondary">
                                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
                                    Opis
                                  </p>

                                  <p className="mt-2 whitespace-pre-line break-words">
                                    {
                                      submission.description
                                    }
                                  </p>
                                </div>
                              </AdminDetailSection>

                              <AdminDetailSection
                                title="Charakterystyka"
                              >
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                  <AdminInfoItem
                                    label="Powierzchnia"
                                    value={
                                      submission.area ||
                                      "Brak"
                                    }
                                  />

                                  <AdminInfoItem
                                    label="Średnia głębokość"
                                    value={
                                      submission.averageDepth ||
                                      "Brak"
                                    }
                                  />

                                  <AdminInfoItem
                                    label="Dno"
                                    value={
                                      submission.bottomType ||
                                      "Brak"
                                    }
                                  />

                                  <AdminInfoItem
                                    label="Typ wody"
                                    value={
                                      submission.waterType ||
                                      "Brak"
                                    }
                                  />
                                </div>
                              </AdminDetailSection>

                              <AdminDetailSection
                                title="Cennik i regulamin"
                              >
                                <div className="grid gap-3 lg:grid-cols-2">
                                  <AdminTextBlock
                                    label="Cennik"
                                    text={
                                      submission.priceListText
                                    }
                                    url={
                                      submission.priceListUrl
                                    }
                                  />

                                  <AdminTextBlock
                                    label="Regulamin"
                                    text={
                                      submission.rulesText
                                    }
                                    url={
                                      submission.rulesUrl
                                    }
                                  />
                                </div>
                              </AdminDetailSection>

                              <AdminDetailSection
                                title="Udogodnienia"
                              >
                                {activeAmenities.length >
                                0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {activeAmenities.map(
                                      ([
                                        key,
                                        label,
                                      ]) => (
                                        <span
                                          key={
                                            key
                                          }
                                          className="rounded-full border border-success-border bg-success-subtle px-3 py-1.5 text-xs font-bold text-success-foreground"
                                        >
                                          {
                                            label
                                          }
                                        </span>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-text-muted">
                                    Brak
                                    zaznaczonych
                                    udogodnień.
                                  </p>
                                )}
                              </AdminDetailSection>

                              {(submission.fishRecords.length >
                                0 ||
                                submission.gearRequirements.length >
                                  0) && (
                                <AdminDetailSection
                                  title="Rekordy i wymagania"
                                >
                                  <div className="grid gap-4 lg:grid-cols-2">
                                    <AdminListBox
                                      label="Rekordowe ryby"
                                      items={submission.fishRecords.map(
                                        (
                                          record
                                        ) =>
                                          `${record.fishName} — ${record.weightKg.toFixed(
                                            2
                                          )} kg`
                                      )}
                                    />

                                    <AdminListBox
                                      label="Wymagany sprzęt"
                                      items={submission.gearRequirements.map(
                                        (
                                          requirement
                                        ) =>
                                          requirement.text
                                      )}
                                    />
                                  </div>
                                </AdminDetailSection>
                              )}

                              {submission.images.length >
                                0 && (
                                <AdminDetailSection
                                  title="Zdjęcia"
                                >
                                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    {submission.images.map(
                                      (
                                        image
                                      ) => (
                                        <a
                                          key={
                                            image.id
                                          }
                                          href={
                                            image.url
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="group overflow-hidden rounded-card border border-border bg-surface"
                                        >
                                          <img
                                            src={
                                              image.url
                                            }
                                            alt={`Zdjęcie łowiska ${submission.name}`}
                                            className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                                          />
                                        </a>
                                      )
                                    )}
                                  </div>
                                </AdminDetailSection>
                              )}
                            </div>

                            <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                              <Card className="p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                                  Kontakt
                                </p>

                                <div className="mt-3 grid gap-2">
                                  <AdminInfoItem
                                    label="Nazwa"
                                    value={
                                      submission.contactName ||
                                      "Brak"
                                    }
                                  />

                                  <AdminInfoItem
                                    label="Telefon"
                                    value={
                                      submission.contactPhone ||
                                      "Brak"
                                    }
                                  />

                                  <AdminInfoItem
                                    label="E-mail"
                                    value={
                                      submission.contactEmail ||
                                      "Brak"
                                    }
                                  />

                                  <AdminInfoItem
                                    label="Strona"
                                    value={
                                      submission.contactWebsite ||
                                      "Brak"
                                    }
                                  />
                                </div>
                              </Card>

                              <Card className="p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
                                  Akcje
                                </p>

                                <div className="mt-3 grid gap-2">
                                  <ButtonLink
                                    href={`/admin/zgloszenia-lowisk/${submission.id}/edytuj`}
                                    variant="dark"
                                    size="sm"
                                    fullWidth
                                  >
                                    Edytuj dane
                                  </ButtonLink>

                                  {submission.status ===
                                    "pending" && (
                                    <AdminLakeSubmissionActions
                                      submissionId={
                                        submission.id
                                      }
                                      submissionName={
                                        submission.name
                                      }
                                    />
                                  )}
                                </div>
                              </Card>
                            </aside>
                          </div>
                        </div>
                      </details>
                    </Card>
                  );
                }
              )}
            </div>

            <AdminPagination
              pathname="/admin/zgloszenia-lowisk"
              page={
                pagination.page
              }
              totalPages={
                pagination.totalPages
              }
              params={{
                status:
                  status !==
                  "all"
                    ? status
                    : undefined,
                q:
                  query ||
                  undefined,
              }}
            />
          </>
        ) : (
          <AdminEmptyState
            title="Brak zgłoszeń"
            description="Nie ma zgłoszeń pasujących do wybranego statusu i wyszukiwania."
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function normalizeStatus(
  value:
    | string
    | undefined
) {
  if (
    value === "approved" ||
    value === "rejected" ||
    value === "all"
  ) {
    return value;
  }

  return "pending";
}

function AdminDetailSection({
  title,
  children,
}: {
  title: string;
  children:
    ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">
        {title}
      </h3>

      <div className="mt-3">
        {children}
      </div>
    </section>
  );
}

function AdminTextBlock({
  label,
  text,
  url,
}: {
  label: string;
  text: string | null;
  url: string | null;
}) {
  return (
    <div className="rounded-control bg-surface px-4 py-4">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-text-secondary">
        {text || "Brak treści."}
      </p>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-xs font-extrabold text-primary-700 hover:text-primary-900"
        >
          Otwórz link ↗
        </a>
      )}
    </div>
  );
}

function AdminListBox({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="rounded-control bg-surface px-4 py-4">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>

      {items.length > 0 ? (
        <ul className="mt-2 grid gap-2 text-sm text-text-secondary">
          {items.map(
            (
              item,
              index
            ) => (
              <li
                key={`${item}-${index}`}
                className="border-t border-border pt-2 first:border-t-0 first:pt-0"
              >
                {item}
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-text-muted">
          Brak.
        </p>
      )}
    </div>
  );
}
