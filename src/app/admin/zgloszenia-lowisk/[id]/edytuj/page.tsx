import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminLakeSubmissionEditForm } from "@/components/dashboard/AdminLakeSubmissionEditForm";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

type EditSubmissionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === "pending") return "Oczekuje";
  if (status === "approved") return "Zaakceptowane";
  if (status === "rejected") return "Odrzucone";

  return status;
}

function getStatusClass(status: string) {
  if (status === "pending") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "approved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default async function EditSubmissionPage({
  params,
}: EditSubmissionPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const submission = await prisma.lakeSubmission.findUnique({
    where: {
      id,
    },
    include: {
      images: {
        orderBy: {
          createdAt: "desc",
        },
      },
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
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                Panel administratora
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                Edycja zgłoszenia łowiska
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Popraw dane przesłane przez użytkownika przed zaakceptowaniem
                łowiska i dodaniem go do publicznej bazy Rybio.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/zgloszenia-lowisk"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Wróć do zgłoszeń
              </Link>

              <Link
                href="/admin"
                className="rounded-2xl bg-blue-50 px-5 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              >
                Panel admina
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoBox
              label="Nazwa"
              value={submission.name}
            />

            <InfoBox
              label="Miasto"
              value={submission.city}
            />

            <InfoBox
              label="Województwo"
              value={submission.voivodeship}
            />

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                  submission.status
                )}`}
              >
                {getStatusLabel(submission.status)}
              </span>
            </div>

            <InfoBox
              label="Data zgłoszenia"
              value={formatDate(submission.createdAt)}
            />

            <InfoBox
              label="ID użytkownika"
              value={submission.userId || "Brak"}
            />

            <InfoBox
              label="Zdjęcia"
              value={String(submission.images.length)}
            />
          </div>

          {submission.adminNote && (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-500">
                Notatka admina
              </p>

              <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-amber-800">
                {submission.adminNote}
              </p>
            </div>
          )}
        </section>

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
      </div>
    </DashboardLayout>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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