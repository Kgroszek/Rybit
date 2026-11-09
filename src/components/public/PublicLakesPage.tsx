import { LakesExplorer } from "@/components/lakes/LakesExplorer";
import type {
  LakeExplorerInitialData,
} from "@/lib/lake-explorer-types";

type PublicLakesPageProps = {
  initialData: LakeExplorerInitialData;
};

/**
 * Cienki wrapper publicznego explorera.
 *
 * Nie tworzy własnej paginacji, mapy ani opcji filtrów.
 * Całe initialData pochodzi z getLakeExplorerInitialData(),
 * dzięki czemu istnieje tylko jeden system pobierania list łowisk.
 */
export function PublicLakesPage({
  initialData,
}: PublicLakesPageProps) {
  return (
    <LakesExplorer
      mode="public"
      detailBasePath="/lowiska-w-polsce"
      initialData={initialData}
      initialDataComplete
      syncUrl={false}
    />
  );
}
