import { prisma } from "@/lib/prisma";
import { normalizeFishFilterOptions } from "@/lib/fish-names";
import {
  getPaginatedLakes,
  type LakeFilterOptions,
  type PaginatedLakesResult,
} from "@/lib/lakes";

export type SeoVoivodeshipQuery = {
  canonicalVoivodeship: string;
  aliases?: string[];
  pageSize?: number;
};

export type SeoVoivodeshipLandingData = {
  resolvedVoivodeship: string;
  result: PaginatedLakesResult;
  filterOptions: LakeFilterOptions;
};

function normalizeRegionValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^woj(?:ewodztwo)?\.?\s+/i, "")
    .replace(/\s+/g, " ");
}

function matchesRegionAlias(value: string, aliases: string[]) {
  const normalizedValue = normalizeRegionValue(value);

  return aliases.some((alias) => {
    const normalizedAlias = normalizeRegionValue(alias);

    return (
      normalizedValue === normalizedAlias ||
      normalizedValue.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedValue)
    );
  });
}

async function resolveVoivodeshipValue(
  canonicalVoivodeship: string,
  aliases: string[]
) {
  const rows = await prisma.lake.findMany({
    distinct: ["voivodeship"],
    select: {
      voivodeship: true,
    },
  });

  const values = rows
    .map((row) => row.voivodeship.trim())
    .filter(Boolean);

  const normalizedCanonical = normalizeRegionValue(canonicalVoivodeship);

  const exactMatch = values.find(
    (value) => normalizeRegionValue(value) === normalizedCanonical
  );

  if (exactMatch) {
    return exactMatch;
  }

  const allAliases = Array.from(
    new Set([canonicalVoivodeship, ...aliases])
  );

  const aliasMatch = values.find((value) =>
    matchesRegionAlias(value, allAliases)
  );

  return aliasMatch ?? canonicalVoivodeship;
}

async function getRegionFilterOptions(
  voivodeship: string,
  totalCount: number
): Promise<LakeFilterOptions> {
  const fishRows = await prisma.lake.findMany({
    where: {
      voivodeship,
    },
    select: {
      fish: true,
      fishSpecies: {
        select: {
          name: true,
        },
      },
    },
  });

  const rawFishValues = fishRows.flatMap((lake) => [
    lake.fish,
    ...lake.fishSpecies.map((fish) => fish.name),
  ]);

  return {
    voivodeships: [voivodeship],
    fishOptions: normalizeFishFilterOptions(rawFishValues),
    allLakesCount: totalCount,
  };
}

export async function getSeoVoivodeshipLandingData({
  canonicalVoivodeship,
  aliases = [],
  pageSize = 15,
}: SeoVoivodeshipQuery): Promise<SeoVoivodeshipLandingData> {
  const resolvedVoivodeship = await resolveVoivodeshipValue(
    canonicalVoivodeship,
    aliases
  );

  const result = await getPaginatedLakes({
    page: 1,
    pageSize,
    voivodeship: resolvedVoivodeship,
    sort: "rating-desc",
  });

  const filterOptions = await getRegionFilterOptions(
    resolvedVoivodeship,
    result.totalCount
  );

  return {
    resolvedVoivodeship,
    result,
    filterOptions,
  };
}
