import { NextResponse } from "next/server";

import {
  getPaginatedLakes,
  type LakeListDto,
  type LakeListQuery,
} from "@/lib/lakes";

type MapLakesResponse = {
  lakes: LakeListDto[];
  totalCount: number;
};

const MAP_BATCH_SIZE = 50;

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

    /*
     * Lista / kafelki nadal korzystają z normalnej paginacji.
     * Endpoint mapy pobiera natomiast WSZYSTKIE strony po 50 wyników
     * i łączy je w jeden zestaw pinezek.
     *
     * Dzięki temu zachowujemy dokładnie tę samą logikę filtrów,
     * która działa już w getPaginatedLakes(), bez jej duplikowania.
     */
    const firstPage = await getPaginatedLakes({
      ...body,
      page: 1,
      pageSize: MAP_BATCH_SIZE,
    });

    if (firstPage.totalPages <= 1) {
      const response: MapLakesResponse = {
        lakes: firstPage.lakes,
        totalCount: firstPage.totalCount,
      };

      return NextResponse.json(response);
    }

    const remainingPages = await Promise.all(
      Array.from(
        { length: firstPage.totalPages - 1 },
        (_, index) =>
          getPaginatedLakes({
            ...body,
            page: index + 2,
            pageSize: MAP_BATCH_SIZE,
          })
      )
    );

    const lakes = [
      ...firstPage.lakes,
      ...remainingPages.flatMap((page) => page.lakes),
    ];

    /*
     * Dodatkowe zabezpieczenie przed duplikatami.
     * Normalnie nie powinny wystąpić, ale przy zmianach danych
     * w czasie wykonywania kilku zapytań jest to bezpieczniejsze.
     */
    const uniqueLakes = Array.from(
      new Map(lakes.map((lake) => [lake.id, lake])).values()
    );

    const response: MapLakesResponse = {
      lakes: uniqueLakes,
      totalCount: firstPage.totalCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/lakes/map]", error);

    return NextResponse.json(
      { message: "Nie udało się pobrać łowisk na mapę." },
      { status: 500 }
    );
  }
}