import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminSubmissionActions } from "@/components/dashboard/AdminSubmissionActions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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
  email?: string;
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    role?: string;
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getOwnerTypeLabel(type: string) {
  if (type === "commercial") return "Komercyjne";
  if (type === "pzw") return "PZW";

  return "Inne";
}

function getFishingTypeLabel(type: string) {
  if (type === "general") return "Ogólne";
  if (type === "spinning") return "Spinningowe";
  if (type === "carp") return "Karpiowe";

  return "Inne";
}

export default async function LakeSubmissionsAdminPage() {
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

  const [pendingSubmissions, allSubmissionsCount, approvedCount, rejectedCount] =
    await Promise.all([
      prisma.lakeSubmission.findMany({
        where: {
          status: "pending",
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),

      prisma.lakeSubmission.count(),

      prisma.lakeSubmission.count({
        where: {
          status: "approved",
        },
      }),

      prisma.lakeSubmission.count({
        where: {
          status: "rejected",
        },
      }),
    ]);

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
                Zgłoszenia łowisk
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Sprawdzaj propozycje łowisk przesłane przez użytkowników.
                Dopiero po akceptacji łowisko pojawi się publicznie w bazie
                Rybio.
              </p>
            </div>

            <Link
              href="/admin"
              className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Wróć do panelu admina
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Oczekujące"
            value={pendingSubmissions.length}
            variant="warning"
          />

          <StatCard
            label="Zaakceptowane"
            value={approvedCount}
            variant="success"
          />

          <StatCard label="Odrzucone" value={rejectedCount} variant="danger" />

          <StatCard
            label="Wszystkie zgłoszenia"
            value={allSubmissionsCount}
            variant="neutral"
          />
        </section>

        {pendingSubmissions.length > 0 ? (
          <div className="space-y-4">
            {pendingSubmissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                        Oczekuje
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          submission.ownerType === "commercial"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {getOwnerTypeLabel(submission.ownerType)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        {getFishingTypeLabel(submission.fishingType)}
                      </span>
                    </div>

                    <h2 className="break-words text-xl font-black text-slate-950">
                      {submission.name}
                    </h2>

                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                      {submission.description}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                      <InfoBox label="Ryby" value={submission.fish} />

                      <InfoBox
                        label="Adres"
                        value={`${submission.street}, ${submission.postalCode} ${submission.city}`}
                      />

                      <InfoBox
                        label="Województwo"
                        value={submission.voivodeship}
                      />

                      <InfoBox
                        label="GPS"
                        value={`${submission.lat}, ${submission.lng}`}
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

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                      <InfoBox
                        label="Data zgłoszenia"
                        value={formatDate(submission.createdAt)}
                      />

                      <InfoBox
                        label="ID użytkownika"
                        value={submission.userId || "Brak"}
                      />

                      <InfoBox
                        label="Slug"
                        value={submission.slug || "Brak"}
                      />

                      <InfoBox
                        label="Zdjęcia"
                        value={String(submission.images.length)}
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
                      <p className="mb-3 text-sm font-black text-slate-950">
                        Udogodnienia
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <AmenityBadge
                          active={submission.cottages}
                          label="Domki"
                        />
                        <AmenityBadge
                          active={submission.campfire}
                          label="Ognisko"
                        />
                        <AmenityBadge
                          active={submission.noKill}
                          label="No Kill"
                        />
                        <AmenityBadge
                          active={submission.tent}
                          label="Namiot"
                        />
                        <AmenityBadge
                          active={submission.parking}
                          label="Parking"
                        />
                        <AmenityBadge
                          active={submission.pier}
                          label="Pomost"
                        />
                        <AmenityBadge
                          active={submission.toilet}
                          label="Toaleta"
                        />
                        <AmenityBadge
                          active={submission.shop}
                          label="Sklep"
                        />
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
                        <AmenityBadge
                          active={submission.shelter}
                          label="Altana"
                        />
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

                      {!hasAnyAmenity(submission) && (
                        <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                          Brak zaznaczonych udogodnień.
                        </p>
                      )}
                    </div>

                    {submission.images.length > 0 && (
                      <div className="mt-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-950">
                            Zdjęcia zgłoszenia
                          </p>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
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
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row xl:w-[280px] xl:flex-col">
                    <Link
                      href={`/admin/zgloszenia-lowisk/${submission.id}/edytuj`}
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Edytuj
                    </Link>

                    <AdminSubmissionActions submissionId={submission.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Brak oczekujących zgłoszeń
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gdy użytkownik zgłosi nowe łowisko, pojawi się ono tutaj.
            </p>

            <Link
              href="/admin"
              className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Wróć do panelu admina
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "warning" | "success" | "danger" | "neutral";
}) {
  const classes = {
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    danger: "border-red-100 bg-red-50 text-red-700",
    neutral: "border-slate-200 bg-white text-slate-950",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${classes[variant]}`}>
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-700">
        {value}
      </p>
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
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      {text ? (
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
          {text}
        </p>
      ) : (
        <p className="mt-2 text-sm font-bold text-slate-500">Brak treści.</p>
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
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
      {label}
    </span>
  );
}

function hasAnyAmenity(submission: {
  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  gearRental: boolean;
  shelter: boolean;
  coveredSpots: boolean;
  playground: boolean;
  cardPayment: boolean;
}) {
  return (
    submission.cottages ||
    submission.campfire ||
    submission.noKill ||
    submission.tent ||
    submission.parking ||
    submission.pier ||
    submission.toilet ||
    submission.shop ||
    submission.nightFishing ||
    submission.boatRental ||
    submission.gearRental ||
    submission.shelter ||
    submission.coveredSpots ||
    submission.playground ||
    submission.cardPayment
  );
}