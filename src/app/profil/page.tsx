import { Suspense, cache } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileAchievementsCard } from "@/components/dashboard/ProfileAchievementsCard";
import { ProfileFishRecordsCard } from "@/components/dashboard/ProfileFishRecordsCard";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getUserAchievements } from "@/lib/achievements";
import { getUserFishRecords } from "@/lib/fish-records";
import {
  getUserRankingBadges,
  type UserRankingBadge,
} from "@/lib/ranking-badges";

const getProfileHeavyData = cache(async (userId: string) => {
  const [achievements, rankingBadges, fishRecords] = await Promise.all([
    getUserAchievements(userId),
    getUserRankingBadges(userId),
    getUserFishRecords(userId),
  ]);

  return {
    achievements,
    rankingBadges,
    fishRecords,
  };
});

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    favourites,
    favouritesCount,
    ratings,
    ratingsCount,
    submissions,
    submissionsCount,
    catchesCount,
    publicCatchesCount,
  ] = await Promise.all([
    prisma.favourite.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        lake: {
          select: {
            name: true,
            slug: true,
            fish: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.favourite.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.rating.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        value: true,
        updatedAt: true,
        lake: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    }),

    prisma.rating.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.lakeSubmission.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        city: true,
        voivodeship: true,
        ownerType: true,
        status: true,
        adminNote: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),

    prisma.lakeSubmission.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.fishingCatch.count({
      where: {
        userId: user.id,
        isPublic: true,
        rankingStatus: "approved",
      },
    }),
  ]);

  const displayName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.display_name === "string"
          ? user.user_metadata.display_name
          : "Wędkarz Rybit";

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Profil
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Zarządzaj swoim kontem, sprawdzaj ulubione łowiska, oceny,
            zgłoszenia, rekordy, odznaki i zdobyte osiągnięcia.
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

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-950">
                {displayName}
              </h2>

              <p className="mt-1 truncate text-sm text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            <ProfileInfo
              label="Data utworzenia"
              value={formatDate(user.created_at)}
            />
          </div>

          {/* <Link
            href={`/wedkarze/${user.id}`}
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Zobacz publiczny profil
          </Link> */}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <ProfileStat
            label="Ulubione łowiska"
            value={String(favouritesCount)}
          />

          <ProfileStat label="Oceny" value={String(ratingsCount)} />

          <ProfileStat label="Połowy" value={String(catchesCount)} />

          <Suspense
            fallback={
              <>
                <ProfileStat label="Rekordy gatunków" value="..." />
                <ProfileStat label="Osiągnięcia" value="..." />
                <ProfileStat label="Odznaki TOP" value="..." />
              </>
            }
          >
            <ProfileHeavyStats userId={user.id} />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<SectionSkeleton title="Odznaki rankingowe" />}>
        <RankingBadgesLoader userId={user.id} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Rekordy gatunków" />}>
        <FishRecordsLoader userId={user.id} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton title="Osiągnięcia" />}>
        <AchievementsLoader userId={user.id} />
      </Suspense>

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ProfileStat label="Wszystkie połowy" value={String(catchesCount)} />

        <ProfileStat
          label="Publiczne połowy"
          value={String(publicCatchesCount)}
        />

        <ProfileStat
          label="Zgłoszenia łowisk"
          value={String(submissionsCount)}
        />

        <ProfileStat label="Ulubione" value={String(favouritesCount)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Ulubione łowiska
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ostatnio zapisane przez Ciebie łowiska.
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
                    ★ {Number(favourite.lake.rating).toFixed(1)}
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
              Ostatnio ocenione przez Ciebie łowiska.
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
              Sprawdź ostatnie zgłoszenia dodane przez Twoje konto.
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
                      {submission.city}, {submission.voivodeship}
                    </p>

                    {submission.adminNote && (
                      <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        {submission.adminNote}
                      </p>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-600">
                    {getOwnerTypeLabel(submission.ownerType)}
                  </p>

                  <StatusBadge status={submission.status} />

                  <p className="text-sm text-slate-500">
                    {formatDate(submission.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Brak zgłoszeń łowisk"
            description="Zgłoszone przez Ciebie łowiska pojawią się w tym miejscu."
          />
        )}
      </section>
    </DashboardLayout>
  );
}

async function ProfileHeavyStats({ userId }: { userId: string }) {
  const { achievements, rankingBadges, fishRecords } =
    await getProfileHeavyData(userId);

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.isUnlocked
  );

  return (
    <>
      <ProfileStat
        label="Rekordy gatunków"
        value={String(fishRecords.length)}
      />

      <ProfileStat
        label="Osiągnięcia"
        value={`${unlockedAchievements.length}/${achievements.length}`}
      />

      <ProfileStat label="Odznaki TOP" value={String(rankingBadges.length)} />
    </>
  );
}

async function RankingBadgesLoader({ userId }: { userId: string }) {
  const { rankingBadges } = await getProfileHeavyData(userId);

  return <RankingBadgesSection badges={rankingBadges} />;
}

async function FishRecordsLoader({ userId }: { userId: string }) {
  const { fishRecords } = await getProfileHeavyData(userId);

  return <ProfileFishRecordsCard records={fishRecords} />;
}

async function AchievementsLoader({ userId }: { userId: string }) {
  const { achievements } = await getProfileHeavyData(userId);

  return <ProfileAchievementsCard achievements={achievements} />;
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xl font-bold text-slate-950">{title}</p>
            <div className="mt-3 h-4 w-64 rounded-full bg-slate-100" />
          </div>

          <div className="h-7 w-24 rounded-full bg-slate-100" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-28 rounded-3xl bg-slate-100" />
          <div className="h-28 rounded-3xl bg-slate-100" />
          <div className="h-28 rounded-3xl bg-slate-100" />
        </div>
      </div>
    </section>
  );
}

function RankingBadgesSection({ badges }: { badges: UserRankingBadge[] }) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Odznaki rankingowe
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Dynamiczne odznaki za miejsca TOP 1, TOP 2 i TOP 3 w rankingach
            łowisk.
          </p>
        </div>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
          {badges.length} odznak
        </span>
      </div>

      {badges.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {badges.map((badge) => (
            <RankingBadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Brak odznak rankingowych"
          description="Odznaki pojawią się tutaj, gdy trafisz do TOP 3 rankingu najcięższych lub najdłuższych ryb na łowisku."
        />
      )}
    </section>
  );
}

function RankingBadgeCard({ badge }: { badge: UserRankingBadge }) {
  const styles = getRankingBadgeStyles(badge.place);

  return (
    <article className={`rounded-3xl border p-5 shadow-sm ${styles.card}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm ${styles.icon}`}
        >
          {styles.medal}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${styles.badge}`}
            >
              TOP {badge.place}
            </span>

            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-600">
              {badge.type === "weight" ? "Waga" : "Długość"}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-black text-slate-950">
            {badge.type === "weight" ? "Najcięższa ryba" : "Najdłuższa ryba"}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {badge.fishName} —{" "}
            <span className="font-black text-slate-950">
              {badge.unit === "kg"
                ? `${badge.value.toFixed(2)} kg`
                : `${badge.value.toFixed(0)} cm`}
            </span>
          </p>

          <Link
            href={`/lowiska/${badge.lakeSlug}`}
            className="mt-3 inline-flex text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            {badge.lakeName}
          </Link>
        </div>
      </div>
    </article>
  );
}

function getRankingBadgeStyles(place: 1 | 2 | 3) {
  if (place === 1) {
    return {
      medal: "🥇",
      card: "border-amber-100 bg-amber-50",
      icon: "bg-white text-amber-700",
      badge: "bg-amber-200 text-amber-800",
    };
  }

  if (place === 2) {
    return {
      medal: "🥈",
      card: "border-slate-200 bg-slate-50",
      icon: "bg-white text-slate-700",
      badge: "bg-slate-200 text-slate-700",
    };
  }

  return {
    medal: "🥉",
    card: "border-orange-100 bg-orange-50",
    icon: "bg-white text-orange-700",
    badge: "bg-orange-200 text-orange-800",
  };
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

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
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
    <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved" || status === "accepted") {
    return (
      <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Zaakceptowane
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Odrzucone
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        Oczekuje
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {status}
    </span>
  );
}

function getOwnerTypeLabel(type: string | null) {
  if (type === "commercial") return "Komercyjne";
  if (type === "pzw") return "PZW";
  return "Inne";
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "WR";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}