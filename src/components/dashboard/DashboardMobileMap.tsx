"use client";

import dynamic from "next/dynamic";

import type { LakeDto, LakeListDto } from "@/lib/lakes";

const InteractiveMap = dynamic(
  () =>
    import("@/components/dashboard/InteractiveMap").then(
      (mod) => mod.InteractiveMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm sm:h-[480px]">
        <p className="text-sm font-semibold text-slate-500">
          Ładowanie mapy...
        </p>
      </div>
    ),
  }
);

type DashboardMobileMapProps = {
  lakes: LakeListDto[];
};

export function DashboardMobileMap({
  lakes,
}: DashboardMobileMapProps) {
  return (
    <div
      className="
        lg:hidden
        [&>div]:!h-[420px]
        sm:[&>div]:!h-[480px]
      "
    >
      <InteractiveMap
        lakes={lakes as unknown as LakeDto[]}
      />
    </div>
  );
}