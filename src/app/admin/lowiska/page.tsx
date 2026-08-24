import type {
  Prisma,
} from "@prisma/client";
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
  formatAdminDateOnly,
  getAdminPagination,
} from "@/lib/admin/admin-formatters";
import {
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

const PER_PAGE = 25;

type AdminLakesPageProps = {
  searchParams: Promise<{
    q?: string;
    owner?: string;
    voivodeship?: string;
    page?: string;
  }>;
};

export default async function AdminLakesPage({
  searchParams,
}: AdminLakesPageProps) {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const params =
    await searchParams;

  const query =
    params.q?.trim() ?? "";

  const owner =
    params.owner?.trim() ??
    "";

  const voivodeship =
    params.voivodeship?.trim() ??
    "";

  const requestedPage =
    clampAdminPage(params.page);

  const where: Prisma.LakeWhereInput =
    {
      ...(query
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
                slug: {
                  contains:
                    query,
                  mode:
                    "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(owner
        ? {
            ownerType:
              owner,
          }
        : {}),
      ...(voivodeship
        ? {
            voivodeship,
          }
        : {}),
    };

  const [
    total,
    allLakesCount,
    commercialCount,
    pzwCount,
    voivodeships,
  ] = await Promise.all([
    prisma.lake.count({
      where,
    }),
    prisma.lake.count(),
    prisma.lake.count({
      where: {
        ownerType:
          "commercial",
      },
    }),
    prisma.lake.count({
      where: {
        ownerType: "pzw",
      },
    }),
    prisma.lake.findMany({
      distinct: [
        "voivodeship",
      ],
      orderBy: {
        voivodeship:
          "asc",
      },
      select: {
        voivodeship:
          true,
      },
    }),
  ]);

  const pagination =
    getAdminPagination(
      total,
      requestedPage,
      PER_PAGE
    );

  const lakes =
    await prisma.lake.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip: pagination.skip,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        voivodeship: true,
        ownerType: true,
        fishingType: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            owners: true,
            catches: true,
            images: true,
          },
        },
      },
    });

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="Treść"
          title="Łowiska"
          description="Zarządzaj publiczną bazą łowisk, szybko wyszukuj rekordy i przechodź do edycji."
          actions={
            <ButtonLink
              href="/admin"
              variant="outline"
            >
              Panel admina
            </ButtonLink>
          }
        />

        <section className="grid gap-4 sm:grid-cols-3">
          <AdminMetricCard
            label="Wszystkie łowiska"
            value={allLakesCount}
          />

          <AdminMetricCard
            label="PZW"
            value={pzwCount}
          />

          <AdminMetricCard
            label="Komercyjne"
            value={
              commercialCount
            }
          />
        </section>

        <AdminFilterToolbar
          action="/admin/lowiska"
          query={query}
          queryPlaceholder="Szukaj po nazwie, mieście lub slugu..."
          selectFields={[
            {
              name: "owner",
              label:
                "Rodzaj łowiska",
              value: owner,
              options: [
                {
                  value: "",
                  label:
                    "Wszystkie rodzaje",
                },
                {
                  value:
                    "pzw",
                  label: "PZW",
                },
                {
                  value:
                    "commercial",
                  label:
                    "Komercyjne",
                },
              ],
            },
            {
              name:
                "voivodeship",
              label:
                "Województwo",
              value:
                voivodeship,
              options: [
                {
                  value: "",
                  label:
                    "Wszystkie województwa",
                },
                ...voivodeships.map(
                  (item) => ({
                    value:
                      item.voivodeship,
                    label:
                      item.voivodeship,
                  })
                ),
              ],
            },
          ]}
          resetHref="/admin/lowiska"
        />

        {lakes.length > 0 ? (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-5">
                <CardTitle>
                  Lista łowisk
                </CardTitle>

                <CardDescription>
                  {total} wyników
                  dla aktualnych
                  filtrów.
                </CardDescription>
              </CardHeader>

              <CardContent className="py-0">
                <div className="hidden grid-cols-[minmax(240px,1.4fr)_minmax(180px,.8fr)_120px_120px_130px_170px] gap-4 border-b border-border py-3 text-[9px] font-black uppercase tracking-[0.12em] text-text-muted xl:grid">
                  <span>
                    Łowisko
                  </span>
                  <span>
                    Typ
                  </span>
                  <span>
                    Połowy
                  </span>
                  <span>
                    Zdjęcia
                  </span>
                  <span>
                    Właściciele
                  </span>
                  <span className="text-right">
                    Akcje
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {lakes.map(
                    (lake) => (
                      <article
                        key={
                          lake.id
                        }
                        className="grid gap-4 py-5 xl:grid-cols-[minmax(240px,1.4fr)_minmax(180px,.8fr)_120px_120px_130px_170px] xl:items-center"
                      >
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-extrabold text-text">
                            {
                              lake.name
                            }
                          </h2>

                          <p className="mt-1 truncate text-xs text-text-muted">
                            {
                              lake.city
                            }
                            , woj.{" "}
                            {
                              lake.voivodeship
                            }
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-text-muted xl:hidden">
                            Aktualizacja:{" "}
                            {formatAdminDateOnly(
                              lake.updatedAt
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:block">
                          <p className="text-xs font-bold text-text-secondary">
                            {getAdminOwnerTypeLabel(
                              lake.ownerType
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-text-muted">
                            {getAdminFishingTypeLabel(
                              lake.fishingType
                            )}
                          </p>
                        </div>

                        <CompactMetric
                          label="Połowy"
                          value={
                            lake
                              ._count
                              .catches
                          }
                        />

                        <CompactMetric
                          label="Zdjęcia"
                          value={
                            lake
                              ._count
                              .images
                          }
                        />

                        <CompactMetric
                          label="Właściciele"
                          value={
                            lake
                              ._count
                              .owners
                          }
                        />

                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <ButtonLink
                            href={`/lowiska-w-polsce/${lake.slug}`}
                            variant="ghost"
                            size="sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Podgląd
                          </ButtonLink>

                          <ButtonLink
                            href={`/admin/lowiska/${lake.slug}/edytuj`}
                            variant="outline"
                            size="sm"
                          >
                            Edytuj
                          </ButtonLink>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <AdminPagination
              pathname="/admin/lowiska"
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
                owner:
                  owner ||
                  undefined,
                voivodeship:
                  voivodeship ||
                  undefined,
              }}
            />
          </>
        ) : (
          <AdminEmptyState
            title="Brak łowisk"
            description="Nie znaleziono rekordów pasujących do aktualnych filtrów."
            action={
              <ButtonLink
                href="/admin/lowiska"
                variant="outline"
              >
                Wyczyść filtry
              </ButtonLink>
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function CompactMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-control bg-surface-muted px-3 py-2 xl:block xl:bg-transparent xl:px-0 xl:py-0">
      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-text-muted xl:hidden">
        {label}
      </span>

      <span className="text-sm font-extrabold text-text-secondary">
        {value}
      </span>
    </div>
  );
}
