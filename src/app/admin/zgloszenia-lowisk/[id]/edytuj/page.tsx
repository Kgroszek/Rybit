import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminInfoItem,
} from "@/components/admin/shared/AdminInfoItem";
import {
  AdminStatusBadge,
} from "@/components/admin/shared/AdminStatusBadge";
import {
  AdminLakeSubmissionEditForm,
} from "@/components/dashboard/AdminLakeSubmissionEditForm";
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
  formatAdminDate,
} from "@/lib/admin/admin-formatters";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  prisma,
} from "@/lib/prisma";

type EditSubmissionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSubmissionPage({
  params,
}: EditSubmissionPageProps) {
  const admin =
    await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const { id } =
    await params;

  const submission =
    await prisma.lakeSubmission.findUnique(
      {
        where: {
          id,
        },
        include: {
          images: {
            orderBy: {
              createdAt:
                "desc",
            },
          },
          fishRecords: {
            orderBy: {
              weightKg:
                "desc",
            },
          },
          gearRequirements:
            {
              orderBy: {
                createdAt:
                  "asc",
              },
            },
        },
      }
    );

  if (!submission) {
    notFound();
  }

  if (
    submission.status !==
    "pending"
  ) {
    redirect(
      "/admin/zgloszenia-lowisk"
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow="Moderacja · Zgłoszenia łowisk"
          title="Edycja zgłoszenia"
          description="Popraw dane przesłane przez użytkownika przed zaakceptowaniem i utworzeniem publicznego profilu łowiska."
          actions={
            <>
              <ButtonLink
                href="/admin/zgloszenia-lowisk"
                variant="outline"
              >
                Wróć do zgłoszeń
              </ButtonLink>

              <ButtonLink
                href="/admin"
                variant="ghost"
              >
                Panel admina
              </ButtonLink>
            </>
          }
        />

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge
                  status={
                    submission.status
                  }
                />

                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-text-muted">
                  ID:{" "}
                  {submission.id}
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
            </div>

            <p className="text-xs font-semibold text-text-muted">
              Zgłoszono:{" "}
              {formatAdminDate(
                submission.createdAt
              )}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AdminInfoItem
              label="Użytkownik"
              value={
                submission.userId ||
                "Brak"
              }
            />

            <AdminInfoItem
              label="Zdjęcia"
              value={
                submission.images.length
              }
            />

            <AdminInfoItem
              label="Rekordowe ryby"
              value={
                submission.fishRecords.length
              }
            />

            <AdminInfoItem
              label="Wymagania sprzętowe"
              value={
                submission.gearRequirements.length
              }
            />
          </div>

          {submission.adminNote && (
            <div className="mt-4 rounded-control border border-warning-border bg-warning-subtle px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-warning-foreground">
                Notatka administratora
              </p>

              <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-text-secondary">
                {
                  submission.adminNote
                }
              </p>
            </div>
          )}
        </Card>

        <AdminLakeSubmissionEditForm
          submission={{
            id:
              submission.id,
            name:
              submission.name,
            description:
              submission.description,
            ownerType:
              submission.ownerType,
            fishingType:
              submission.fishingType,
            fishingMethods:
              submission.fishingMethods,
            fish:
              submission.fish,

            lat: String(
              submission.lat
            ),
            lng: String(
              submission.lng
            ),

            street:
              submission.street,
            city:
              submission.city,
            postalCode:
              submission.postalCode,
            voivodeship:
              submission.voivodeship,

            area:
              submission.area ||
              "",
            averageDepth:
              submission.averageDepth ||
              "",
            bottomType:
              submission.bottomType ||
              "",
            waterType:
              submission.waterType ||
              "",

            priceListText:
              submission.priceListText ||
              "",
            priceListUrl:
              submission.priceListUrl ||
              "",
            rulesText:
              submission.rulesText ||
              "",
            rulesUrl:
              submission.rulesUrl ||
              "",

            isOpenAllDay:
              submission.isOpenAllDay,
            openingHours:
              submission.openingHours ||
              "",

            cottages:
              submission.cottages,
            campfire:
              submission.campfire,
            noKill:
              submission.noKill,
            tent:
              submission.tent,
            parking:
              submission.parking,
            pier:
              submission.pier,
            toilet:
              submission.toilet,
            sanitaryFacilities:
              submission.sanitaryFacilities,
            shop:
              submission.shop,
            nightFishing:
              submission.nightFishing,
            boatRental:
              submission.boatRental,
            camperCaravan:
              submission.camperCaravan,
            electricityHookup:
              submission.electricityHookup,
            gearRental:
              submission.gearRental,
            shelter:
              submission.shelter,
            coveredSpots:
              submission.coveredSpots,
            playground:
              submission.playground,
            cardPayment:
              submission.cardPayment,

            contactName:
              submission.contactName ||
              "",
            contactPhone:
              submission.contactPhone ||
              "",
            contactEmail:
              submission.contactEmail ||
              "",
            contactWebsite:
              submission.contactWebsite ||
              "",

            fishRecords:
              submission.fishRecords.map(
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
              submission.gearRequirements.map(
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
              submission.images.map(
                (image) => ({
                  id:
                    image.id,
                  url:
                    image.url,
                })
              ),
          }}
        />
      </div>
    </DashboardLayout>
  );
}
