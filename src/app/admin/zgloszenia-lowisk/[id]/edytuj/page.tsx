import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminLakeSubmissionEditForm } from "@/components/dashboard/AdminLakeSubmissionEditForm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type EditSubmissionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSubmissionPage({
  params,
}: EditSubmissionPageProps) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/");
  }

  const { id } = await params;

  const submission = await prisma.lakeSubmission.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
    },
  });

  if (!submission) {
    notFound();
  }

  if (submission.status !== "pending") {
    redirect("/admin/zgloszenia-lowisk");
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Edycja zgłoszenia łowiska
        </h1>

        <p className="mt-2 max-w-3xl text-slate-500">
          Popraw dane przesłane przez użytkownika przed zaakceptowaniem łowiska.
        </p>
      </div>

      <AdminLakeSubmissionEditForm
        submission={{
          id: submission.id,
          name: submission.name,
          description: submission.description,
          ownerType: submission.ownerType,
          fishingType: submission.fishingType,
          fish: submission.fish,
          lat: String(submission.lat),
          lng: String(submission.lng),
          street: submission.street,
          city: submission.city,
          postalCode: submission.postalCode,
          voivodeship: submission.voivodeship,
          area: submission.area || "",
          averageDepth: submission.averageDepth || "",
          bottomType: submission.bottomType || "",
          waterType: submission.waterType || "",
          priceListText: submission.priceListText || "",
          priceListUrl: submission.priceListUrl || "",
          rulesText: submission.rulesText || "",
          rulesUrl: submission.rulesUrl || "",
          cottages: submission.cottages,
          campfire: submission.campfire,
          noKill: submission.noKill,
          tent: submission.tent,
          parking: submission.parking,
          pier: submission.pier,
          toilet: submission.toilet,
          shop: submission.shop,
          nightFishing: submission.nightFishing,
          boatRental: submission.boatRental,
          gearRental: submission.gearRental,
          shelter: submission.shelter,
          coveredSpots: submission.coveredSpots,
          playground: submission.playground,
          cardPayment: submission.cardPayment,
          contactName: submission.contactName || "",
          contactPhone: submission.contactPhone || "",
          contactEmail: submission.contactEmail || "",
          contactWebsite: submission.contactWebsite || "",
          images: submission.images.map((image) => ({
            id: image.id,
            url: image.url,
          })),
        }}
      />
    </DashboardLayout>
  );
}