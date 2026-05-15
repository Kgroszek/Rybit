import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MyLakeSubmissionDetailsPage({
  params,
}: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const submission = await prisma.lakeSubmission.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      images: true,
    },
  });

  if (!submission) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link
          href="/lowiska"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Wróć do łowisk
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Twoje zgłoszenie łowiska
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Tutaj możesz sprawdzić status zgłoszenia oraz komentarz
            administratora.
          </p>
        </div>

        <StatusBadge status={submission.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Nazwa łowiska
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {submission.name}
                </h2>
              </div>

              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                {formatDateTime(submission.createdAt)}
              </p>
            </div>

            <p className="mt-5 whitespace-pre-line leading-7 text-slate-600">
              {submission.description}
            </p>
          </section>

          {submission.status === "rejected" && (
            <section className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">
                Komentarz administratora
              </p>

              <h2 className="mt-2 text-xl font-bold text-red-700">
                Zgłoszenie zostało odrzucone
              </h2>

              <p className="mt-4 whitespace-pre-line rounded-2xl bg-white p-5 text-sm font-medium leading-7 text-red-700">
                {submission.adminNote ||
                  "Administrator odrzucił zgłoszenie bez dodatkowego komentarza."}
              </p>
            </section>
          )}

          {submission.status === "approved" && (
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                Zaakceptowane
              </p>

              <h2 className="mt-2 text-xl font-bold text-emerald-700">
                Twoje łowisko zostało zaakceptowane
              </h2>

              <p className="mt-3 text-sm leading-6 text-emerald-700">
                Łowisko zostało opublikowane i jest dostępne dla użytkowników.
              </p>
            </section>
          )}

          {submission.status === "pending" && (
            <section className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                Oczekuje
              </p>

              <h2 className="mt-2 text-xl font-bold text-amber-700">
                Zgłoszenie czeka na sprawdzenie
              </h2>

              <p className="mt-3 text-sm leading-6 text-amber-700">
                Administrator sprawdzi Twoje zgłoszenie. Po akceptacji łowisko
                pojawi się publicznie w bazie.
              </p>
            </section>
          )}

          {submission.images.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Zdjęcia ze zgłoszenia
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Zdjęcia dodane podczas zgłaszania łowiska.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {submission.images.length} zdjęć
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {submission.images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <img
                      src={image.url}
                      alt={`Zdjęcie zgłoszenia ${submission.name}`}
                      className="h-52 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Informacje o zgłoszeniu
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Status" value={getStatusLabel(submission.status)} />
              <InfoRow label="Rodzaj" value={getOwnerTypeLabel(submission.ownerType)} />
              <InfoRow
                label="Typ łowienia"
                value={getFishingTypeLabel(submission.fishingType)}
              />
              <InfoRow label="Ryby" value={submission.fish} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Adres</h2>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">
                {submission.street}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {submission.postalCode} {submission.city}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                woj. {submission.voivodeship}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Dane łowiska</h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Powierzchnia" value={submission.area || "Brak danych"} />
              <InfoRow
                label="Średnia głębokość"
                value={submission.averageDepth || "Brak danych"}
              />
              <InfoRow
                label="Rodzaj dna"
                value={submission.bottomType || "Brak danych"}
              />
              <InfoRow
                label="Typ wody"
                value={submission.waterType || "Brak danych"}
              />
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
        Zaakceptowane
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        Odrzucone
      </span>
    );
  }

  return (
    <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
      Oczekuje
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-right text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function getStatusLabel(status: string) {
  if (status === "pending") return "Oczekuje";
  if (status === "approved") return "Zaakceptowane";
  if (status === "rejected") return "Odrzucone";
  return status;
}

function getOwnerTypeLabel(type: string) {
  if (type === "pzw") return "PZW";
  if (type === "commercial") return "Komercyjne";
  return "Inne";
}

function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  return "Inne";
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}