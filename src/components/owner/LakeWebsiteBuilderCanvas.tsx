"use client";

import { useEffect, useRef, useState } from "react";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";

export type LakeWebsiteBuilderDevice = "desktop" | "mobile";

export function LakeWebsiteBuilderCanvas({
  lakeSlug,
  data,
  selectedSectionId,
  device,
  onSelectSection,
}: {
  lakeSlug: string;
  data: PublicLakeWebsiteData;
  selectedSectionId: string | null;
  device: LakeWebsiteBuilderDevice;
  onSelectSection: (sectionId: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      const payload = event.data as
        | {
            type?: string;
            sectionId?: string | null;
          }
        | null;

      if (
        payload?.type === "rybio:lake-builder-section-click" &&
        payload.sectionId
      ) {
        onSelectSection(payload.sectionId);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onSelectSection]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "rybio:lake-builder-data",
        data,
        selectedSectionId,
      },
      window.location.origin
    );
  }, [data, ready, selectedSectionId]);

  return (
    <div className="relative h-full min-w-0 overflow-hidden bg-[#dfe3e8]">
      <div
        className={`mx-auto h-full bg-white shadow-2xl transition-[width] duration-200 ${
          device === "mobile"
            ? "w-[390px] max-w-full"
            : "w-full"
        }`}
      >
        <iframe
          ref={iframeRef}
          title="Edytowana strona łowiska"
          src={`/moje-lowiska/${lakeSlug}/strona/podglad`}
          onLoad={() => setReady(true)}
          className="h-full w-full border-0 bg-white"
        />
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Ładowanie strony…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
