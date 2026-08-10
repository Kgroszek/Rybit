import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardDesktopMap } from "@/components/dashboard/DashboardDesktopMap";
import { DashboardLocationInitializer } from "@/components/dashboard/DashboardLocationInitializer";
import { NearestLakes } from "@/components/dashboard/NearestLakes";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { RecommendedLakes } from "@/components/dashboard/RecommendedLakes";
import { WeatherCard } from "@/components/dashboard/WeatherCard";

import { getLakesDashboard } from "@/lib/lakes";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type DashboardTrip = {
  id: string;
  userId: string;
  title: string;
  lakeName: string | null;
  startsAt: Date;
  endsAt: Date | null;
  tripType: string;
  status: string;
  checklist: {
    items: {
      isPacked: boolean;
      isImportant: boolean;
    }[];
  } | null;
  gearItems: {
    isPacked: boolean;
    isRequired: boolean;
  }[];
  members: {
    id: string;
  }[];
};

type PreparationSummary = {
  percent: number;
  checklistTotal: number;
  checklistPacked: number;
  checklistRemaining: number;
  importantChecklistRemaining: number;
  gearTotal: number;
  gearPacked: number;
  gearRemaining: number;
  requiredGearRemaining: number;
  messages: string[];
};

type PriorityCardData = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryCta?: string;
  tone: "blue" | "emerald" | "amber" | "violet" | "slate";
  trip?: DashboardTrip | null;
  preparation?: PreparationSummary | null;
};

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  const fourteenDaysAgo = addDays(now, -14);

  const tripAccessWhere = {
    OR: [
      {
        userId: user.id,
      },
      {
        members: {
          some: {
            userId: user.id,
            status: "accepted",
          },
        },
      },
    ],
  };

  const [
    lakes,
    catchesCount,
    savedLakesCount,
    completedTripsCount,
    catchesForSpecies,
    recentCatches,
    pendingInvitation,
    tripCandidates,
    recentFinishedTrip,
  ] = await Promise.all([
    getLakesDashboard(),

    prisma.fishingCatch.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.favourite.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.fishingTrip.count({
      where: {
        userId: user.id,
        status: "finished",
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
      },
      select: {
        fishName: true,
      },
    }),

    prisma.fishingCatch.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        caughtAt: "desc",
      },
      take: 3,
      select: {
        id: true,
        fishName: true,
        weight: true,
        length: true,
        method: true,
        bait: true,
        lakeName: true,
        tripTitle: true,
        caughtAt: true,
      },
    }),

    prisma.tripMember.findFirst({
      where: {
        userId: user.id,
        status: "pending",
        trip: {
          status: {
            not: "cancelled",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userName: true,
        role: true,
        createdAt: true,
        trip: {
          select: {
            id: true,
            title: true,
            lakeName: true,
            startsAt: true,
            endsAt: true,
            tripType: true,
          },
        },
      },
    }),

    prisma.fishingTrip.findMany({
      where: {
        ...tripAccessWhere,
        status: {
          not: "cancelled",
        },
        startsAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        startsAt: "asc",
      },
      take: 30,
      select: {
        id: true,
        userId: true,
        title: true,
        lakeName: true,
        startsAt: true,
        endsAt: true,
        tripType: true,
        status: true,
        checklist: {
          select: {
            items: {
              select: {
                isPacked: true,
                isImportant: true,
              },
            },
          },
        },
        gearItems: {
          select: {
            isPacked: true,
            isRequired: true,
          },
        },
        members: {
          where: {
            status: "accepted",
          },
          select: {
            id: true,
          },
        },
      },
    }),

    prisma.fishingTrip.findFirst({
      where: {
        userId: user.id,
        status: "finished",
        summary: null,
        OR: [
          {
            completedAt: {
              gte: fourteenDaysAgo,
            },
          },
          {
            endsAt: {
              gte: fourteenDaysAgo,
              lt: now,
            },
          },
        ],
      },
      orderBy: [
        {
          completedAt: "desc",
        },
        {
          startsAt: "desc",
        },
      ],
      select: {
        id: true,
        title: true,
        lakeName: true,
        startsAt: true,
        endsAt: true,
        _count: {
          select: {
            catches: true,
            media: true,
            costs: true,
          },
        },
      },
    }),
  ]);

  const uniqueSpeciesCount = new Set(
    catchesForSpecies.map((item) => item.fishName)
  ).size;

  const activeTrip =
    tripCandidates.find((trip) => isTripActive(trip, now)) ?? null;

  const upcomingTrip =
    tripCandidates.find(
      (trip) =>
        trip.status !== "finished" &&
        new Date(trip.startsAt).getTime() > now.getTime()
    ) ?? null;

  const focusTrip = activeTrip ?? upcomingTrip;
  const preparation = focusTrip ? getPreparationSummary(focusTrip) : null;

  const displayName = getUserDisplayName(user);
  const firstName = displayName.split(" ")[0] || "Wędkarzu";

  const priorityCard = getPriorityCard({
    pendingInvitation,
    activeTrip,
    upcomingTrip,
    recentFinishedTrip,
    preparation,
    catchesCount,
    savedLakesCount,
    completedTripsCount,
    now,
  });

  const todayTasks = buildTodayTasks({
    pendingInvitation,
    activeTrip,
    upcomingTrip,
    recentFinishedTrip,
    preparation,
    now,
  }).slice(0, 3);

  const quickCatchHref = activeTrip
    ? `/polowy?tripId=${activeTrip.id}`
    : "/polowy";

  const serializedRecentCatches = JSON.parse(JSON.stringify(recentCatches));

  const shouldShowSecondaryTrip =
    upcomingTrip &&
    priorityCard.trip?.id !== upcomingTrip.id &&
    priorityCard.eyebrow !== "NAJBLIŻSZA WYPRAWA";

  return (
    <DashboardLayout>
      <DashboardLocationInitializer />

      <div className="space-y-6 pb-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400">
              {formatDashboardDate(now)}
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Cześć, {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Najważniejsze informacje i kolejne kroki związane z Twoimi
              wyprawami masz w jednym miejscu.
            </p>
          </div>
        </header>

        <PriorityCard card={priorityCard} />

        <section>
          <SectionHeading
            eyebrow="Na dziś"
            title="Rzeczy, które wymagają Twojej uwagi"
            description="Pokazujemy tylko najważniejsze działania, zamiast kolejnej listy statystyk."
          />

          {todayTasks.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {todayTasks.map(({ key, ...task }) => (
                <TodayTaskCard key={key} {...task} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                <CheckIcon />
              </div>

              <div>
                <p className="font-black text-emerald-950">Wszystko gotowe</p>
                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  Nie masz teraz żadnych pilnych rzeczy do zrobienia w Rybio.
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          <SectionHeading
            eyebrow="Szybkie akcje"
            title="Najczęściej używane funkcje"
          />

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickActionCard
              href="/wyprawy"
              label="Zaplanuj wyprawę"
              description="Termin, łowisko i przygotowanie"
              icon={<TripIcon />}
            />

            <QuickActionCard
              href={quickCatchHref}
              label="Szybki połów"
              description={
                activeTrip
                  ? "Dodaj połów do trwającej wyprawy"
                  : "Zapisz rybę w dzienniku"
              }
              icon={<FishIcon />}
              emphasized={Boolean(activeTrip)}
            />

            <QuickActionCard
              href="/lowiska?view=map"
              label="Znajdź łowisko"
              description="Otwórz bazę i mapę łowisk"
              icon={<MapIcon />}
            />

            <QuickActionCard
              href="/ekwipunek"
              label="Mój ekwipunek"
              description="Sprawdź i uporządkuj sprzęt"
              icon={<BackpackIcon />}
            />
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Odkryj łowiska"
            title="Znajdź miejsce na kolejny wyjazd"
            description="Mapa i najbliższe łowiska są wysoko, bo znalezienie miejsca na ryby jest jednym z głównych powodów korzystania z Rybio."
          />

          <div className="mt-4 hidden gap-6 lg:grid xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <DashboardDesktopMap lakes={lakes} />
            </div>

            <aside>
              <NearestLakes lakes={lakes} />
            </aside>
          </div>

          <div className="mt-4 space-y-4 lg:hidden">
            <NearestLakes lakes={lakes} />

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    Mapa łowisk
                  </p>

                  <h3 className="mt-2 text-xl font-black text-slate-950">
                    Zobacz łowiska na mapie
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Na telefonie pełna mapa działa jako osobny widok, żeby nie
                    przejmowała przewijania dashboardu.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MapIcon />
                </div>
              </div>

              <Link
                href="/lowiska?view=map"
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Otwórz mapę łowisk
              </Link>
            </div>
          </div>
        </section>

        {shouldShowSecondaryTrip && (
          <UpcomingTripCard
            trip={upcomingTrip}
            preparation={getPreparationSummary(upcomingTrip)}
            now={now}
          />
        )}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Dziennik"
                title="Ostatnie połowy"
                description="Najnowsze wpisy z Twojej historii nad wodą."
              />

              <Link
                href="/polowy"
                className="hidden shrink-0 text-sm font-black text-blue-600 transition hover:text-blue-700 sm:block"
              >
                Zobacz wszystkie →
              </Link>
            </div>

            <RecentCatches catches={serializedRecentCatches} />
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              eyebrow="Twoje Rybio"
              title="Krótko o Twojej aktywności"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat
                label="Połowy"
                value={String(catchesCount)}
                href="/polowy"
              />
              <MiniStat label="Gatunki" value={String(uniqueSpeciesCount)} />
              <MiniStat
                label="Wyprawy"
                value={String(completedTripsCount)}
                href="/wyprawy"
              />
              <MiniStat
                label="Ulubione"
                value={String(savedLakesCount)}
                href="/lowiska"
              />
            </div>
          </section>
        </section>

        <section>
          <SectionHeading
            eyebrow="Inspiracje"
            title="Polecane miejsca i warunki"
            description="To już warstwa eksploracyjna — przydatna, ale mniej pilna niż aktualne zadania i szybkie znalezienie łowiska."
          />

          <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <RecommendedLakes lakes={lakes} />
            </div>

            <aside>
              <WeatherCard />
            </aside>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}

function PriorityCard({ card }: { card: PriorityCardData }) {
  const tone = getPriorityTone(card.tone);

  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-sm sm:p-7 lg:p-8 ${tone.wrapper}`}
    >
      <div className={`absolute -right-20 -top-24 h-64 w-64 rounded-full ${tone.blob}`} />
      <div className={`absolute -bottom-32 right-36 h-56 w-56 rounded-full ${tone.blobSecondary}`} />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-4xl">
          <p className={`text-xs font-black uppercase tracking-[0.2em] ${tone.eyebrow}`}>
            {card.eyebrow}
          </p>

          <h2 className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${tone.title}`}>
            {card.title}
          </h2>

          <p className={`mt-3 max-w-3xl text-sm leading-7 sm:text-base ${tone.description}`}>
            {card.description}
          </p>

          {card.trip && (
            <div className="mt-5 flex flex-wrap gap-2">
              {card.trip.lakeName && (
                <MetaPill>
                  <MapPinIcon />
                  {card.trip.lakeName}
                </MetaPill>
              )}

              <MetaPill>
                <CalendarIcon />
                {formatTripDateRange(card.trip.startsAt, card.trip.endsAt)}
              </MetaPill>

              <MetaPill>
                <UsersIcon />
                {card.trip.members.length + 1} os.
              </MetaPill>
            </div>
          )}

          {card.preparation && (
            <PreparationBlock preparation={card.preparation} />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            href={card.href}
            className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-black shadow-sm transition ${tone.primaryButton}`}
          >
            {card.cta}
          </Link>

          {card.secondaryHref && card.secondaryCta && (
            <Link
              href={card.secondaryHref}
              className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-black transition ${tone.secondaryButton}`}
            >
              {card.secondaryCta}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function PreparationBlock({
  preparation,
}: {
  preparation: PreparationSummary;
}) {
  return (
    <div className="mt-6 max-w-2xl rounded-2xl bg-white/75 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Przygotowanie
          </p>
          <p className="mt-1 text-sm font-black text-slate-800">
            {preparation.percent}% gotowe
          </p>
        </div>

        <span className="text-2xl font-black text-blue-700">
          {preparation.percent}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${preparation.percent}%` }}
        />
      </div>

      {preparation.messages.length > 0 ? (
        <div className="mt-4 space-y-2">
          {preparation.messages.slice(0, 2).map((message) => (
            <div
              key={message}
              className="flex items-start gap-2 text-xs font-bold leading-5 text-amber-700"
            >
              <AlertIcon />
              <span>{message}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700">
          <CheckIcon />
          Wszystko, co zostało dodane do przygotowania, jest gotowe.
        </div>
      )}
    </div>
  );
}

function TodayTaskCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[150px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
          {icon}
        </div>

        {badge && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-4 font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>

      <span className="mt-auto pt-4 text-xs font-black text-blue-600">
        Przejdź →
      </span>
    </Link>
  );
}

function QuickActionCard({
  href,
  label,
  description,
  icon,
  emphasized = false,
}: {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  emphasized?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border p-4 transition sm:p-5 ${
        emphasized
          ? "border-blue-200 bg-blue-600 text-white shadow-md hover:bg-blue-700"
          : "border-slate-200 bg-white text-slate-950 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
          emphasized
            ? "bg-white/15 text-white"
            : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-black sm:text-base">{label}</p>

      <p
        className={`mt-1 text-xs leading-5 ${
          emphasized ? "text-blue-100" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </Link>
  );
}

function UpcomingTripCard({
  trip,
  preparation,
  now,
}: {
  trip: DashboardTrip;
  preparation: PreparationSummary;
  now: Date;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Najbliższa wyprawa
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {trip.title}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {trip.lakeName && (
              <MetaPill>
                <MapPinIcon />
                {trip.lakeName}
              </MetaPill>
            )}

            <MetaPill>
              <CalendarIcon />
              {formatTripDateRange(trip.startsAt, trip.endsAt)}
            </MetaPill>

            <MetaPill>{formatTimeUntilTrip(trip.startsAt, now)}</MetaPill>
          </div>

          <div className="mt-5 grid max-w-xl gap-2 sm:grid-cols-2">
            <SmallProgress
              label="Checklista"
              value={
                preparation.checklistTotal > 0
                  ? `${preparation.checklistPacked}/${preparation.checklistTotal}`
                  : "Brak"
              }
            />
            <SmallProgress
              label="Sprzęt"
              value={
                preparation.gearTotal > 0
                  ? `${preparation.gearPacked}/${preparation.gearTotal}`
                  : "Brak"
              }
            />
          </div>
        </div>

        <Link
          href={`/wyprawy/${trip.id}`}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          Otwórz wyprawę
        </Link>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-2xl bg-slate-50 p-4">{content}</div>;
}

function SmallProgress({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function getPriorityCard({
  pendingInvitation,
  activeTrip,
  upcomingTrip,
  recentFinishedTrip,
  preparation,
  catchesCount,
  savedLakesCount,
  completedTripsCount,
  now,
}: {
  pendingInvitation: {
    id: string;
    userName: string;
    role: string;
    createdAt: Date;
    trip: {
      id: string;
      title: string;
      lakeName: string | null;
      startsAt: Date;
      endsAt: Date | null;
      tripType: string;
    };
  } | null;
  activeTrip: DashboardTrip | null;
  upcomingTrip: DashboardTrip | null;
  recentFinishedTrip: {
    id: string;
    title: string;
    lakeName: string | null;
    startsAt: Date;
    endsAt: Date | null;
    _count: {
      catches: number;
      media: number;
      costs: number;
    };
  } | null;
  preparation: PreparationSummary | null;
  catchesCount: number;
  savedLakesCount: number;
  completedTripsCount: number;
  now: Date;
}): PriorityCardData {
  if (pendingInvitation) {
    return {
      eyebrow: "WYMAGA ODPOWIEDZI",
      title: `Masz zaproszenie do wyprawy „${pendingInvitation.trip.title}”`,
      description: pendingInvitation.trip.lakeName
        ? `Wyprawa odbędzie się na ${pendingInvitation.trip.lakeName}. Odpowiedz na zaproszenie, zanim zaczniesz planować wspólne przygotowania.`
        : "Odpowiedz na zaproszenie, zanim zaczniesz planować wspólne przygotowania.",
      href: "/wyprawy",
      cta: "Odpowiedz na zaproszenie",
      secondaryHref: `/wyprawy/${pendingInvitation.trip.id}`,
      secondaryCta: "Zobacz szczegóły",
      tone: "violet",
    };
  }

  if (activeTrip) {
    return {
      eyebrow: "WYPRAWA TRWA",
      title: activeTrip.title,
      description:
        "Jesteś w trakcie wyprawy. Najszybszą akcją jest teraz zapisanie połowu — wyprawa i łowisko zostaną przypisane automatycznie.",
      href: `/polowy?tripId=${activeTrip.id}`,
      cta: "⚡ Dodaj szybki połów",
      secondaryHref: `/wyprawy/${activeTrip.id}`,
      secondaryCta: "Otwórz wyprawę",
      tone: "emerald",
      trip: activeTrip,
      preparation: preparation,
    };
  }

  if (upcomingTrip) {
    const hoursUntil = getHoursUntil(upcomingTrip.startsAt, now);

    if (hoursUntil <= 36) {
      return {
        eyebrow: hoursUntil <= 12 ? "WYJAZD DZISIAJ" : "WYJAZD JUŻ JUTRO",
        title: upcomingTrip.title,
        description:
          preparation && preparation.messages.length > 0
            ? preparation.messages[0]
            : "Wyprawa jest już blisko. Sprawdź ostatni raz checklistę i sprzęt przed wyjazdem.",
        href: `/wyprawy/${upcomingTrip.id}?tab=checklista`,
        cta:
          preparation?.checklistRemaining ||
          preparation?.gearRemaining ||
          preparation?.checklistTotal === 0 ||
          preparation?.gearTotal === 0
            ? "Dokończ przygotowania"
            : "Sprawdź wyprawę",
        secondaryHref: `/wyprawy/${upcomingTrip.id}`,
        secondaryCta: "Szczegóły wyprawy",
        tone: "amber",
        trip: upcomingTrip,
        preparation,
      };
    }

    const daysUntil = Math.ceil(hoursUntil / 24);

    if (
      daysUntil <= 7 &&
      preparation &&
      preparation.messages.length > 0
    ) {
      const primaryHref =
        preparation.checklistTotal === 0 ||
        preparation.checklistRemaining > 0
          ? `/wyprawy/${upcomingTrip.id}?tab=checklista`
          : `/wyprawy/${upcomingTrip.id}?tab=sprzet`;

      return {
        eyebrow: "NASTĘPNY KROK",
        title: `Przygotuj się do „${upcomingTrip.title}”`,
        description: preparation.messages[0],
        href: primaryHref,
        cta: "Dokończ przygotowania",
        secondaryHref: `/wyprawy/${upcomingTrip.id}`,
        secondaryCta: "Zobacz wyprawę",
        tone: "blue",
        trip: upcomingTrip,
        preparation,
      };
    }
  }

  if (recentFinishedTrip) {
    const extras = [
      recentFinishedTrip._count.catches > 0
        ? `${recentFinishedTrip._count.catches} połowów`
        : null,
      recentFinishedTrip._count.media > 0
        ? `${recentFinishedTrip._count.media} zdjęć`
        : null,
      recentFinishedTrip._count.costs > 0
        ? `${recentFinishedTrip._count.costs} kosztów`
        : null,
    ]
      .filter(Boolean)
      .join(" • ");

    return {
      eyebrow: "PO WYPRAWIE",
      title: `Podsumuj „${recentFinishedTrip.title}”`,
      description: extras
        ? `Wyprawa jest zakończona. Masz już zapisane: ${extras}. Uzupełnij podsumowanie, zanim zaczniesz planować kolejny wyjazd.`
        : "Wyprawa jest zakończona. Dodaj podsumowanie i uzupełnij brakujące informacje z wyjazdu.",
      href: `/wyprawy/${recentFinishedTrip.id}?tab=podsumowanie`,
      cta: "Podsumuj wyprawę",
      secondaryHref: "/wyprawy",
      secondaryCta: "Wszystkie wyprawy",
      tone: "slate",
    };
  }

  if (upcomingTrip) {
    return {
      eyebrow: "NAJBLIŻSZA WYPRAWA",
      title: upcomingTrip.title,
      description: `${formatTimeUntilTrip(
        upcomingTrip.startsAt,
        now
      )}. Wszystkie informacje i przygotowanie masz dostępne w Centrum wypraw.`,
      href: `/wyprawy/${upcomingTrip.id}`,
      cta: "Otwórz wyprawę",
      secondaryHref: "/lowiska?view=map",
      secondaryCta: "Przeglądaj łowiska",
      tone: "blue",
      trip: upcomingTrip,
      preparation,
    };
  }

  const isNewUser =
    catchesCount === 0 &&
    savedLakesCount === 0 &&
    completedTripsCount === 0;

  if (isNewUser) {
    return {
      eyebrow: "ZACZNIJ Z RYBIO",
      title: "Zaplanuj swoją pierwszą wyprawę",
      description:
        "Wybierz łowisko, ustaw termin, przygotuj checklistę i sprzęt. Rybio poprowadzi Cię przez przygotowania krok po kroku.",
      href: "/wyprawy",
      cta: "Zaplanuj pierwszą wyprawę",
      secondaryHref: "/lowiska?view=map",
      secondaryCta: "Najpierw znajdź łowisko",
      tone: "blue",
    };
  }

  return {
    eyebrow: "CO TERAZ?",
    title: "Czas zaplanować kolejny wyjazd nad wodę",
    description:
      "Nie masz obecnie zaplanowanej wyprawy. Możesz od razu utworzyć nowy plan albo najpierw znaleźć odpowiednie łowisko.",
    href: "/wyprawy",
    cta: "Zaplanuj wyprawę",
    secondaryHref: "/lowiska?view=map",
    secondaryCta: "Znajdź łowisko",
    tone: "blue",
  };
}

function buildTodayTasks({
  pendingInvitation,
  activeTrip,
  upcomingTrip,
  recentFinishedTrip,
  preparation,
  now,
}: {
  pendingInvitation: {
    id: string;
    trip: {
      id: string;
      title: string;
    };
  } | null;
  activeTrip: DashboardTrip | null;
  upcomingTrip: DashboardTrip | null;
  recentFinishedTrip: {
    id: string;
    title: string;
  } | null;
  preparation: PreparationSummary | null;
  now: Date;
}) {
  const tasks: Array<{
    key: string;
    href: string;
    icon: ReactNode;
    title: string;
    description: string;
    badge?: string;
  }> = [];

  if (pendingInvitation) {
    tasks.push({
      key: "invitation",
      href: "/wyprawy",
      icon: <UsersIcon />,
      title: "Odpowiedz na zaproszenie",
      description: pendingInvitation.trip.title,
      badge: "Nowe",
    });
  }

  if (activeTrip) {
    tasks.push({
      key: "active-catch",
      href: `/polowy?tripId=${activeTrip.id}`,
      icon: <FishIcon />,
      title: "Dodaj szybki połów",
      description: `Wyprawa „${activeTrip.title}” właśnie trwa.`,
      badge: "Teraz",
    });
  }

  const preparationTrip = activeTrip ?? upcomingTrip;

  if (preparationTrip && preparation) {
    if (preparation.checklistTotal === 0) {
      tasks.push({
        key: "checklist-empty",
        href: `/wyprawy/${preparationTrip.id}?tab=checklista`,
        icon: <ChecklistIcon />,
        title: "Utwórz checklistę",
        description: "Nie masz jeszcze listy rzeczy na tę wyprawę.",
      });
    } else if (preparation.checklistRemaining > 0) {
      tasks.push({
        key: "checklist",
        href: `/wyprawy/${preparationTrip.id}?tab=checklista`,
        icon: <ChecklistIcon />,
        title: `${preparation.checklistRemaining} ${
          preparation.checklistRemaining === 1 ? "rzecz" : "rzeczy"
        } do spakowania`,
        description: preparationTrip.title,
        badge:
          preparation.importantChecklistRemaining > 0
            ? `${preparation.importantChecklistRemaining} ważne`
            : undefined,
      });
    }

    if (preparation.gearTotal === 0) {
      tasks.push({
        key: "gear-empty",
        href: `/wyprawy/${preparationTrip.id}?tab=sprzet`,
        icon: <BackpackIcon />,
        title: "Dodaj sprzęt do wyprawy",
        description: "Powiąż przygotowanie z Twoim Ekwipunkiem.",
      });
    } else if (preparation.gearRemaining > 0) {
      tasks.push({
        key: "gear",
        href: `/wyprawy/${preparationTrip.id}?tab=sprzet`,
        icon: <BackpackIcon />,
        title: `${preparation.gearRemaining} ${
          preparation.gearRemaining === 1 ? "element" : "elementy"
        } sprzętu czekają`,
        description: preparationTrip.title,
        badge:
          preparation.requiredGearRemaining > 0
            ? `${preparation.requiredGearRemaining} wymagane`
            : undefined,
      });
    }
  }

  if (
    upcomingTrip &&
    getHoursUntil(upcomingTrip.startsAt, now) <= 36
  ) {
    tasks.push({
      key: "departure",
      href: `/wyprawy/${upcomingTrip.id}`,
      icon: <CalendarIcon />,
      title:
        getHoursUntil(upcomingTrip.startsAt, now) <= 12
          ? "Wyprawa rozpoczyna się dzisiaj"
          : "Wyprawa rozpoczyna się jutro",
      description: upcomingTrip.title,
      badge: "Blisko",
    });
  }

  if (recentFinishedTrip) {
    tasks.push({
      key: "summary",
      href: `/wyprawy/${recentFinishedTrip.id}?tab=podsumowanie`,
      icon: <CheckIcon />,
      title: "Podsumuj ostatnią wyprawę",
      description: recentFinishedTrip.title,
    });
  }

  return tasks;
}

function getPreparationSummary(trip: DashboardTrip): PreparationSummary {
  const checklistItems = trip.checklist?.items ?? [];
  const gearItems = trip.gearItems ?? [];

  const checklistTotal = checklistItems.length;
  const checklistPacked = checklistItems.filter((item) => item.isPacked).length;
  const checklistRemaining = Math.max(
    0,
    checklistTotal - checklistPacked
  );
  const importantChecklistRemaining = checklistItems.filter(
    (item) => item.isImportant && !item.isPacked
  ).length;

  const gearTotal = gearItems.length;
  const gearPacked = gearItems.filter((item) => item.isPacked).length;
  const gearRemaining = Math.max(0, gearTotal - gearPacked);
  const requiredGearRemaining = gearItems.filter(
    (item) => item.isRequired && !item.isPacked
  ).length;

  const dimensions = [100];

  if (checklistTotal > 0) {
    dimensions.push(
      Math.round((checklistPacked / checklistTotal) * 100)
    );
  }

  if (gearTotal > 0) {
    dimensions.push(Math.round((gearPacked / gearTotal) * 100));
  }

  const percent = Math.round(
    dimensions.reduce((sum, value) => sum + value, 0) / dimensions.length
  );

  const messages: string[] = [];

  if (checklistTotal === 0) {
    messages.push("Nie utworzono jeszcze checklisty dla tej wyprawy.");
  } else if (importantChecklistRemaining > 0) {
    messages.push(
      `${importantChecklistRemaining} ${
        importantChecklistRemaining === 1
          ? "ważna rzecz nie jest spakowana"
          : "ważne rzeczy nie są spakowane"
      }.`
    );
  } else if (checklistRemaining > 0) {
    messages.push(
      `${checklistRemaining} ${
        checklistRemaining === 1
          ? "rzecz została jeszcze do spakowania"
          : "rzeczy zostały jeszcze do spakowania"
      }.`
    );
  }

  if (gearTotal === 0) {
    messages.push("Nie przypisano jeszcze sprzętu do wyprawy.");
  } else if (requiredGearRemaining > 0) {
    messages.push(
      `${requiredGearRemaining} ${
        requiredGearRemaining === 1
          ? "wymagany element sprzętu nie jest gotowy"
          : "wymagane elementy sprzętu nie są gotowe"
      }.`
    );
  } else if (gearRemaining > 0) {
    messages.push(
      `${gearRemaining} ${
        gearRemaining === 1
          ? "element sprzętu czeka na spakowanie"
          : "elementy sprzętu czekają na spakowanie"
      }.`
    );
  }

  return {
    percent,
    checklistTotal,
    checklistPacked,
    checklistRemaining,
    importantChecklistRemaining,
    gearTotal,
    gearPacked,
    gearRemaining,
    requiredGearRemaining,
    messages,
  };
}

function isTripActive(trip: DashboardTrip, now: Date) {
  if (trip.status === "finished" || trip.status === "cancelled") {
    return false;
  }

  const startsAt = new Date(trip.startsAt).getTime();

  if (startsAt > now.getTime()) {
    return false;
  }

  const endsAt = trip.endsAt
    ? new Date(trip.endsAt).getTime()
    : startsAt + 24 * 60 * 60 * 1000;

  return now.getTime() <= endsAt;
}

function getTripEnd(start: Date, end: Date | null) {
  return end ?? new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000);
}

function getHoursUntil(date: Date, now: Date) {
  return Math.max(
    0,
    Math.ceil(
      (new Date(date).getTime() - now.getTime()) / (60 * 60 * 1000)
    )
  );
}

function formatTimeUntilTrip(date: Date, now: Date) {
  const hours = getHoursUntil(date, now);

  if (hours <= 1) {
    return "Za mniej niż godzinę";
  }

  if (hours < 24) {
    return `Za ${hours} godz.`;
  }

  const days = Math.ceil(hours / 24);

  if (days === 1) {
    return "Jutro";
  }

  return `Za ${days} dni`;
}

function formatTripDateRange(start: Date, end: Date | null) {
  const startDate = new Date(start);
  const endDate = getTripEnd(startDate, end);

  const startLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  }).format(startDate);

  const endLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  }).format(endDate);

  return startLabel === endLabel
    ? startLabel
    : `${startLabel} – ${endLabel}`;
}

function formatDashboardDate(date: Date) {
  const formatted = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getPriorityTone(tone: PriorityCardData["tone"]) {
  const tones = {
    blue: {
      wrapper:
        "border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50",
      blob: "bg-blue-200/30",
      blobSecondary: "bg-sky-200/25",
      eyebrow: "text-blue-600",
      title: "text-slate-950",
      description: "text-slate-600",
      primaryButton: "bg-blue-600 text-white hover:bg-blue-700",
      secondaryButton:
        "border border-blue-100 bg-white/80 text-blue-700 hover:bg-white",
    },
    emerald: {
      wrapper:
        "border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50",
      blob: "bg-emerald-200/35",
      blobSecondary: "bg-teal-200/25",
      eyebrow: "text-emerald-600",
      title: "text-slate-950",
      description: "text-slate-600",
      primaryButton: "bg-emerald-600 text-white hover:bg-emerald-700",
      secondaryButton:
        "border border-emerald-100 bg-white/80 text-emerald-700 hover:bg-white",
    },
    amber: {
      wrapper:
        "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50",
      blob: "bg-amber-200/35",
      blobSecondary: "bg-orange-200/25",
      eyebrow: "text-amber-600",
      title: "text-slate-950",
      description: "text-slate-600",
      primaryButton: "bg-amber-500 text-white hover:bg-amber-600",
      secondaryButton:
        "border border-amber-100 bg-white/80 text-amber-700 hover:bg-white",
    },
    violet: {
      wrapper:
        "border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50",
      blob: "bg-violet-200/35",
      blobSecondary: "bg-blue-200/25",
      eyebrow: "text-violet-600",
      title: "text-slate-950",
      description: "text-slate-600",
      primaryButton: "bg-violet-600 text-white hover:bg-violet-700",
      secondaryButton:
        "border border-violet-100 bg-white/80 text-violet-700 hover:bg-white",
    },
    slate: {
      wrapper:
        "border-slate-200 bg-gradient-to-br from-slate-100 via-white to-blue-50",
      blob: "bg-slate-300/25",
      blobSecondary: "bg-blue-200/20",
      eyebrow: "text-slate-500",
      title: "text-slate-950",
      description: "text-slate-600",
      primaryButton: "bg-slate-950 text-white hover:bg-slate-800",
      secondaryButton:
        "border border-slate-200 bg-white/80 text-slate-700 hover:bg-white",
    },
  };

  return tones[tone];
}

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: {
    name?: unknown;
    full_name?: unknown;
    display_name?: unknown;
  };
}) {
  if (typeof user.user_metadata?.name === "string") {
    return user.user_metadata.name;
  }

  if (typeof user.user_metadata?.full_name === "string") {
    return user.user_metadata.full_name;
  }

  if (typeof user.user_metadata?.display_name === "string") {
    return user.user_metadata.display_name;
  }

  return "Wędkarzu";
}

function IconBase({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function MapIcon() {
  return (
    <IconBase>
      <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </IconBase>
  );
}

function MapPinIcon() {
  return (
    <IconBase>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}

function TripIcon() {
  return (
    <IconBase>
      <path d="M8 7V6a4 4 0 0 1 8 0v1" />
      <rect x="5" y="7" width="14" height="14" rx="3" />
      <path d="M8 13h8" />
      <path d="M9 17h6" />
    </IconBase>
  );
}

function FishIcon() {
  return (
    <IconBase>
      <path d="M16.5 12c0 3-3.5 5.5-7.5 5.5S2 12 2 12s3-5.5 7-5.5 7.5 2.5 7.5 5.5Z" />
      <path d="M16.5 12 22 8v8l-5.5-4Z" />
      <circle cx="7.5" cy="11" r="0.7" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function BackpackIcon() {
  return (
    <IconBase>
      <path d="M8 7V6a4 4 0 0 1 8 0v1" />
      <rect x="5" y="7" width="14" height="14" rx="3" />
      <path d="M8 13h8" />
      <path d="M9 17h6" />
    </IconBase>
  );
}

function ChecklistIcon() {
  return (
    <IconBase>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="m4 6 1 1 2-2" />
      <path d="m4 12 1 1 2-2" />
      <path d="m4 18 1 1 2-2" />
    </IconBase>
  );
}

function CalendarIcon() {
  return (
    <IconBase>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
    </IconBase>
  );
}

function UsersIcon() {
  return (
    <IconBase>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

function AlertIcon() {
  return (
    <IconBase>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </IconBase>
  );
}

function CheckIcon() {
  return (
    <IconBase>
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}
