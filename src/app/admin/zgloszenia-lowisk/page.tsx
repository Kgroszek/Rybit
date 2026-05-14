import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminSubmissionActions } from "@/components/dashboard/AdminSubmissionActions";

export default async function LakeSubmissionsAdminPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/");
  }

  const submissions = await prisma.lakeSubmission.findMany({
    where: {
      status: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: true,
    },
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Zgłoszenia łowisk
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Sprawdzaj propozycje łowisk przesłane przez użytkowników. Dopiero po
            akceptacji łowisko pojawi się publicznie na mapie.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          Oczekujące: {submissions.length}
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <article
              key={submission.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      Oczekuje
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        submission.ownerType === "commercial"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {submission.ownerType === "commercial"
                        ? "Komercyjne"
                        : "PZW"}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {getFishingTypeLabel(submission.fishingType)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-950">
                    {submission.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {submission.description}
                  </p>

                  {submission.images.length > 0 && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-950">
                          Zdjęcia zgłoszenia
                        </p>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          {submission.images.length} zdjęć
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {submission.images.map((image) => (
                          <a
                            key={image.id}
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                          >
                            <img
                              src={image.url}
                              alt={`Zdjęcie łowiska ${submission.name}`}
                              className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <InfoBox label="Ryby" value={submission.fish} />

                    <InfoBox
                      label="Adres"
                      value={`${submission.street}, ${submission.postalCode} ${submission.city}`}
                    />

                    <InfoBox
                      label="GPS"
                      value={`${submission.lat}, ${submission.lng}`}
                    />

                    <InfoBox
                      label="Data"
                      value={new Intl.DateTimeFormat("pl-PL").format(
                        submission.createdAt
                      )}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <InfoBox
                      label="Powierzchnia"
                      value={submission.area || "Brak danych"}
                    />

                    <InfoBox
                      label="Średnia głębokość"
                      value={submission.averageDepth || "Brak danych"}
                    />

                    <InfoBox
                      label="Rodzaj dna"
                      value={submission.bottomType || "Brak danych"}
                    />

                    <InfoBox
                      label="Typ wody"
                      value={submission.waterType || "Brak danych"}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <InfoBox
                      label="Kontakt"
                      value={submission.contactName || "Brak danych"}
                    />

                    <InfoBox
                      label="Telefon"
                      value={submission.contactPhone || "Brak danych"}
                    />

                    <InfoBox
                      label="E-mail"
                      value={submission.contactEmail || "Brak danych"}
                    />

                    <InfoBox
                      label="Strona"
                      value={submission.contactWebsite || "Brak danych"}
                    />
                  </div>

                  {(submission.priceListText ||
                    submission.priceListUrl ||
                    submission.rulesText ||
                    submission.rulesUrl) && (
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <TextBox
                        label="Cennik"
                        text={submission.priceListText}
                        url={submission.priceListUrl}
                      />

                      <TextBox
                        label="Regulamin"
                        text={submission.rulesText}
                        url={submission.rulesUrl}
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="mb-3 text-sm font-bold text-slate-950">
                      Udogodnienia
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <AmenityBadge active={submission.cottages} label="Domki" />
                      <AmenityBadge
                        active={submission.campfire}
                        label="Ognisko"
                      />
                      <AmenityBadge active={submission.noKill} label="No Kill" />
                      <AmenityBadge active={submission.tent} label="Namiot" />
                      <AmenityBadge active={submission.parking} label="Parking" />
                      <AmenityBadge active={submission.pier} label="Pomost" />
                      <AmenityBadge active={submission.toilet} label="Toaleta" />
                      <AmenityBadge active={submission.shop} label="Sklep" />
                      <AmenityBadge
                        active={submission.nightFishing}
                        label="Wędkowanie nocne"
                      />
                      <AmenityBadge
                        active={submission.boatRental}
                        label="Wypożyczalnia łodzi"
                      />
                      <AmenityBadge
                        active={submission.gearRental}
                        label="Wypożyczalnia sprzętu"
                      />
                      <AmenityBadge active={submission.shelter} label="Altana" />
                      <AmenityBadge
                        active={submission.coveredSpots}
                        label="Zadaszone stanowiska"
                      />
                      <AmenityBadge
                        active={submission.playground}
                        label="Plac zabaw"
                      />
                      <AmenityBadge
                        active={submission.cardPayment}
                        label="Płatność kartą"
                      />
                    </div>
                  </div>
                </div>

                <AdminSubmissionActions submissionId={submission.id} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak oczekujących zgłoszeń
          </p>

          <p className="mt-2 text-slate-500">
            Gdy użytkownik zgłosi nowe łowisko, pojawi się ono tutaj.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function TextBox({
  label,
  text,
  url,
}: {
  label: string;
  text: string | null;
  url: string | null;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      {text ? (
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
          {text}
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Brak treści.</p>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          Otwórz link
        </a>
      )}
    </div>
  );
}

function AmenityBadge({ active, label }: { active: boolean; label: string }) {
  if (!active) {
    return null;
  }

  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      {label}
    </span>
  );
}

function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";
  return "Inne";
}