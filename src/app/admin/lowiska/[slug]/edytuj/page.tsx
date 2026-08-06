import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakeEditForm } from "@/components/dashboard/LakeEditForm";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type EditLakePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getAdminEmails() {
  const singleAdminEmail = process.env.ADMIN_EMAIL ?? "";
  const multipleAdminEmails = process.env.ADMIN_EMAILS ?? "";

  return [singleAdminEmail, multipleAdminEmails]
    .join(",")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUser(user: {
  email?: string | null;
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  user_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
}) {
  const adminEmails = getAdminEmails();
  const userEmail = user.email?.trim().toLowerCase() ?? "";

  return (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    adminEmails.includes(userEmail)
  );
}

function isVisibleTextItem(item: string, hiddenPrefix: string) {
  return !item.toLowerCase().trim().startsWith(hiddenPrefix.toLowerCase());
}

export default async function EditLakePage({ params }: EditLakePageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const { slug } = await params;

  const lake = await prisma.lake.findUnique({
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
          weightKg: "desc",
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
          createdAt: "desc",
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
      .map((item) => item.text)
      .filter((item) => isVisibleTextItem(item, "link do cennika"))
      .join("\n");

  const rulesText =
    lake.rulesText ||
    lake.rules
      .map((item) => item.text)
      .filter((item) => isVisibleTextItem(item, "link do regulaminu"))
      .join("\n");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                Panel administratora
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                Edycja łowiska
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Popraw dane łowiska, lokalizację, udogodnienia, kontakt, cennik,
                regulamin oraz zdjęcia.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/lowiska"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Wróć do listy łowisk
              </Link>

              <Link
                href={`/lowiska-w-polsce/${lake.slug}`}
                className="rounded-2xl bg-blue-50 px-5 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                Podgląd publiczny
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoBox label="Nazwa" value={lake.name} />
            <InfoBox label="Miasto" value={lake.city} />
            <InfoBox label="Województwo" value={lake.voivodeship} />
            <InfoBox label="Slug" value={lake.slug} />
          </div>
        </section>

        <LakeEditForm
          lake={{
            id: lake.id,
            name: lake.name,
            slug: lake.slug,
            description: lake.description,
            ownerType: lake.ownerType,
            fishingType: lake.fishingType,
            fish: lake.fish,

            lat: String(lake.lat),
            lng: String(lake.lng),

            street: lake.street,
            city: lake.city,
            postalCode: lake.postalCode,
            voivodeship: lake.voivodeship,

            area: lake.area,
            averageDepth: lake.averageDepth,
            bottomType: lake.bottomType,
            waterType: lake.waterType,

            cottages: lake.cottages,
            campfire: lake.campfire,
            noKill: lake.noKill,
            tent: lake.tent,
            parking: lake.parking,
            pier: lake.pier,
            toilet: lake.toilet,
            shop: lake.shop,
            nightFishing: lake.nightFishing,
            boatRental: lake.boatRental,
            gearRental: lake.gearRental,
            shelter: lake.shelter,
            coveredSpots: lake.coveredSpots,
            playground: lake.playground,
            cardPayment: lake.cardPayment,

            priceListText,
            priceListUrl: lake.priceListUrl || "",

            rulesText,
            rulesUrl: lake.rulesUrl || "",

            isOpenAllDay: lake.isOpenAllDay,
            openingHours: lake.openingHours || "",

            fishRecords: lake.fishRecords.map((record) => ({
              id: record.id,
              fishName: record.fishName,
              weightKg: record.weightKg,
            })),

            gearRequirements: lake.gearRequirements.map((requirement) => ({
              id: requirement.id,
              text: requirement.text,
            })),

            images: lake.images.map((image) => ({
              id: image.id,
              url: image.url,
            })),

            contactName: lake.contactName,
            contactPhone: lake.contactPhone,
            contactEmail: lake.contactEmail,
            contactWebsite: lake.contactWebsite,
          }}
        />
      </div>
    </DashboardLayout>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-700">
        {value || "Brak"}
      </p>
    </div>
  );
}