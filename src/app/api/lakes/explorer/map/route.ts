import { NextResponse } from "next/server";

import { getLakeExplorerMapResults } from "@/lib/lake-explorer";
import type { LakeExplorerQuery } from "@/lib/lake-explorer-types";

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
        { status: 400 }
      );
    }

    const result =
      await getLakeExplorerMapResults(
        body
      );

    return NextResponse.json(result);
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
      { status: 500 }
    );
  }
}
