"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { LakeDto } from "@/lib/lakes";

const MapSection = dynamic(
  () =>
    import("@/components/dashboard/MapSection").then(
      (module) => module.MapSection
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] rounded-3xl border border-slate-200 bg-slate-100 shadow-sm" />
    ),
  }
);

type DashboardDesktopMapProps = {
  lakes: LakeDto[];
};

export function DashboardDesktopMap({ lakes }: DashboardDesktopMapProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function updateIsDesktop() {
      setIsDesktop(mediaQuery.matches);
    }

    updateIsDesktop();

    mediaQuery.addEventListener("change", updateIsDesktop);

    return () => {
      mediaQuery.removeEventListener("change", updateIsDesktop);
    };
  }, []);

  if (!isDesktop) {
    return null;
  }

  return <MapSection lakes={lakes} />;
}