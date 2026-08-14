import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardDesktopMap } from "@/components/dashboard/DashboardDesktopMap";
import { DashboardLocationInitializer } from "@/components/dashboard/DashboardLocationInitializer";
import { NearestLakes } from "@/components/dashboard/NearestLakes";
import { RecentCatches } from "@/components/dashboard/RecentCatches";
import { RecommendedLakes } from "@/components/dashboard/RecommendedLakes";

import { getLakesDashboard } from "@/lib/lakes";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { MarkerIcon } from "@/components/icons/MarkerIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { AlertIcon } from "@/components/icons/AlertIcon";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { CheckListIcon } from "@/components/icons/CheckListIcon";
import { BackpackIcon } from "@/components/icons/BackpackIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { MapIcon } from "@/components/icons/MapIcon";
import { HookIcon } from "@/components/icons/HookIcon";

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
        status: {
          in: ["finished", "completed"],
        },
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
          notIn: ["cancelled", "canceled"],
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
        status: {
          in: ["finished", "completed"],
        },
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
        !["finished", "completed"].includes(trip.status) &&
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
      <DashboardMotionStyles />

      <div className="pb-8">
        
        <section
          className="dashboard-reveal relative overflow-hidden rounded-[34px] border border-blue-100 bg-gradient-to-br from-[#eef5ff] via-white to-[#eefbf8] p-5 sm:p-6 lg:p-7"
          style={motionDelay(70)}
        >
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-[32%] h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />

          <div className="relative">
          <SectionHeading
            eyebrow="Odkryj łowiska"
            title="Znajdź miejsce na kolejny wyjazd"
            description="Przeglądaj łowiska, zawężaj wyniki według rodzaju i typu łowiska oraz sprawdzaj miejsca najbliżej Twojej lokalizacji."
          />

          <div className="mt-4 hidden gap-6 lg:grid xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="dashboard-map-shell min-w-0">
              <DashboardDesktopMap lakes={lakes} />
            </div>

            <aside className="dashboard-side-fade flex min-h-0 flex-col pt-[96px] pb-[52px]">
              <NearestLakes lakes={lakes} limit={5} fullHeight />
            </aside>
          </div>

          <div className="mt-4 space-y-4 lg:hidden">
            <NearestLakes lakes={lakes} limit={4} />

            <div className="dashboard-map-cta rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 hover:border-blue-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">
                    Mapa łowisk
                  </p>

                  <h3 className="mt-2 text-xl font-extrabold text-slate-950">
                    Zobacz łowiska na mapie
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Otwórz pełną mapę, aby przeglądać łowiska, korzystać
                    z filtrów i sprawdzać szczegóły miejsc.
                  </p>
                </div>

                <div className="dashboard-map-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MapIcon />
                </div>
              </div>

              <Link
                href="/lowiska?view=map"
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
              >
                Otwórz mapę łowisk
              </Link>
            </div>
          </div>
          </div>
        </section>

        <div
          className="dashboard-reveal mt-7"
          style={motionDelay(140)}
        >
          <PriorityCard card={priorityCard} />
        </div>

        <section
          className="dashboard-reveal relative mt-7 overflow-hidden rounded-[34px] bg-[#988FF7] p-5 text-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.7)] sm:p-6 lg:p-7"
          style={motionDelay(210)}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="min-w-0">
              <DarkSectionHeading
                eyebrow="Na dziś"
                title="Rzeczy, które wymagają Twojej uwagi"
                description="Najważniejsze zadania związane z wyprawami, checklistą i sprzętem."
              />

              {todayTasks.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  {todayTasks.map(({ key, ...task }, index) => (
                    <div
                      key={key}
                      className="dashboard-stagger"
                      style={motionDelay(250 + index * 70)}
                    >
                      <TodayTaskCard {...task} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/50 text-emerald-700">
                    <CheckIcon />
                  </div>

                  <div>
                    <p className="font-extrabold text-white">Wszystko gotowe</p>
                    <p className="mt-1 text-sm leading-6 text-white">
                      Nie masz teraz żadnych pilnych rzeczy do zrobienia w Rybio.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-7 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
              <DarkSectionHeading
                eyebrow="Szybkie akcje"
                title="Przejdź od razu"
                description="Najczęściej używane funkcje zawsze pod ręką."
              />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <QuickActionCard
                  href="/wyprawy"
                  label="Zaplanuj wyprawę"
                  description="Termin i przygotowanie"
                  icon={<BackpackIcon className="h-5 w-5 text-stale-500 transition-colors"/>}
                  dark
                />

                <QuickActionCard
                  href={quickCatchHref}
                  label="Szybki połów"
                  description={
                    activeTrip
                      ? "Dodaj do trwającej wyprawy"
                      : "Zapisz rybę w dzienniku"
                  }
                  icon={<FishIcon className="h-5 w-5 text-stale-500 transition-colors rotate-310 -scale-x-100"/>}
                  emphasized={Boolean(activeTrip)}
                  dark
                />

                <QuickActionCard
                  href="/lowiska?view=map"
                  label="Znajdź łowisko"
                  description="Mapa i baza miejsc"
                  icon={<MapIcon className="h-5 w-5 text-stale-500 transition-colors"/>}
                  dark
                />

                <QuickActionCard
                  href="/ekwipunek"
                  label="Mój ekwipunek"
                  description="Sprzęt i przygotowanie"
                  icon={<HookIcon className="h-5 w-5 text-stale-500 transition-colors"/>}
                  dark
                />
              </div>
            </div>
          </div>
        </section>

        {shouldShowSecondaryTrip && (
          <div
            className="dashboard-reveal mt-7"
            style={motionDelay(350)}
          >
          <UpcomingTripCard
            trip={upcomingTrip}
            preparation={getPreparationSummary(upcomingTrip)}
            now={now}
          />
          </div>
        )}

        <section
          className="dashboard-reveal mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"
          style={motionDelay(420)}
        >
          <div className="min-w-0">
            <RecentCatches catches={serializedRecentCatches} />
          </div>

          <section className="relative h-full overflow-hidden rounded-[30px] bg-[#988FF7] p-5 text-white shadow-[0_22px_60px_-42px_rgba(15,23,42,0.75)] sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="relative">
            <DarkSectionHeading
              eyebrow="Twoje Rybio"
              title="Krótko o Twojej aktywności"
              description="Podsumowanie Twoich połowów, wypraw i zapisanych łowisk."
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
            </div>
          </section>
        </section>

        <section
          className="dashboard-reveal relative mt-10 overflow-hidden rounded-[34px] p-5 sm:p-6 lg:p-7"
          style={motionDelay(490)}
        >
         

          <div className="relative">
            <RecommendedLakes lakes={lakes} />
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
      className={`group relative overflow-hidden rounded-[2rem] border p-5 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl sm:p-7 lg:p-8 ${tone.wrapper}`}
    >
      <div className={`dashboard-float-slow absolute -right-20 -top-24 h-64 w-64 rounded-full ${tone.blob}`} />
      <div className={`dashboard-float-reverse absolute -bottom-32 right-36 h-56 w-56 rounded-full ${tone.blobSecondary}`} />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-4xl">
          <p className={`text-xs font-medium uppercase tracking-[0.2em] ${tone.eyebrow}`}>
            {card.eyebrow}
          </p>

          <h2 className={`mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl ${tone.title}`}>
            {card.title}
          </h2>

          <p className={`mt-3 max-w-3xl text-sm leading-7 sm:text-base ${tone.description}`}>
            {card.description}
          </p>

          {card.trip && (
            <div className="mt-5 flex flex-wrap gap-2">
              {card.trip.lakeName && (
                <MetaPill>
                  <MarkerIcon
                    className="
                      h-5 w-5
                      text-stale-500
                      transition-colors
                     
                    "
                  />
                  {card.trip.lakeName}
                </MetaPill>
                
              )}

              <MetaPill>
                <CalendarIcon
                    className="
                      h-5 w-5
                      text-stale-500
                      transition-colors
                     
                    "
                  />
                {formatTripDateRange(card.trip.startsAt, card.trip.endsAt)}
              </MetaPill>

              <MetaPill>
                <UsersIcon
                    className="
                      h-5 w-5
                      text-stale-500
                      transition-colors
                     
                    "
                  />
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
            className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold shadow-sm transition duration-300 hover:-translate-y-0.5 ${tone.primaryButton}`}
          >
            {card.cta}
          </Link>

          {card.secondaryHref && card.secondaryCta && (
            <Link
              href={card.secondaryHref}
              className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold transition duration-300 hover:-translate-y-0.5 ${tone.secondaryButton}`}
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
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Przygotowanie
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {preparation.percent}% gotowe
          </p>
        </div>

        <span className="text-2xl font-bold text-blue-700">
          {preparation.percent}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="dashboard-progress h-full rounded-full bg-blue-600"
          style={
            {
              "--dashboard-progress": `${preparation.percent}%`,
            } as CSSProperties
          }
        />
      </div>

      {preparation.messages.length > 0 ? (
        <div className="mt-4 space-y-2">
          {preparation.messages.slice(0, 2).map((message) => (
            <div
              key={message}
              className="flex items-start gap-2 text-xs font-bold leading-5 text-amber-700"
            >
              <AlertIcon className="h-5 w-5 text-stale-500 transition-colors"
                  />
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
      className="group flex min-h-[150px] flex-col rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-white shadow-none backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.11]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/30 text-[#4A25EB] transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105 group-hover:bg-[#4A25EB] group-hover:text-white">
          {icon}
        </div>

        {badge && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-4 font-extrabold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-white">{description}</p>

      <span className="mt-auto pt-4 text-xs font-extrabold text-[#4A25EB] flex items-center gap-1">
        Przejdź 
        <ArrowSmallRightIcon className="h-4 w-4 text-stale-500 transition-colors" />
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
  dark = false,
}: {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  emphasized?: boolean;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-5 ${
        emphasized
          ? "border-blue-500 bg-blue-600 text-white shadow-md hover:-translate-y-1 hover:bg-blue-500 hover:shadow-lg"
          : dark
            ? "border-white/10 bg-white/[0.06] text-white shadow-none hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.1]"
            : "border-slate-200 bg-white text-slate-950 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
          emphasized
            ? "bg-white/15 text-white"
            : dark
              ? "bg-white/30 text-[#4A25EB] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 group-hover:bg-[#4A25EB] group-hover:text-white"
              : "bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 group-hover:bg-blue-600 group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-extrabold sm:text-base">{label}</p>

      <p
        className={`mt-1 text-xs leading-5 ${
          emphasized
            ? "text-blue-100"
            : dark
              ? "text-slate-400"
              : "text-slate-500"
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
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">
            Najbliższa wyprawa
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
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
               <CalendarIcon
                    className="
                      h-5 w-5
                      text-stale-500
                      transition-colors
                     
                    "
                  />
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
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
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
  dark = true,
}: {
  label: string;
  value: string;
  href?: string;
  dark?: boolean;
}) {
  const content = (
    <>
      <p
        className={`text-xs font-extrabold uppercase tracking-[0.14em] ${
          dark ? "text-white" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-extrabold tracking-tight ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 ${
          dark
            ? "border border-white/10 bg-white/[0.06] hover:bg-white/[0.1]"
            : "bg-slate-50 hover:bg-blue-50"
        }`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 ${
        dark ? "border border-white/10 bg-white/[0.06]" : "bg-slate-50"
      }`}
    >
      {content}
    </div>
  );
}

function SmallProgress({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

function DarkSectionHeading({
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
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#4A25EB]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-1 max-w-2xl text-sm leading-6 text-white">
          {description}
        </p>
      )}
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
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm backdrop-blur">
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
        icon: <CheckListIcon className="h-4 w-4 text-stale-500 transition-colors" />,
        title: "Utwórz checklistę",
        description: "Nie masz jeszcze listy rzeczy na tę wyprawę.",
      });
    } else if (preparation.checklistRemaining > 0) {
      tasks.push({
        key: "checklist",
        href: `/wyprawy/${preparationTrip.id}?tab=checklista`,
        icon: <CheckListIcon className="h-4 w-4 text-stale-500 transition-colors" />,
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
        icon: <BackpackIcon className="h-5 w-5 text-stale-500 transition-colors"/>,
        title: "Dodaj sprzęt do wyprawy",
        description: "Powiąż przygotowanie z Twoim Ekwipunkiem.",
      });
    } else if (preparation.gearRemaining > 0) {
      tasks.push({
        key: "gear",
        href: `/wyprawy/${preparationTrip.id}?tab=sprzet`,
        icon: <BackpackIcon className="h-5 w-5 text-stale-500 transition-colors"/>,
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
      icon: <CalendarIcon
                    className="
                      h-5 w-5
                      text-stale-500
                      transition-colors
                     
                    "
                  />,
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
  if (
    ["finished", "completed", "cancelled", "canceled"].includes(trip.status)
  ) {
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


function motionDelay(delay: number): CSSProperties {
  return {
    animationDelay: `${delay}ms`,
  };
}

function DashboardMotionStyles() {
  return (
    <style>{`
      @keyframes dashboardReveal {
        0% {
          opacity: 0;
          transform: translateY(18px);
          filter: blur(4px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }

      @keyframes dashboardFloatSlow {
        0%, 100% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(-8px, 10px, 0);
        }
      }

      @keyframes dashboardFloatReverse {
        0%, 100% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(10px, -8px, 0);
        }
      }

      @keyframes dashboardProgress {
        from {
          width: 0%;
        }
        to {
          width: var(--dashboard-progress);
        }
      }

      @keyframes dashboardMapIcon {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-4px);
        }
      }

      .dashboard-reveal {
        opacity: 0;
        animation: dashboardReveal 650ms cubic-bezier(.22,.85,.31,1) forwards;
      }

      .dashboard-float-slow {
        animation: dashboardFloatSlow 9s ease-in-out infinite;
      }

      .dashboard-float-reverse {
        animation: dashboardFloatReverse 11s ease-in-out infinite;
      }

      .dashboard-progress {
        width: 0%;
        animation: dashboardProgress 950ms cubic-bezier(.22,.85,.31,1) 280ms forwards;
      }

      .dashboard-map-icon {
        animation: dashboardMapIcon 3.8s ease-in-out infinite;
      }

      .dashboard-map-shell,
      .dashboard-map-shell:hover {
        transform: none;
      }

      .dashboard-side-fade {
        animation: dashboardReveal 700ms cubic-bezier(.22,.85,.31,1) 180ms both;
      }

      .dashboard-stagger {
        opacity: 0;
        animation: dashboardReveal 560ms cubic-bezier(.22,.85,.31,1) forwards;
      }

      @media (prefers-reduced-motion: reduce) {
        .dashboard-reveal,
        .dashboard-float-slow,
        .dashboard-float-reverse,
        .dashboard-progress,
        .dashboard-map-icon,
        .dashboard-side-fade,
        .dashboard-stagger {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
        }

        .dashboard-progress {
          width: var(--dashboard-progress);
        }
      }
    `}</style>
  );
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



function MapPinIcon() {
  return (
    <IconBase>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
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
