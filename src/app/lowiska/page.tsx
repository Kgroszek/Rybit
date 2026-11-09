import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LakesExplorer } from "@/components/lakes/LakesExplorer";
import {
  LAKE_EXPLORER_PAGE_SIZE,
} from "@/components/lakes/constants";
import {
  getLakeExplorerInitialData,
} from "@/lib/lake-explorer";
import {
  parseLakeExplorerSearchParams,
  type LakeExplorerSearchParams,
} from "@/lib/lake-explorer-params";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type LowiskaPageProps = {
  searchParams?: Promise<LakeExplorerSearchParams>;
};

export default async function LowiskaPage({
  searchParams,
}: LowiskaPageProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params =
    (await searchParams) ?? {};

  const parsed =
    parseLakeExplorerSearchParams(
      params
    );

  const [
    initialData,
    favouriteRows,
  ] = await Promise.all([
    getLakeExplorerInitialData({
      query: {
        ...parsed.filters,
        bounds: parsed.bounds,
        page: 1,
        pageSize:
          LAKE_EXPLORER_PAGE_SIZE,
      },
      mobileView:
        parsed.mobileView,
    }),
    prisma.favourite.findMany({
      where: {
        userId: user.id,
      },
      select: {
        lakeId: true,
      },
    }),
  ]);

  return (
    <DashboardLayout>
      <LakesExplorer
        mode="authenticated"
        detailBasePath="/lowiska"
        initialData={{
          ...initialData,
          favouriteLakeIds:
            favouriteRows.map(
              (item) =>
                item.lakeId
            ),
        }}
      />
    </DashboardLayout>
  );
}
