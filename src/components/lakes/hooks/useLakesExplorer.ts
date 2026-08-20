"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useUserLocation } from "@/hooks/useUserLocation";
import {
  areBoundsEqual,
  buildLakeExplorerUrlParams,
  normalizeLakeExplorerBounds,
  parseLakeExplorerSearchParams,
  roundBounds,
} from "@/lib/lake-explorer-params";
import type {
  LakeExplorerBounds,
  LakeExplorerFilters,
  LakeExplorerInitialData,
  LakeExplorerMapResult,
  LakeExplorerQuery,
  LakeExplorerResult,
} from "@/lib/lake-explorer-types";

type UseLakesExplorerOptions = {
  initialData: LakeExplorerInitialData;
  initialDataComplete?: boolean;
  syncUrl?: boolean;
};

type JsonError = {
  message?: string;
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | T
    | JsonError
    | null;

  if (
    !response.ok ||
    !data ||
    (typeof data === "object" &&
      "message" in data &&
      !("lakes" in data))
  ) {
    throw new Error(
      data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
        ? data.message
        : "Nie udało się pobrać danych."
    );
  }

  return data as T;
}

function makeQuery({
  filters,
  bounds,
  page,
  pageSize,
  userLocation,
}: {
  filters: LakeExplorerFilters;
  bounds: LakeExplorerBounds;
  page: number;
  pageSize: number;
  userLocation: {
    lat: number;
    lng: number;
  } | null;
}): LakeExplorerQuery {
  const sortLocation =
    filters.sort === "distance-asc" ? userLocation : null;

  return {
    ...filters,
    bounds,
    page,
    pageSize,
    userLat: sortLocation?.lat ?? null,
    userLng: sortLocation?.lng ?? null,
  };
}

function dedupeLakes<T extends { id: string }>(items: T[]) {
  return Array.from(
    new Map(items.map((item) => [item.id, item])).values()
  );
}

export function useLakesExplorer({
  initialData,
  initialDataComplete = true,
  syncUrl = true,
}: UseLakesExplorerOptions) {
  const { userLocation, setUserLocation } = useUserLocation();

  const [filters, setFiltersState] = useState<LakeExplorerFilters>(
    initialData.filters
  );

  const [activeBounds, setActiveBoundsState] =
    useState<LakeExplorerBounds>(initialData.bounds);

  const [mobileView, setMobileView] = useState<"list" | "map">(
    initialData.mobileView
  );

  const [result, setResult] = useState<LakeExplorerResult>(
    initialData.result
  );

  const [mapResult, setMapResult] = useState<LakeExplorerMapResult>(
    initialData.mapResult
  );

  const [isRefreshing, setIsRefreshing] = useState(
    !initialDataComplete
  );

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const refreshRequestId = useRef(0);
  const loadMoreRequestId = useRef(0);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const isFirstRefreshEffect = useRef(true);

  const pageSize = initialData.result.pageSize;

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        ...filters,
        amenities: [...filters.amenities].sort(),
      }),
    [filters]
  );

  const boundsKey = useMemo(
    () => JSON.stringify(roundBounds(activeBounds)),
    [activeBounds]
  );

  const queryUserLocation =
    filters.sort === "distance-asc" ? userLocation : null;

  const sortLocationKey = queryUserLocation
    ? `${queryUserLocation.lat}:${queryUserLocation.lng}`
    : "no-distance-location";

  const setFilters = useCallback(
    (
      next:
        | LakeExplorerFilters
        | ((current: LakeExplorerFilters) => LakeExplorerFilters)
    ) => {
      setFiltersState((current) =>
        typeof next === "function" ? next(current) : next
      );
    },
    []
  );

  const patchFilters = useCallback(
    (
      patch:
        | Partial<LakeExplorerFilters>
        | ((
            current: LakeExplorerFilters
          ) => Partial<LakeExplorerFilters>)
    ) => {
      setFiltersState((current) => ({
        ...current,
        ...(typeof patch === "function" ? patch(current) : patch),
      }));
    },
    []
  );

  /**
   * Aktualizuje obszar zapytania po zakończeniu ruchu mapy.
   *
   * - odrzuca nieprawidłowe współrzędne,
   * - zaokrągla bbox, żeby drobne różnice Leafleta nie wywoływały requestów,
   * - nie zmienia stanu, jeśli viewport faktycznie się nie zmienił.
   */
  const setActiveBounds = useCallback(
    (
      next:
        | LakeExplorerBounds
        | ((current: LakeExplorerBounds) => LakeExplorerBounds)
    ) => {
      setActiveBoundsState((current) => {
        const candidate =
          typeof next === "function" ? next(current) : next;

        const normalized = normalizeLakeExplorerBounds(candidate);

        if (!normalized) {
          return current;
        }

        const rounded = roundBounds(normalized);

        return areBoundsEqual(current, rounded, 0.0001)
          ? current
          : rounded;
      });
    },
    []
  );

  const fetchFirstPageAndMap = useCallback(
    async ({ signal }: { signal: AbortSignal }) => {
      const query = makeQuery({
        filters,
        bounds: activeBounds,
        page: 1,
        pageSize,
        userLocation: queryUserLocation,
      });

      const [listResponse, mapResponse] = await Promise.all([
        fetch("/api/lakes/explorer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(query),
          signal,
        }),
        fetch("/api/lakes/explorer/map", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(query),
          signal,
        }),
      ]);

      const [nextResult, nextMap] = await Promise.all([
        readJsonResponse<LakeExplorerResult>(listResponse),
        readJsonResponse<LakeExplorerMapResult>(mapResponse),
      ]);

      return {
        nextResult,
        nextMap,
      };
    },
    [activeBounds, filters, pageSize, queryUserLocation]
  );

  useEffect(() => {
    if (isFirstRefreshEffect.current && initialDataComplete) {
      isFirstRefreshEffect.current = false;
      return;
    }

    isFirstRefreshEffect.current = false;

    loadMoreRequestId.current += 1;
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = null;
    setIsLoadingMore(false);

    const currentRequestId = refreshRequestId.current + 1;
    refreshRequestId.current = currentRequestId;

    const controller = new AbortController();

    /**
     * Jeden debounce obsługuje zarówno wpisywanie w search,
     * jak i przesunięcie / zoom mapy. Dzięki temu mapa jest "live",
     * ale API nie dostaje serii requestów podczas interakcji.
     */
    const timeoutId = window.setTimeout(async () => {
      setIsRefreshing(true);
      setError("");

      try {
        const { nextResult, nextMap } = await fetchFirstPageAndMap({
          signal: controller.signal,
        });

        if (
          controller.signal.aborted ||
          refreshRequestId.current !== currentRequestId
        ) {
          return;
        }

        setResult(nextResult);
        setMapResult(nextMap);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Nie udało się pobrać łowisk."
        );
      } finally {
        if (
          !controller.signal.aborted &&
          refreshRequestId.current === currentRequestId
        ) {
          setIsRefreshing(false);
        }
      }
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    filterKey,
    boundsKey,
    sortLocationKey,
    fetchFirstPageAndMap,
    initialDataComplete,
  ]);

  useEffect(() => {
    if (!syncUrl) {
      return;
    }

    const params = buildLakeExplorerUrlParams({
      filters,
      bounds: activeBounds,
      mobileView,
    });

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${
      query ? `?${query}` : ""
    }${window.location.hash}`;

    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      /**
       * Ruch mapy może generować wiele kolejnych bboxów.
       * replaceState zapobiega zapychaniu historii przeglądarki.
       */
      window.history.replaceState(null, "", nextUrl);
    }
  }, [
    filterKey,
    boundsKey,
    mobileView,
    filters,
    activeBounds,
    syncUrl,
  ]);

  useEffect(() => {
    if (!syncUrl) {
      return;
    }

    function restoreFromHistory() {
      const params = Object.fromEntries(
        new URLSearchParams(window.location.search).entries()
      );

      const parsed = parseLakeExplorerSearchParams(params);

      setFiltersState(parsed.filters);
      setActiveBoundsState(parsed.bounds);
      setMobileView(parsed.mobileView);
    }

    window.addEventListener("popstate", restoreFromHistory);

    return () => {
      window.removeEventListener("popstate", restoreFromHistory);
    };
  }, [syncUrl]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || result.page >= result.totalPages) {
      return;
    }

    const requestId = loadMoreRequestId.current + 1;
    loadMoreRequestId.current = requestId;

    loadMoreControllerRef.current?.abort();

    const controller = new AbortController();
    loadMoreControllerRef.current = controller;

    setIsLoadingMore(true);
    setError("");

    try {
      const query = makeQuery({
        filters,
        bounds: activeBounds,
        page: result.page + 1,
        pageSize,
        userLocation: queryUserLocation,
      });

      const response = await fetch("/api/lakes/explorer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
        signal: controller.signal,
      });

      const next = await readJsonResponse<LakeExplorerResult>(response);

      if (loadMoreRequestId.current !== requestId) {
        return;
      }

      setResult((current) => ({
        ...next,
        lakes: dedupeLakes([...current.lakes, ...next.lakes]),
      }));
    } catch (requestError) {
      if (controller.signal.aborted) {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Nie udało się pobrać kolejnych łowisk."
      );
    } finally {
      if (loadMoreRequestId.current === requestId) {
        loadMoreControllerRef.current = null;
        setIsLoadingMore(false);
      }
    }
  }, [
    activeBounds,
    filters,
    isLoadingMore,
    pageSize,
    result.page,
    result.totalPages,
    queryUserLocation,
  ]);

  useEffect(() => {
    return () => {
      loadMoreControllerRef.current?.abort();
    };
  }, []);

  return {
    filters,
    setFilters,
    patchFilters,
    activeBounds,
    setActiveBounds,
    mobileView,
    setMobileView,
    result,
    mapResult,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore: result.page < result.totalPages,
    loadMore,
    userLocation,
    setUserLocation,
  };
}
