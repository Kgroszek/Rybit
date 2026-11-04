import { NextResponse } from "next/server";

import { getLakeBySlug } from "@/lib/lakes";

type LakeRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const PUBLIC_LAKE_CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=300";

export async function GET(
  _request: Request,
  { params }: LakeRouteProps
) {
  try {
    const { slug } = await params;

    const lake =
      await getLakeBySlug(slug);

    if (!lake) {
      return NextResponse.json(
        {
          message:
            "Nie znaleziono łowiska.",
        },
        {
          status: 404,
          headers: {
            "Cache-Control":
              "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    return NextResponse.json(lake, {
      headers: {
        "Cache-Control":
          PUBLIC_LAKE_CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error(
      "[api/lakes/[slug]/GET]",
      error
    );

    return NextResponse.json(
      {
        message:
          "Nie udało się pobrać łowiska.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}
