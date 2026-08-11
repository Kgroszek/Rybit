"use client";

import dynamic from "next/dynamic";

import type { LakeListDto } from "@/lib/lakes";

const DashboardMapExplorer = dynamic(
  () =>
    import("@/components/dashboard/DashboardMapExplorer").then(
      (module) => module.DashboardMapExplorer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white/70" />
        <div className="h-[520px] animate-pulse rounded-[26px] bg-slate-200" />
        <div className="h-9 animate-pulse rounded-xl bg-white/60" />
      </div>
    ),
  }
);

export function DashboardDesktopMap({
  lakes,
}: {
  lakes: LakeListDto[];
}) {
  return <DashboardMapExplorer lakes={lakes} />;
}
