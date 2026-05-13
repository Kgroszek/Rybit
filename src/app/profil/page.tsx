import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [favourites, ratings, submissions] = await Promise.all([
    prisma.favourite.findMany({
      where: {
        userId: user.id,
      },
      include: {
        lake: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.rating.findMany({
      where: {
        userId: user.id,
      },
      include: {
        lake: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.lakeSubmission.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const displayName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "Wędkarz Rybit";

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Profil
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Zarządzaj swoim kontem, sprawdzaj ulubione łowiska, oceny oraz
            status zgłoszonych miejsc.
          </p>
        </div>

        <Link
          href="/ustawienia"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Edytuj profil
        </Link>
      </div>

      <section className="mb-6 grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-400 text-2xl font-bold text-white">
              {getInitials(displayName)}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {displayName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            <ProfileInfo label="ID użytkownika" value={user.id} />
            <ProfileInfo
              label="Data utworzenia"
              value={formatDate(user.created_at)}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <ProfileStat
            label="Ulubione łowiska"
            value={String(favourites.length)}
          />

          <ProfileStat label="Wystawione oceny" value={String(ratings.length)} />

          <ProfileStat
            label="Zgłoszenia łowisk"
            value={String(submissions.length)}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Ulubione łowiska
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Łowiska zapisane przez Ciebie do ulubionych.
              </p>
            </div>

            <Link
              href="/lowiska"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Przeglądaj
            </Link>
          </div>

          {favourites.length > 0 ? (
            <div className="space-y-3">
              {favourites.map((favourite) => (
                <Link
                  key={favourite.id}
                  href={`/lowiska/${favourite.lake.slug}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      {favourite.lake.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {favourite.lake.fish}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                    ★ {favourite.lake.rating.toFixed(1)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Brak ulubionych łowisk"
              description="Dodaj łowisko do ulubionych, aby pojawiło się tutaj."
            />
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Moje oceny</h2>

            <p className="mt-1 text-sm text-slate-500">
              Łowiska, które zostały przez Ciebie ocenione.
            </p>
          </div>

          {ratings.length > 0 ? (
            <div className="space-y-3">
              {ratings.map((rating) => (
                <Link
                  key={rating.id}
                  href={`/lowiska/${rating.lake.slug}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      {rating.lake.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Oceniono: {formatDate(rating.updatedAt)}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-600">
                    ★ {rating.value}/5
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Brak ocen"
              description="Oceń pierwsze łowisko, aby zobaczyć je na tej liście."
            />
          )}
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Moje zgłoszenia łowisk
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sprawdź, czy Twoje zgłoszenia zostały zaakceptowane przez
              administratora.
            </p>
          </div>

          <Link
            href="/lowiska/zglos"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Zgłoś łowisko
          </Link>
        </div>

        {submissions.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-[1fr_160px_160px_140px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:grid">
              <span>Łowisko</span>
              <span>Rodzaj</span>
              <span>Status</span>
              <span>Data</span>
            </div>

            <div className="divide-y divide-slate-100">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_160px_160px_140px] md:items-center"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      {submission.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {submission.city}, woj. {submission.voivodeship}
                    </p>

                    {submission.adminNote && (
                      <p className="mt-2 text-sm font-medium text-red-500">
                        Powód: {submission.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-slate-600">
                    {submission.ownerType === "commercial"
                      ? "Komercyjne"
                      : "PZW"}
                  </div>

                  <div>
                    <StatusBadge status={submission.status} />
                  </div>

                  <div className="text-sm text-slate-500">
                    {formatDate(submission.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Brak zgłoszeń"
            description="Nie masz jeszcze żadnych zgłoszeń łowisk."
          />
        )}
      </section>
    </DashboardLayout>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Zaakceptowane
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Odrzucone
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      Oczekuje
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "R";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}