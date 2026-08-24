import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminInfoItem,
} from "@/components/admin/shared/AdminInfoItem";
import {
  DashboardLayout,
} from "@/components/dashboard/DashboardLayout";
import {
  LakeEditForm,
} from "@/components/dashboard/LakeEditForm";
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
  requireAdmin,
} from "@/lib/auth";
import {
  normalizeFishingMethods,
} from "@/lib/fishing-methods";
import {
  prisma,
} from "@/lib/prisma";

type EditLakePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function isVisibleTextItem(
  item: string,
  hiddenPrefix: string
) {
  return !item
    .toLowerCase()
    .trim()
    .startsWith(
      hiddenPrefix.toLowerCase()
    );
}

export default async function EditLakePage({
  params,
}: EditLakePageProps) {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const { slug } =
    await params;

  const lake =
    await prisma.lake.findUnique({
      where: {
        slug,
      },
      include: {
        fishSpecies: {
          orderBy: {
            name: "asc",
          },
        },
        fishRecords: {
          orderBy: {
            weightKg:
              "desc",
          },
        },
        gearRequirements: {
          orderBy: {
            id: "asc",
          },
        },
        priceList: {
          orderBy: {
            id: "asc",
          },
        },
        rules: {
          orderBy: {
            id: "asc",
          },
        },
        images: {
          orderBy: {
            createdAt:
              "desc",
          },
        },
        _count: {
          select: {
            catches: true,
            favourites:
              true,
            ratings: true,
            owners: true,
          },
        },
      },
    });

  if (!lake) {
    notFound();
  }

  const priceListText =
    lake.priceListText ||
    lake.priceList
      .map(
        (item) =>
          item.text
      )
      .filter((item) =>
        isVisibleTextItem(
          item,
          "link do cennika"
        )
      )
      .join("\n");

  const rulesText =
    lake.rulesText ||
    lake.rules
      .map(
        (item) =>
          item.text
      )
      .filter((item) =>
        isVisibleTextItem(
          item,
          "link do regulaminu"
        )
      )
      .join("\n");

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="Treść · Łowiska"
          title="Edycja łowiska"
          description="Zarządzaj publicznymi danymi łowiska, metodami, udogodnieniami, rekordami, wymaganiami i zdjęciami."
          actions={
            <>
              <ButtonLink
                href="/admin/lowiska"
                variant="outline"
              >
                Wróć do listy
              </ButtonLink>

              <ButtonLink
                href={`/lowiska-w-polsce/${lake.slug}`}
                variant="ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                Podgląd publiczny ↗
              </ButtonLink>
            </>
          }
        />

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                Publiczne łowisko
              </p>

              <h2 className="mt-2 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
                {lake.name}
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {lake.city}, woj.{" "}
                {lake.voivodeship}
              </p>
            </div>

            <p className="break-all text-xs font-semibold text-text-muted">
              /{lake.slug}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AdminInfoItem
              label="Połowy"
              value={
                lake._count
                  .catches
              }
            />

            <AdminInfoItem
              label="Ulubione"
              value={
                lake._count
                  .favourites
              }
            />

            <AdminInfoItem
              label="Oceny"
              value={
                lake._count
                  .ratings
              }
            />

            <AdminInfoItem
              label="Właściciele"
              value={
                lake._count
                  .owners
              }
            />
          </div>
        </Card>

        <LakeEditForm
          lake={{
            id: lake.id,
            name:
              lake.name,
            slug:
              lake.slug,
            description:
              lake.description,
            ownerType:
              lake.ownerType,
            fishingType:
              lake.fishingType,
            fishingMethods:
              normalizeFishingMethods(
                lake.fishingMethods
              ),
            fish:
              lake.fish,

            lat: String(
              lake.lat
            ),
            lng: String(
              lake.lng
            ),

            street:
              lake.street,
            city:
              lake.city,
            postalCode:
              lake.postalCode,
            voivodeship:
              lake.voivodeship,

            area:
              lake.area,
            averageDepth:
              lake.averageDepth,
            bottomType:
              lake.bottomType,
            waterType:
              lake.waterType,

            cottages:
              lake.cottages,
            campfire:
              lake.campfire,
            noKill:
              lake.noKill,
            tent:
              lake.tent,
            parking:
              lake.parking,
            pier:
              lake.pier,
            toilet:
              lake.toilet,
            sanitaryFacilities:
              lake.sanitaryFacilities,
            shop:
              lake.shop,
            nightFishing:
              lake.nightFishing,
            boatRental:
              lake.boatRental,
            camperCaravan:
              lake.camperCaravan,
            electricityHookup:
              lake.electricityHookup,
            gearRental:
              lake.gearRental,
            shelter:
              lake.shelter,
            coveredSpots:
              lake.coveredSpots,
            playground:
              lake.playground,
            cardPayment:
              lake.cardPayment,

            priceListText,
            priceListUrl:
              lake.priceListUrl ||
              "",

            rulesText,
            rulesUrl:
              lake.rulesUrl ||
              "",

            isOpenAllDay:
              lake.isOpenAllDay,
            openingHours:
              lake.openingHours ||
              "",

            fishRecords:
              lake.fishRecords.map(
                (record) => ({
                  id:
                    record.id,
                  fishName:
                    record.fishName,
                  weightKg:
                    record.weightKg,
                })
              ),

            gearRequirements:
              lake.gearRequirements.map(
                (
                  requirement
                ) => ({
                  id:
                    requirement.id,
                  text:
                    requirement.text,
                })
              ),

            images:
              lake.images.map(
                (image) => ({
                  id:
                    image.id,
                  url:
                    image.url,
                })
              ),

            contactName:
              lake.contactName,
            contactPhone:
              lake.contactPhone,
            contactEmail:
              lake.contactEmail,
            contactWebsite:
              lake.contactWebsite,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
