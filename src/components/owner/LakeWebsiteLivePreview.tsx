"use client";

import { useEffect, useRef, useState } from "react";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";

type PreviewDevice = "desktop" | "mobile";

export function LakeWebsiteLivePreview({
  lakeSlug,
  data,
  rootDomain,
}: {
  lakeSlug: string;
  data: PublicLakeWebsiteData;
  rootDomain: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [availableWidth, setAvailableWidth] = useState(520);
  const [frameReady, setFrameReady] = useState(false);

  useEffect(() => {
    const element = stageRef.current;

    if (!element) {
      return;
    }

    const updateWidth = () => {
      setAvailableWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!frameReady) {
      return;
    }

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "rybio:lake-website-preview",
        data,
      },
      window.location.origin
    );
  }, [data, frameReady]);

  const sourceWidth = device === "desktop" ? 1280 : 390;
  const targetHeight = device === "desktop" ? 700 : 720;
  const horizontalPadding = 24;

  const scale = Math.min(
    1,
    Math.max(0.2, (availableWidth - horizontalPadding) / sourceWidth)
  );

  const iframeHeight = Math.round(targetHeight / scale);
  const displayWidth = Math.round(sourceWidth * scale);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Podgląd na żywo
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
              Live
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Zmiany są widoczne od razu, jeszcze przed zapisaniem.
          </p>
        </div>

        <div className="inline-flex self-start rounded-xl bg-slate-100 p-1">
          <DeviceButton
            active={device === "desktop"}
            onClick={() => setDevice("desktop")}
          >
            Desktop
          </DeviceButton>
          <DeviceButton
            active={device === "mobile"}
            onClick={() => setDevice("mobile")}
          >
            Mobile
          </DeviceButton>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          </div>

          <div className="min-w-0 flex-1 truncate rounded-lg bg-slate-50 px-3 py-1.5 text-center text-[11px] font-semibold text-slate-500">
            {data.website.subdomain}.{rootDomain}
          </div>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative h-[740px] overflow-hidden bg-slate-100 p-3"
      >
        <div
          className="relative mx-auto overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
          style={{
            width: displayWidth,
            height: targetHeight,
          }}
        >
          <iframe
            ref={iframeRef}
            title="Podgląd strony łowiska"
            src={`/moje-lowiska/${lakeSlug}/strona/podglad`}
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setFrameReady(true)}
            className="absolute left-0 top-0 border-0 bg-white"
            style={{
              width: sourceWidth,
              height: iframeHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>

        {!frameReady && (
          <div className="absolute inset-3 flex items-center justify-center rounded-2xl bg-white">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Ładowanie podglądu…
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DeviceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
        active
          ? "bg-white text-slate-950 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}