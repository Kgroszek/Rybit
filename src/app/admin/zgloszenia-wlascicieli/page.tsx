import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type OwnerClaimActionResult = {
  claimId: string;
  adminNote?: string;
};

export default async function OwnerClaimsAdminPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const [claims, pendingCount, approvedCount, rejectedCount, ownersCount] =
    await Promise.all([
      prisma.lakeOwnerClaim.findMany({
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
              contactName: true,
              contactPhone: true,
              contactEmail: true,
              contactWebsite: true,
            },
          },
        },
      }),
      prisma.lakeOwnerClaim.count({
        where: {
          status: "pending",
        },
      }),
      prisma.lakeOwnerClaim.count({
        where: {
          status: "approved",
        },
      }),
      prisma.lakeOwnerClaim.count({
        where: {
          status: "rejected",
        },
      }),
      prisma.lakeOwner.count({
        where: {
          isActive: true,
        },
      }),
    ]);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Panel administratora
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Zgłoszenia właścicieli łowisk
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Tutaj trafiają zgłoszenia od osób, które chcą przejąć profil
              łowiska w Rybio. Po zatwierdzeniu użytkownik dostanie dostęp
              właścicielski do konkretnego łowiska.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Wróć do panelu admina
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Oczekujące"
            value={pendingCount}
            variant="warning"
          />

          <StatCard
            label="Zatwierdzone"
            value={approvedCount}
            variant="success"
          />

          <StatCard
            label="Odrzucone"
            value={rejectedCount}
            variant="danger"
          />

          <StatCard
            label="Aktywni właściciele"
            value={ownersCount}
            variant="neutral"
          />
        </div>

        {claims.length > 0 ? (
          <div className="space-y-5">
            {claims.map((claim) => (
              <article
                key={claim.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-slate-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                            claim.status
                          )}`}
                        >
                          {getStatusLabel(claim.status)}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                          {getClaimRoleLabel(claim.claimantRole)}
                        </span>
                      </div>

                      <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
                        {claim.lake.name}
                      </h2>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-500">
                        {claim.lake.city}, woj. {claim.lake.voivodeship}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                        Data zgłoszenia
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {formatDate(claim.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="min-w-0 space-y-5">
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">
                        Dane zgłaszającego
                      </h3>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <InfoBox
                          label="Imię i nazwisko"
                          value={claim.claimantName || "Brak"}
                        />

                        <InfoBox
                          label="Telefon"
                          value={claim.claimantPhone || "Brak"}
                        />

                        <InfoBox
                          label="E-mail konta"
                          value={claim.userEmail || "Brak"}
                        />

                        <InfoBox
                          label="Rola"
                          value={getClaimRoleLabel(claim.claimantRole)}
                        />
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">
                        Wiadomość
                      </h3>

                      <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                        <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-700">
                          {claim.message || "Brak dodatkowej wiadomości."}
                        </p>
                      </div>
                    </section>

                    {claim.adminNote && (
                      <section>
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">
                          Notatka admina
                        </h3>

                        <div className="mt-3 rounded-2xl bg-blue-50 p-4">
                          <p className="whitespace-pre-line break-words text-sm leading-6 text-blue-800">
                            {claim.adminNote}
                          </p>
                        </div>
                      </section>
                    )}

                    {claim.status === "pending" && (
                      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">
                          Decyzja
                        </h3>

                        <form
                          action={approveOwnerClaim}
                          className="mt-4 space-y-4"
                        >
                          <input
                            type="hidden"
                            name="claimId"
                            value={claim.id}
                          />

                          <textarea
                            name="adminNote"
                            rows={3}
                            placeholder="Opcjonalna notatka admina, np. potwierdzono telefonicznie."
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                          />

                          <div className="grid gap-3 sm:grid-cols-2">
                            <button
                              type="submit"
                              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                            >
                              Zatwierdź i nadaj dostęp
                            </button>

                            <button
                              type="submit"
                              formAction={rejectOwnerClaim}
                              className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                            >
                              Odrzuć zgłoszenie
                            </button>
                          </div>
                        </form>
                      </section>
                    )}
                  </div>

                  <aside className="min-w-0 space-y-4">
                    <section className="rounded-3xl border border-slate-200 bg-white p-4">
                      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">
                        Łowisko
                      </h3>

                      <div className="mt-3 space-y-3">
                        <InfoBox label="Nazwa" value={claim.lake.name} />

                        <InfoBox
                          label="Miejscowość"
                          value={`${claim.lake.city}, ${claim.lake.voivodeship}`}
                        />

                        <InfoBox
                          label="Kontakt"
                          value={claim.lake.contactName || "Brak"}
                        />

                        <InfoBox
                          label="Telefon"
                          value={claim.lake.contactPhone || "Brak"}
                        />

                        <InfoBox
                          label="E-mail"
                          value={claim.lake.contactEmail || "Brak"}
                        />

                        <InfoBox
                          label="Strona"
                          value={claim.lake.contactWebsite || "Brak"}
                        />
                      </div>

                      <div className="mt-4 grid gap-2">
                        <Link
                          href={`/lowiska-w-polsce/${claim.lake.slug}`}
                          className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
                        >
                          Podgląd publiczny
                        </Link>

                        <Link
                          href={`/admin/lowiska/${claim.lake.slug}/edytuj`}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                          Edytuj łowisko
                        </Link>
                      </div>
                    </section>

                    {claim.status === "approved" && (
                      <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-sm font-black text-emerald-950">
                          Dostęp nadany
                        </p>

                        <p className="mt-2 text-sm leading-6 text-emerald-800">
                          Ten użytkownik został przypisany jako właściciel
                          łowiska. W kolejnym etapie dostanie panel edycji i
                          rezerwacji.
                        </p>
                      </section>
                    )}

                    {claim.status === "rejected" && (
                      <section className="rounded-3xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm font-black text-red-950">
                          Zgłoszenie odrzucone
                        </p>

                        <p className="mt-2 text-sm leading-6 text-red-800">
                          Zgłoszenie nie nadało dostępu do zarządzania
                          łowiskiem.
                        </p>
                      </section>
                    )}
                  </aside>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-950">
              Brak zgłoszeń właścicieli
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Gdy właściciel łowiska wyśle formularz przejęcia profilu, pojawi
              się on w tym miejscu.
            </p>

            <Link
              href="/admin"
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Wróć do panelu admina
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

async function approveOwnerClaim(formData: FormData) {
  "use server";

  const admin = await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const { claimId, adminNote } = getOwnerClaimActionData(formData);

  if (!claimId) {
    redirect("/admin/zgloszenia-wlascicieli");
  }

  const claim = await prisma.lakeOwnerClaim.findUnique({
    where: {
      id: claimId,
    },
    include: {
      lake: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!claim) {
    redirect("/admin/zgloszenia-wlascicieli");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.lakeOwner.upsert({
      where: {
        lakeId_userId: {
          lakeId: claim.lakeId,
          userId: claim.userId,
        },
      },
      update: {
        userEmail: claim.userEmail,
        role: "owner",
        canEditLake: true,
        canManageReservations: true,
        canManageSpots: true,
        isActive: true,
      },
      create: {
        lakeId: claim.lakeId,
        userId: claim.userId,
        userEmail: claim.userEmail,
        role: "owner",
        canEditLake: true,
        canManageReservations: true,
        canManageSpots: true,
        isActive: true,
      },
    });

    await transaction.lakeOwnerClaim.update({
      where: {
        id: claim.id,
      },
      data: {
        status: "approved",
        adminNote: adminNote || null,
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
      },
    });

    await transaction.userNotification.create({
      data: {
        userId: claim.userId,
        title: "Profil łowiska został przypisany",
        message: `Twoje zgłoszenie przejęcia profilu łowiska ${claim.lake.name} zostało zatwierdzone.`,
        href: `/lowiska-w-polsce/${claim.lake.slug}`,
        type: "success",
      },
    });
  });

  revalidatePath("/admin/zgloszenia-wlascicieli");
  revalidatePath("/admin");
  redirect("/admin/zgloszenia-wlascicieli");
}

async function rejectOwnerClaim(formData: FormData) {
  "use server";

  const admin = await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const { claimId, adminNote } = getOwnerClaimActionData(formData);

  if (!claimId) {
    redirect("/admin/zgloszenia-wlascicieli");
  }

  const claim = await prisma.lakeOwnerClaim.findUnique({
    where: {
      id: claimId,
    },
    include: {
      lake: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!claim) {
    redirect("/admin/zgloszenia-wlascicieli");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.lakeOwnerClaim.update({
      where: {
        id: claim.id,
      },
      data: {
        status: "rejected",
        adminNote: adminNote || null,
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
      },
    });

    await transaction.userNotification.create({
      data: {
        userId: claim.userId,
        title: "Zgłoszenie przejęcia profilu odrzucone",
        message: `Twoje zgłoszenie przejęcia profilu łowiska ${claim.lake.name} zostało odrzucone.`,
        href: `/lowiska-w-polsce/${claim.lake.slug}`,
        type: "warning",
      },
    });
  });

  revalidatePath("/admin/zgloszenia-wlascicieli");
  revalidatePath("/admin");
  redirect("/admin/zgloszenia-wlascicieli");
}

function getOwnerClaimActionData(formData: FormData): OwnerClaimActionResult {
  return {
    claimId: String(formData.get("claimId") || "").trim(),
    adminNote: String(formData.get("adminNote") || "").trim(),
  };
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
      <p className="text-sm font-black uppercase tracking-[0.14em] opacity-70">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
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

function getStatusLabel(status: string) {
  if (status === "pending") {
    return "Oczekuje";
  }

  if (status === "approved") {
    return "Zatwierdzone";
  }

  if (status === "rejected") {
    return "Odrzucone";
  }

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

function getClaimRoleLabel(role?: string | null) {
  if (role === "owner") {
    return "Właściciel";
  }

  if (role === "manager") {
    return "Zarządca / administrator";
  }

  if (role === "employee") {
    return "Pracownik";
  }

  if (role === "association") {
    return "Przedstawiciel stowarzyszenia";
  }

  if (role === "other") {
    return "Inna osoba uprawniona";
  }

  return "Nie podano";
}