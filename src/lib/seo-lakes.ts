import { prisma } from "@/lib/prisma";
import {
  getLakeExplorerInitialData,
} from "@/lib/lake-explorer";
import {
  DEFAULT_LAKE_EXPLORER_FILTERS,
} from "@/lib/lake-explorer-params";
import type {
  LakeExplorerInitialData,
} from "@/lib/lake-explorer-types";

export type SeoVoivodeshipQuery = {
  canonicalVoivodeship: string;
  aliases?: string[];
  pageSize?: number;
};

export type SeoVoivodeshipLandingData = {
  resolvedVoivodeship: string;
  initialData: LakeExplorerInitialData;
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

function matchesRegionAlias(
  value: string,
  aliases: string[]
) {
  const normalizedValue =
    normalizeRegionValue(value);

  return aliases.some((alias) => {
    const normalizedAlias =
      normalizeRegionValue(alias);

    return (
      normalizedValue ===
        normalizedAlias ||
      normalizedValue.includes(
        normalizedAlias
      ) ||
      normalizedAlias.includes(
        normalizedValue
      )
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
    .map((row) =>
      row.voivodeship.trim()
    )
    .filter(Boolean);

  const normalizedCanonical =
    normalizeRegionValue(
      canonicalVoivodeship
    );

  const exactMatch = values.find(
    (value) =>
      normalizeRegionValue(value) ===
      normalizedCanonical
  );

  if (exactMatch) {
    return exactMatch;
  }

  const allAliases = Array.from(
    new Set([
      canonicalVoivodeship,
      ...aliases,
    ])
  );

  const aliasMatch = values.find(
    (value) =>
      matchesRegionAlias(
        value,
        allAliases
      )
  );

  return (
    aliasMatch ??
    canonicalVoivodeship
  );
}

export async function getSeoVoivodeshipLandingData({
  canonicalVoivodeship,
  aliases = [],
  pageSize = 15,
}: SeoVoivodeshipQuery): Promise<SeoVoivodeshipLandingData> {
  const resolvedVoivodeship =
    await resolveVoivodeshipValue(
      canonicalVoivodeship,
      aliases
    );

  const initialData =
    await getLakeExplorerInitialData({
      query: {
        ...DEFAULT_LAKE_EXPLORER_FILTERS,
        voivodeship:
          resolvedVoivodeship,
        page: 1,
        pageSize,
      },
    });

  return {
    resolvedVoivodeship,
    initialData,
  };
}
