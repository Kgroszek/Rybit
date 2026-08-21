"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import type { WebsiteBuilderDevice } from "@/components/owner/website/types";
import { cn } from "@/lib/cn";

export type LakeWebsiteBuilderDevice =
  WebsiteBuilderDevice;

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
  onSelectSection: (
    sectionId: string
  ) => void;
}) {
  const iframeRef =
    useRef<HTMLIFrameElement>(null);

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    function handleMessage(
      event: MessageEvent
    ) {
      if (
        event.origin !==
        window.location.origin
      ) {
        return;
      }

      const payload = event.data as
        | {
            type?: string;
            sectionId?: string | null;
          }
        | null;

      if (
        payload?.type ===
          "rybio:lake-builder-section-click" &&
        payload.sectionId
      ) {
        onSelectSection(
          payload.sectionId
        );
      }
    }

    window.addEventListener(
      "message",
      handleMessage
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );
    };
  }, [onSelectSection]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    iframeRef.current?.contentWindow?.postMessage(
      {
        type:
          "rybio:lake-builder-data",
        data,
        selectedSectionId,
      },
      window.location.origin
    );
  }, [
    data,
    ready,
    selectedSectionId,
  ]);

  return (
    <div className="relative h-full min-w-0 overflow-hidden bg-surface-strong">
      <div className="h-full overflow-auto p-4 xl:p-6">
        <div
          className={cn(
            "mx-auto h-full overflow-hidden bg-surface shadow-float transition-[width,border-radius,border-width] duration-200",
            device === "mobile"
              ? "w-[390px] max-w-full rounded-[28px] border-[10px] border-navy-950"
              : "w-full max-w-[1500px] rounded-card border border-border"
          )}
        >
          <iframe
            ref={iframeRef}
            title="Edytowana strona łowiska"
            src={`/moje-lowiska/${lakeSlug}/strona/podglad`}
            onLoad={() =>
              setReady(true)
            }
            className="h-full w-full border-0 bg-surface"
          />
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-strong">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-primary" />

            <p className="mt-3 text-sm font-bold text-text-secondary">
              Ładowanie podglądu…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
