import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { getLakeExplorerResults } from "@/lib/lake-explorer";
import type { LakeExplorerQuery } from "@/lib/lake-explorer-types";

const getCachedLakeExplorerResults = unstable_cache(
  async (query: LakeExplorerQuery) => {
    return getLakeExplorerResults(query);
  },
  ["api-lakes-explorer-v1"],
  {
    revalidate: 30,
  }
);

function normalizeCacheQuery(
  query: LakeExplorerQuery
): LakeExplorerQuery {
  return {
    ...query,
    amenities: Array.isArray(query.amenities)
      ? [...query.amenities]
          .map((item) => String(item))
          .sort()
      : [],
    userLat: null,
    userLng: null,
  };
}

function shouldBypassCache(
  query: LakeExplorerQuery
) {
  const sort = String(query.sort ?? "");

  if (sort !== "distance-asc") {
    return false;
  }

  const lat = Number(query.userLat);
  const lng = Number(query.userLng);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  );
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

    const result = shouldBypassCache(body)
      ? await getLakeExplorerResults(body)
      : await getCachedLakeExplorerResults(
          normalizeCacheQuery(body)
        );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "[api/lakes/explorer]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się pobrać łowisk.",
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
