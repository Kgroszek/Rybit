import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { getLakeExplorerMapResults } from "@/lib/lake-explorer";
import type { LakeExplorerQuery } from "@/lib/lake-explorer-types";

const getCachedLakeExplorerMapResults =
  unstable_cache(
    async (query: LakeExplorerQuery) => {
      return getLakeExplorerMapResults(
        query
      );
    },
    ["api-lakes-explorer-map-v1"],
    {
      revalidate: 60,
    }
  );

function normalizeMapCacheQuery(
  query: LakeExplorerQuery
): LakeExplorerQuery {
  return {
    ...query,
    amenities: Array.isArray(query.amenities)
      ? [...query.amenities]
          .map((item) => String(item))
          .sort()
      : [],
    page: 1,
    pageSize: 1,
    sort: "rating-desc",
    userLat: null,
    userLng: null,
  };
}

export async function POST(request: Request) {
  try {
    const body =
      (await request
        .json()
        .catch(() => null)) as
        | LakeExplorerQuery
        | null;

    if (!body) {
      return NextResponse.json(
        {
          message:
            "Nieprawidłowe dane wyszukiwania.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const result =
      await getCachedLakeExplorerMapResults(
        normalizeMapCacheQuery(body)
      );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "[api/lakes/explorer/map]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się pobrać łowisk na mapę.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
