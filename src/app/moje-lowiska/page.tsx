import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MapIcon } from "@/components/icons/MapIcon";
import { OwnerLakeCard } from "@/components/owner/OwnerLakeCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MyOwnerLakesPageProps = {
  searchParams?: Promise<{
    select?: string | string[];
  }>;
};

export default async function MyOwnerLakesPage({
  searchParams,
}: MyOwnerLakesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const forceSelector = getSearchParam(resolvedSearchParams.select) === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const ownedLakes = await prisma.lakeOwner.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      lake: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          voivodeship: true,
          ownerType: true,
          images: {
            take: 1,
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              url: true,
            },
          },
          _count: {
            select: {
              spots: {
                where: {
                  isActive: true,
                },
              },
              reservations: {
                where: {
                  status: "pending",
                  endsAt: {
                    gt: now,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (ownedLakes.length === 1 && !forceSelector) {
    redirect(`/moje-lowiska/${ownedLakes[0].lake.slug}`);
  }

  return (
    <DashboardLayout>
      <div className="pb-20 pt-5 lg:pb-4 lg:pt-7">
        <PageHeader
          eyebrow="Panel właściciela"
          title="Moje łowiska"
          description="Zarządzaj rezerwacjami, stanowiskami, profilem łowiska i stroną internetową z jednego miejsca."
          actions={
            <ButtonLink href="/lowiska-w-polsce" variant="outline">
              <MapIcon className="h-4 w-4" />
              Znajdź swoje łowisko
            </ButtonLink>
          }
        />

        {ownedLakes.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {ownedLakes.map((ownerLake) => (
              <OwnerLakeCard
                key={ownerLake.id}
                lake={{
                  name: ownerLake.lake.name,
                  slug: ownerLake.lake.slug,
                  city: ownerLake.lake.city,
                  voivodeship: ownerLake.lake.voivodeship,
                  ownerType: ownerLake.lake.ownerType,
                  imageUrl: ownerLake.lake.images[0]?.url ?? null,
                  activeSpotsCount: ownerLake.lake._count.spots,
                  pendingReservationsCount: ownerLake.lake._count.reservations,
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-7 min-h-[360px]"
            icon={<MapIcon className="h-6 w-6" />}
            title="Nie masz jeszcze przypisanego łowiska"
            description="Znajdź łowisko w publicznej bazie i zgłoś przejęcie jego profilu. Po zatwierdzeniu przez administratora pojawi się tutaj."
            action={
              <ButtonLink href="/lowiska-w-polsce" variant="primary">
                Przejdź do bazy łowisk
              </ButtonLink>
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
