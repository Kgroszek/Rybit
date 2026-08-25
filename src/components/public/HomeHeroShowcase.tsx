"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    label: "Mapa łowisk",
    title: "Znajdź łowisko dopasowane do Twojej wyprawy",
    description:
      "Przeglądaj łowiska w całej Polsce, korzystaj z mapy i filtrów oraz sprawdzaj najważniejsze informacje przed wyjazdem.",
    image: "/photos/dashboard.webp",
  },
  {
    label: "Centrum wypraw",
    title: "Zaplanuj całą wyprawę w jednym miejscu",
    description:
      "Uczestnicy, checklisty, sprzęt, koszty, plan i najważniejsze informacje o wyjeździe zawsze pod ręką.",
    image: "/photos/centrum-wypraw-nocka.webp",
  },
  {
    label: "Moje połowy",
    title: "Buduj swoją historię nad wodą",
    description:
      "Zapisuj zdjęcia, gatunki, wagę, długość, metodę i łowisko. Wracaj do rekordów i najlepszych wypraw.",
    image: "/photos/polowy.webp",
  },
  {
    label: "System rezerwacji",
    title: "Zarządzaj rezerwacjami swojego łowiska",
    description:
      "Stanowiska, terminy i blokady całego łowiska są widoczne w jednym czytelnym kalendarzu.",
    image: "/photos/kalendarz-rezerwacji.webp",
  },
  {
    label: "Strony łowisk",
    title: "Stwórz profesjonalną stronę swojego łowiska",
    description:
      "Edytuj sekcje, treści i zdjęcia, a następnie opublikuj stronę powiązaną z profilem łowiska w Rybio.",
    image: "/photos/strony-internetowe.webp",
  },
] as const;

export function HomeHeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-w-0">
      <div className="relative">
        <div className="pointer-events-none absolute -inset-8 rounded-[48px] bg-blue-500/10 blur-3xl sm:-inset-10" />

        <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_70px_-35px_rgba(15,23,42,0.3)] sm:rounded-[28px]">
          <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-white px-4 sm:h-12">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            </div>

            <span className="text-[10px] font-bold text-slate-400 sm:text-[11px]">
              rybio.pl
            </span>

            <span className="max-w-[110px] truncate text-right text-[9px] font-black uppercase tracking-[0.12em] text-blue-600 sm:max-w-none sm:text-[11px] sm:tracking-[0.14em]">
              {activeSlide.label}
            </span>
          </div>

          <div className="bg-slate-50 p-2 sm:p-3">
            <div className="aspect-[16/10] overflow-hidden rounded-[16px] border border-slate-200 bg-white sm:rounded-[18px]">
              <img
                key={activeSlide.image}
                src={activeSlide.image}
                alt={`${activeSlide.label} w Rybio`}
                className="block h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="border-t border-blue-100 bg-gradient-to-br from-white to-blue-50/70 px-5 py-5 sm:px-7 sm:py-6">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 sm:text-[11px]">
                {activeSlide.label}
              </p>
              <h3 className="mt-2 text-lg font-black leading-tight tracking-tight text-slate-950 sm:text-2xl">
                {activeSlide.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px] sm:leading-7">
                {activeSlide.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-2 sm:mt-5 md:overflow-visible md:pb-0">
        <div className="flex min-w-max gap-2 md:grid md:min-w-0 md:grid-cols-5">
          {slides.map((slide, index) => {
            const active = index === activeIndex;

            return (
              <button
                key={slide.label}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Pokaż: ${slide.label}`}
                aria-pressed={active}
                className={`w-[135px] shrink-0 rounded-2xl border px-3 py-3 transition md:w-auto md:min-w-0 ${
                  active
                    ? "border-blue-200 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`block truncate text-center text-[11px] font-black sm:text-xs ${
                    active ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  {slide.label}
                </span>
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className={`block h-full rounded-full bg-blue-600 transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
