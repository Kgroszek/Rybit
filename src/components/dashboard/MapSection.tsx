"use client";

import dynamic from "next/dynamic";

const InteractiveMap = dynamic(
  () =>
    import("@/components/dashboard/InteractiveMap").then(
      (mod) => mod.InteractiveMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Ładowanie mapy...
        </p>
      </div>
    ),
  }
);

export function MapSection() {
  return <InteractiveMap />;
}