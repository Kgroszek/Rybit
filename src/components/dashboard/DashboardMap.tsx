"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/Skeleton";
import type { LakeListDto } from "@/lib/lakes";

const DashboardMapExplorer =
  dynamic(
    () =>
      import(
        "@/components/dashboard/DashboardMapExplorer"
      ).then(
        (module) =>
          module.DashboardMapExplorer
      ),
    {
      ssr: false,
      loading: () => (
        <div className="space-y-3">
          <Skeleton className="h-[420px] w-full rounded-panel sm:h-[480px] lg:h-[520px]" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
      ),
    }
  );

export function DashboardMap({
  lakes,
}: {
  lakes: LakeListDto[];
}) {
  return (
    <DashboardMapExplorer
      lakes={lakes}
    />
  );
}
