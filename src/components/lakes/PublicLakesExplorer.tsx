"use client";

import { useEffect, useState } from "react";

import { LakesExplorer } from "@/components/lakes/LakesExplorer";
import {
  parseLakeExplorerSearchParams,
  type LakeExplorerSearchParams,
} from "@/lib/lake-explorer-params";
import type { LakeExplorerInitialData } from "@/lib/lake-explorer-types";

function urlSearchParamsToRecord(params: URLSearchParams) {
  const result: LakeExplorerSearchParams = {};

  params.forEach((value, key) => {
    const current = result[key];

    if (current === undefined) {
      result[key] = value;
      return;
    }

    result[key] = Array.isArray(current)
      ? [...current, value]
      : [current, value];
  });

  return result;
}

/**
 * Publiczny explorer dostaje z serwera stabilny, domyślny zestaw danych,
 * dzięki czemu /lowiska-w-polsce może korzystać z ISR.
 *
 * Po hydration odczytujemy ewentualne filtry z URL. Jeżeli URL zawiera
 * parametry, remountujemy LakesExplorer z odtworzonym stanem i pozwalamy mu
 * pobrać właściwe wyniki z istniejącego API.
 *
 * Do czasu odczytania URL wyłączamy syncUrl, żeby domyślny stan SSR nie
 * nadpisał parametrów znajdujących się już w pasku adresu.
 */
export function PublicLakesExplorer({
  initialData,
}: {
  initialData: LakeExplorerInitialData;
}) {
  const [queryData, setQueryData] =
    useState<LakeExplorerInitialData | null>(null);
  const [isUrlHydrated, setIsUrlHydrated] = useState(false);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);

    if (currentUrl.search) {
      const parsed = parseLakeExplorerSearchParams(
        urlSearchParamsToRecord(currentUrl.searchParams)
      );

      setQueryData({
        ...initialData,
        filters: parsed.filters,
        bounds: parsed.bounds,
        mobileView: parsed.mobileView,
      });
    }

    setIsUrlHydrated(true);
  }, [initialData]);

  return (
    <LakesExplorer
      key={queryData ? "client-query" : "server-default"}
      mode="public"
      detailBasePath="/lowiska-w-polsce"
      initialData={queryData ?? initialData}
      initialDataComplete={queryData === null}
      syncUrl={isUrlHydrated}
    />
  );
}
