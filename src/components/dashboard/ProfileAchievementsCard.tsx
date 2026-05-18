"use client";

import { useMemo, useState } from "react";
import type { UserAchievementView } from "@/lib/achievements";

type TabType = "all" | "unlocked" | "locked";

type ProfileAchievementsCardProps = {
  achievements: UserAchievementView[];
};

const INITIAL_VISIBLE_COUNT = 8;

export function ProfileAchievementsCard({
  achievements,
}: ProfileAchievementsCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showAll, setShowAll] = useState(false);

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.isUnlocked
  );

  const lockedAchievements = achievements.filter(
    (achievement) => !achievement.isUnlocked
  );

  const filteredAchievements = useMemo(() => {
    if (activeTab === "unlocked") {
      return unlockedAchievements;
    }

    if (activeTab === "locked") {
      return lockedAchievements;
    }

    return achievements;
  }, [activeTab, achievements, unlockedAchievements, lockedAchievements]);

  const visibleAchievements = showAll
    ? filteredAchievements
    : filteredAchievements.slice(0, INITIAL_VISIBLE_COUNT);

  const hiddenAchievementsCount =
    filteredAchievements.length - visibleAchievements.length;

  const groupedAchievements = useMemo(() => {
    return visibleAchievements.reduce<Record<string, UserAchievementView[]>>(
      (groups, achievement) => {
        if (!groups[achievement.category]) {
          groups[achievement.category] = [];
        }

        groups[achievement.category].push(achievement);

        return groups;
      },
      {}
    );
  }, [visibleAchievements]);

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    setShowAll(false);
  }

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Moje osiągnięcia
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Zdobywaj odznaki za połowy, rekordy, wyprawy, ekwipunek i aktywność
            w aplikacji.
          </p>
        </div>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
          {unlockedAchievements.length} / {achievements.length} odblokowanych
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1">
        <TabButton
          label={`Wszystkie (${achievements.length})`}
          isActive={activeTab === "all"}
          onClick={() => handleTabChange("all")}
        />

        <TabButton
          label={`Odblokowane (${unlockedAchievements.length})`}
          isActive={activeTab === "unlocked"}
          onClick={() => handleTabChange("unlocked")}
        />

        <TabButton
          label={`Do zdobycia (${lockedAchievements.length})`}
          isActive={activeTab === "locked"}
          onClick={() => handleTabChange("locked")}
        />
      </div>

      {filteredAchievements.length > 0 ? (
        <>
          <div className="mt-6 space-y-8">
            {Object.entries(groupedAchievements).map(([category, items]) => (
              <div key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                    {category}
                  </h3>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {items.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredAchievements.length > INITIAL_VISIBLE_COUNT && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-3xl bg-slate-50 p-5 sm:flex-row sm:justify-between">
              <p className="text-sm font-semibold text-slate-500">
                {showAll
                  ? `Wyświetlasz wszystkie osiągnięcia z tej zakładki.`
                  : `Ukryto jeszcze ${hiddenAchievementsCount} osiągnięć.`}
              </p>

              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {showAll ? "Pokaż mniej" : "Pokaż wszystkie"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center">
          <p className="text-lg font-bold text-slate-950">
            Brak osiągnięć w tej zakładce
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Zmień zakładkę albo wykonaj aktywność w aplikacji.
          </p>
        </div>
      )}
    </section>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        isActive
          ? "bg-white text-blue-600 shadow-sm"
          : "text-slate-500 hover:text-slate-950"
      }`}
    >
      {label}
    </button>
  );
}

function AchievementCard({
  achievement,
}: {
  achievement: UserAchievementView;
}) {
  return (
    <article
      className={`rounded-3xl border p-5 shadow-sm transition ${
        achievement.isUnlocked
          ? "border-amber-100 bg-amber-50"
          : "border-slate-200 bg-slate-50 opacity-70"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ${
            achievement.isUnlocked ? "" : "grayscale"
          }`}
        >
          {achievement.icon || "🏆"}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black text-slate-950">{achievement.title}</h4>

            {!achievement.isUnlocked && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                Zablokowane
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {achievement.description}
          </p>

          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">
              Odblokowano: {formatDate(achievement.unlockedAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}