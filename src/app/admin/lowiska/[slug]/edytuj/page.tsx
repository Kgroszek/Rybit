import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakeEditForm } from "@/components/dashboard/LakeEditForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type EditLakePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditLakePage({ params }: EditLakePageProps) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/");
  }

  const { slug } = await params;

  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    include: {
      fishSpecies: true,
      priceList: true,
      rules: true,
      images: true,
    },
  });

  if (!lake) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Edycja łowiska
        </h1>

        <p className="mt-2 max-w-3xl text-slate-500">
          Popraw dane łowiska, udogodnienia, kontakt, cennik oraz regulamin.
        </p>
      </div>

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
          priceListText:
            lake.priceListText ||
            lake.priceList.map((item) => item.text).join("\n"),
          priceListUrl: lake.priceListUrl || "",
          rulesText:
            lake.rulesText || lake.rules.map((item) => item.text).join("\n"),
          rulesUrl: lake.rulesUrl || "",
          contactName: lake.contactName,
          contactPhone: lake.contactPhone,
          contactEmail: lake.contactEmail,
          contactWebsite: lake.contactWebsite,
        }}
      />
    </DashboardLayout>
  );
}