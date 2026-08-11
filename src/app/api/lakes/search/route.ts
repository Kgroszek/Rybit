import { NextResponse } from "next/server";

import {
  getPaginatedLakes,
  type LakeListQuery,
} from "@/lib/lakes";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | LakeListQuery
      | null;

    if (!body) {
      return NextResponse.json(
        { message: "Nieprawidłowe dane wyszukiwania." },
        { status: 400 }
      );
    }

    const result = await getPaginatedLakes(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/lakes/search]", error);

    return NextResponse.json(
      { message: "Nie udało się pobrać łowisk." },
      { status: 500 }
    );
  }
}
