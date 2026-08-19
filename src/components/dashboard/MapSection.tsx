"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { useUserLocation } from "@/hooks/useUserLocation";
import type {
  LakeDto,
  LakeListDto,
  LakeListQuery,
} from "@/lib/lakes";

const InteractiveMap = dynamic(
  () =>
    import("@/components/dashboard/InteractiveMap").then(
      (mod) => mod.InteractiveMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm sm:h-[520px]">
        <p className="text-sm font-semibold text-slate-500">
          Ładowanie mapy...
        </p>
      </div>
    ),
  }
);

type MapSectionProps = {
  /*
   * LakesPage przekazuje tutaj aktualną stronę wyników (np. 15 łowisk).
   * Używamy jej tylko jako szybkiego stanu początkowego.
   * Następnie pobieramy wszystkie wyniki odpowiadające filtrom.
   */
  lakes: LakeListDto[] | LakeDto[];
};

type MapLakesResponse = {
  lakes: LakeListDto[];
  totalCount: number;
};

function getMapQueryFromUrl(
  userLocation: { lat: number; lng: number } | null
): LakeListQuery {
  const params = new URLSearchParams(window.location.search);

  const amenities = (params.get("amenities") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    search: params.get("q")?.trim() ?? "",
    ownerType: params.get("owner") ?? "all",
    fishingType: params.get("fishing") ?? "all",
    voivodeship: params.get("voivodeship") ?? "all",
    fish: params.get("fish") ?? "all",
    amenities,
    sort: params.get("sort") ?? "rating",
    userLat: userLocation?.lat ?? null,
    userLng: userLocation?.lng ?? null,
  };
}

export function MapSection({ lakes }: MapSectionProps) {
  const { userLocation } = useUserLocation();

  const [mapLakes, setMapLakes] = useState<LakeListDto[]>(
    lakes as LakeListDto[]
  );
  const [isLoadingAllLakes, setIsLoadingAllLakes] = useState(true);
  const [mapError, setMapError] = useState("");

  const requestId = useRef(0);

  /*
   * Gdy filtry w LakesPage się zmieniają, zmienia się również zestaw
   * aktualnej strony wyników. Ten klucz uruchamia ponowne pobranie
   * pełnego zestawu pinezek.
   */
  const currentPageKey = useMemo(
    () => lakes.map((lake) => lake.id).join("|"),
    [lakes]
  );

  useEffect(() => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;

    const controller = new AbortController();

    async function loadAllMapLakes() {
      setIsLoadingAllLakes(true);
      setMapError("");

      try {
        const response = await fetch("/api/lakes/map", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getMapQueryFromUrl(userLocation)),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => null)) as
          | MapLakesResponse
          | { message?: string }
          | null;

        if (!response.ok || !data || !("lakes" in data)) {
          throw new Error(
            data && "message" in data && data.message
              ? data.message
              : "Nie udało się pobrać wszystkich łowisk na mapę."
          );
        }

        if (requestId.current !== currentRequestId) {
          return;
        }

        setMapLakes(data.lakes);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setMapError(
          error instanceof Error
            ? error.message
            : "Nie udało się pobrać wszystkich łowisk na mapę."
        );

        /*
         * Jeżeli dodatkowe pobranie się nie uda, mapa nadal działa
         * na wynikach aktualnej strony zamiast znikać całkowicie.
         */
        setMapLakes(lakes as LakeListDto[]);
      } finally {
        if (
          !controller.signal.aborted &&
          requestId.current === currentRequestId
        ) {
          setIsLoadingAllLakes(false);
        }
      }
    }

    void loadAllMapLakes();

    return () => {
      controller.abort();
    };
  }, [
    currentPageKey,
    lakes,
    userLocation?.lat,
    userLocation?.lng,
  ]);

  return (
    <div className="relative">
      <InteractiveMap
        lakes={mapLakes as unknown as LakeDto[]}
      />

      {isLoadingAllLakes && (
        <div className="pointer-events-none absolute right-3 top-3 z-[1100] rounded-xl border border-blue-100 bg-white/95 px-3 py-2 text-xs font-bold text-blue-600 shadow-sm backdrop-blur">
          Wczytuję wszystkie łowiska…
        </div>
      )}

      {mapError && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
          {mapError} Pokazuję tymczasowo wyniki z aktualnej strony.
        </div>
      )}
    </div>
  );
}