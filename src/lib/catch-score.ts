export const CATCH_SCORE_VERSION = 1;

export type CatchScoreTier =
  | "starter"
  | "solid"
  | "good"
  | "great"
  | "trophy"
  | "legendary";

export type CatchScoreSource =
  | "weight"
  | "length"
  | "mixed"
  | "unscored";

export type CatchScoreResult = {
  score: number | null;
  tier: CatchScoreTier | null;
  tierLabel: string;
  source: CatchScoreSource;
  version: number;
  fishKey: string | null;
  explanation: string;
};

type Thresholds = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
];

type FishScoreRule = {
  label: string;
  aliases?: readonly string[];
  weightKg?: Thresholds;
  lengthCm?: Thresholds;
  weightImportance?: number;
};

/**
 * RYBIO SCORE V1
 *
 * To są PROGI PRODUKTOWE do gamifikacji, a nie oficjalne rekordy Polski
 * ani biologiczna klasyfikacja wielkości ryb.
 *
 * Każdy gatunek ma osobną skalę. Dzięki temu np. karp 1 kg dostaje niski
 * wynik, a płoć ważąca 1 kg może dostać wynik bliski 100.
 *
 * Kolejne wersje można kalibrować na podstawie realnych danych z Rybio.
 */
export const FISH_SCORE_RULES: Record<string, FishScoreRule> = {
  "amur-bialy": {
    label: "Amur biały",
    aliases: ["amur", "amur bialy"],
    weightKg: [1, 3, 6, 10, 16, 25],
    lengthCm: [35, 50, 70, 85, 100, 120],
    weightImportance: 0.58,
  },
  bolen: {
    label: "Boleń",
    aliases: ["boleń"],
    weightKg: [0.3, 0.8, 1.5, 2.5, 4, 6],
    lengthCm: [30, 45, 55, 65, 75, 85],
    weightImportance: 0.42,
  },
  brzana: {
    label: "Brzana",
    weightKg: [0.2, 0.7, 1.5, 2.5, 4, 6],
    lengthCm: [25, 40, 50, 60, 70, 80],
    weightImportance: 0.45,
  },
  certa: {
    label: "Certa",
    weightKg: [0.1, 0.25, 0.45, 0.7, 1.1, 1.6],
    lengthCm: [20, 28, 34, 40, 46, 52],
    weightImportance: 0.45,
  },
  glowacica: {
    label: "Głowacica",
    aliases: ["głowacica"],
    weightKg: [1, 3, 7, 12, 20, 30],
    lengthCm: [40, 60, 80, 100, 120, 140],
    weightImportance: 0.5,
  },
  jaz: {
    label: "Jaź",
    aliases: ["jaź"],
    weightKg: [0.1, 0.35, 0.7, 1.2, 2, 3],
    lengthCm: [18, 28, 36, 44, 52, 60],
    weightImportance: 0.48,
  },
  jazgarz: {
    label: "Jazgarz",
    weightKg: [0.01, 0.03, 0.06, 0.1, 0.16, 0.24],
    lengthCm: [7, 10, 13, 16, 19, 22],
    weightImportance: 0.4,
  },
  jelec: {
    label: "Jelec",
    weightKg: [0.03, 0.08, 0.15, 0.25, 0.4, 0.6],
    lengthCm: [12, 18, 23, 28, 33, 38],
    weightImportance: 0.4,
  },
  jesiotr: {
    label: "Jesiotr",
    aliases: ["jesiotr syberyjski", "jesiotr rosyjski"],
    weightKg: [1, 4, 8, 15, 25, 40],
    lengthCm: [50, 75, 95, 120, 150, 185],
    weightImportance: 0.52,
  },
  "karas-pospolity": {
    label: "Karaś pospolity",
    aliases: ["karaś", "karas", "karas pospolity"],
    weightKg: [0.05, 0.15, 0.35, 0.65, 1.1, 1.8],
    lengthCm: [10, 17, 23, 29, 35, 42],
    weightImportance: 0.53,
  },
  "karas-srebrzysty": {
    label: "Karaś srebrzysty",
    aliases: ["karas srebrzysty"],
    weightKg: [0.08, 0.25, 0.5, 0.9, 1.5, 2.5],
    lengthCm: [12, 20, 27, 34, 41, 50],
    weightImportance: 0.55,
  },
  karp: {
    label: "Karp",
    aliases: ["karp pełnołuski", "karp pelnoluski", "karp królewski"],
    weightKg: [1, 3, 6, 10, 15, 25],
    lengthCm: [30, 45, 60, 72, 86, 105],
    weightImportance: 0.62,
  },
  kielb: {
    label: "Kiełb",
    aliases: ["kiełb"],
    weightKg: [0.01, 0.025, 0.05, 0.08, 0.13, 0.2],
    lengthCm: [7, 10, 13, 16, 19, 22],
    weightImportance: 0.38,
  },
  klen: {
    label: "Kleń",
    aliases: ["kleń"],
    weightKg: [0.15, 0.5, 1, 1.7, 2.7, 4],
    lengthCm: [20, 32, 42, 50, 58, 66],
    weightImportance: 0.47,
  },
  krap: {
    label: "Krąp",
    aliases: ["krąp"],
    weightKg: [0.05, 0.15, 0.3, 0.5, 0.8, 1.2],
    lengthCm: [12, 20, 26, 32, 38, 44],
    weightImportance: 0.5,
  },
  leszcz: {
    label: "Leszcz",
    weightKg: [0.15, 0.5, 1.1, 2, 3.5, 5.5],
    lengthCm: [18, 28, 37, 46, 56, 66],
    weightImportance: 0.55,
  },
  lin: {
    label: "Lin",
    weightKg: [0.1, 0.4, 0.8, 1.4, 2.3, 3.8],
    lengthCm: [16, 25, 33, 41, 50, 60],
    weightImportance: 0.55,
  },
  lipien: {
    label: "Lipień",
    aliases: ["lipień"],
    weightKg: [0.1, 0.25, 0.45, 0.75, 1.2, 1.8],
    lengthCm: [20, 28, 35, 42, 49, 56],
    weightImportance: 0.38,
  },
  "losos-atlantycki": {
    label: "Łosoś atlantycki",
    aliases: ["łosoś", "losos", "losos atlantycki"],
    weightKg: [1, 3, 6, 10, 16, 24],
    lengthCm: [45, 60, 75, 90, 105, 120],
    weightImportance: 0.5,
  },
  mietus: {
    label: "Miętus",
    aliases: ["miętus"],
    weightKg: [0.1, 0.35, 0.7, 1.2, 2, 3.5],
    lengthCm: [20, 30, 40, 50, 62, 75],
    weightImportance: 0.48,
  },
  okon: {
    label: "Okoń",
    aliases: ["okoń"],
    weightKg: [0.05, 0.15, 0.3, 0.55, 0.9, 1.5],
    lengthCm: [12, 20, 27, 34, 41, 49],
    weightImportance: 0.42,
  },
  ploc: {
    label: "Płoć",
    aliases: ["płoć", "płotka", "plotka"],
    weightKg: [0.04, 0.12, 0.25, 0.4, 0.65, 1.0],
    lengthCm: [10, 16, 21, 25, 30, 36],
    weightImportance: 0.55,
  },
  "pstrag-potokowy": {
    label: "Pstrąg potokowy",
    aliases: ["pstrąg", "pstrag", "pstrag potokowy"],
    weightKg: [0.1, 0.3, 0.6, 1, 1.8, 3],
    lengthCm: [18, 27, 35, 43, 52, 63],
    weightImportance: 0.4,
  },
  "pstrag-teczowy": {
    label: "Pstrąg tęczowy",
    aliases: ["pstrag teczowy"],
    weightKg: [0.15, 0.4, 0.8, 1.5, 2.8, 5],
    lengthCm: [20, 30, 40, 50, 62, 75],
    weightImportance: 0.45,
  },
  "pstrag-zrodlany": {
    label: "Pstrąg źródlany",
    aliases: ["pstrag zrodlany"],
    weightKg: [0.08, 0.2, 0.4, 0.7, 1.2, 2],
    lengthCm: [16, 24, 31, 38, 46, 55],
    weightImportance: 0.4,
  },
  sandacz: {
    label: "Sandacz",
    weightKg: [0.3, 1, 2, 3.5, 6, 9],
    lengthCm: [25, 45, 58, 70, 84, 100],
    weightImportance: 0.43,
  },
  sieja: {
    label: "Sieja",
    weightKg: [0.15, 0.4, 0.8, 1.4, 2.3, 3.5],
    lengthCm: [20, 30, 38, 46, 55, 65],
    weightImportance: 0.45,
  },
  sielawa: {
    label: "Sielawa",
    weightKg: [0.05, 0.12, 0.22, 0.35, 0.55, 0.8],
    lengthCm: [12, 18, 23, 28, 33, 39],
    weightImportance: 0.42,
  },
  sum: {
    label: "Sum",
    aliases: ["sum europejski"],
    weightKg: [1, 5, 15, 30, 60, 100],
    lengthCm: [50, 80, 120, 160, 210, 250],
    weightImportance: 0.5,
  },
  "sumik-karlowaty": {
    label: "Sumik karłowaty",
    aliases: ["sumik karłowaty", "sumik karlowaty"],
    weightKg: [0.03, 0.1, 0.2, 0.35, 0.55, 0.8],
    lengthCm: [10, 17, 23, 29, 35, 42],
    weightImportance: 0.48,
  },
  szczupak: {
    label: "Szczupak",
    weightKg: [0.3, 1.2, 2.5, 4.5, 7.5, 12],
    lengthCm: [30, 50, 65, 78, 95, 112],
    weightImportance: 0.4,
  },
  swinka: {
    label: "Świnka",
    aliases: ["świnka"],
    weightKg: [0.1, 0.3, 0.6, 1, 1.6, 2.4],
    lengthCm: [18, 27, 34, 41, 48, 56],
    weightImportance: 0.45,
  },
  "tolpyga-biala": {
    label: "Tołpyga biała",
    aliases: ["tołpyga", "tolpyga", "tolpyga biala"],
    weightKg: [2, 5, 10, 18, 28, 40],
    lengthCm: [45, 65, 85, 105, 125, 145],
    weightImportance: 0.6,
  },
  "tolpyga-pstra": {
    label: "Tołpyga pstra",
    aliases: ["tolpyga pstra"],
    weightKg: [2, 6, 12, 20, 32, 45],
    lengthCm: [45, 70, 90, 110, 130, 150],
    weightImportance: 0.6,
  },
  "troc-wedrowna": {
    label: "Troć wędrowna",
    aliases: ["troć", "troc", "troc wedrowna"],
    weightKg: [0.5, 1.5, 3, 5, 8, 12],
    lengthCm: [35, 50, 65, 78, 90, 105],
    weightImportance: 0.45,
  },
  ukleja: {
    label: "Ukleja",
    weightKg: [0.01, 0.025, 0.05, 0.08, 0.13, 0.2],
    lengthCm: [7, 11, 15, 18, 21, 24],
    weightImportance: 0.38,
  },
  "wegorz-europejski": {
    label: "Węgorz europejski",
    aliases: ["węgorz", "wegorz", "wegorz europejski"],
    weightKg: [0.15, 0.5, 1, 1.8, 3.2, 5.5],
    lengthCm: [30, 50, 70, 90, 115, 145],
    weightImportance: 0.5,
  },
  wzdręga: {
    label: "Wzdręga",
    aliases: ["wzdręga", "wzdrega"],
    weightKg: [0.04, 0.12, 0.25, 0.4, 0.65, 1.0],
    lengthCm: [10, 17, 22, 27, 32, 38],
    weightImportance: 0.52,
  },
};

const SCORE_POINTS = [15, 30, 50, 70, 88, 100] as const;

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findRule(fishName: string) {
  const normalizedFish = normalize(fishName);

  for (const [key, rule] of Object.entries(FISH_SCORE_RULES)) {
    if (normalize(key) === normalizedFish || normalize(rule.label) === normalizedFish) {
      return { key, rule };
    }

    if (
      rule.aliases?.some(
        (alias) => normalize(alias) === normalizedFish
      )
    ) {
      return { key, rule };
    }
  }

  return null;
}

function interpolateScore(value: number, thresholds: Thresholds) {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  if (value >= thresholds[5]) {
    return 100;
  }

  if (value <= thresholds[0]) {
    const ratio = Math.max(0, value / thresholds[0]);
    return Math.max(1, Math.round(1 + ratio * (SCORE_POINTS[0] - 1)));
  }

  for (let index = 0; index < thresholds.length - 1; index += 1) {
    const fromValue = thresholds[index];
    const toValue = thresholds[index + 1];

    if (value >= fromValue && value <= toValue) {
      const fromScore = SCORE_POINTS[index];
      const toScore = SCORE_POINTS[index + 1];
      const progress = (value - fromValue) / (toValue - fromValue);

      return Math.round(fromScore + progress * (toScore - fromScore));
    }
  }

  return 1;
}

export function getCatchScoreTier(score: number): {
  tier: CatchScoreTier;
  label: string;
} {
  if (score >= 95) {
    return { tier: "legendary", label: "Legenda" };
  }

  if (score >= 80) {
    return { tier: "trophy", label: "Okaz" };
  }

  if (score >= 60) {
    return { tier: "great", label: "Bardzo dobra sztuka" };
  }

  if (score >= 40) {
    return { tier: "good", label: "Dobra sztuka" };
  }

  if (score >= 20) {
    return { tier: "solid", label: "Solidna sztuka" };
  }

  return { tier: "starter", label: "Mniejsza sztuka" };
}

export function calculateCatchScore({
  fishName,
  weight,
  length,
}: {
  fishName: string;
  weight?: number | null;
  length?: number | null;
}): CatchScoreResult {
  const matched = findRule(fishName);

  if (!matched) {
    return {
      score: null,
      tier: null,
      tierLabel: "Brak skali",
      source: "unscored",
      version: CATCH_SCORE_VERSION,
      fishKey: null,
      explanation:
        "Ten gatunek nie ma jeszcze zdefiniowanej skali Rybio Score.",
    };
  }

  const { key, rule } = matched;

  const weightScore =
    weight !== null &&
    weight !== undefined &&
    rule.weightKg
      ? interpolateScore(weight, rule.weightKg)
      : null;

  const lengthScore =
    length !== null &&
    length !== undefined &&
    rule.lengthCm
      ? interpolateScore(length, rule.lengthCm)
      : null;

  let score: number | null = null;
  let source: CatchScoreSource = "unscored";

  if (weightScore !== null && lengthScore !== null) {
    const weightImportance = Math.min(
      0.8,
      Math.max(0.2, rule.weightImportance ?? 0.5)
    );

    score = Math.round(
      weightScore * weightImportance +
        lengthScore * (1 - weightImportance)
    );

    source = "mixed";
  } else if (weightScore !== null) {
    score = weightScore;
    source = "weight";
  } else if (lengthScore !== null) {
    score = lengthScore;
    source = "length";
  }

  if (score === null) {
    return {
      score: null,
      tier: null,
      tierLabel: "Brak oceny",
      source: "unscored",
      version: CATCH_SCORE_VERSION,
      fishKey: key,
      explanation:
        "Podaj wagę lub długość ryby, aby obliczyć Rybio Score.",
    };
  }

  const boundedScore = Math.min(100, Math.max(1, score));
  const tier = getCatchScoreTier(boundedScore);

  return {
    score: boundedScore,
    tier: tier.tier,
    tierLabel: tier.label,
    source,
    version: CATCH_SCORE_VERSION,
    fishKey: key,
    explanation:
      source === "mixed"
        ? "Wynik został policzony z wagi i długości na skali właściwej dla tego gatunku."
        : source === "weight"
          ? "Wynik został policzony z wagi na skali właściwej dla tego gatunku."
          : "Wynik został policzony z długości na skali właściwej dla tego gatunku.",
  };
}

export function resolveStoredCatchScore(input: {
  fishName: string;
  weight?: number | null;
  length?: number | null;
  catchScore?: number | null;
  catchScoreTier?: string | null;
  catchScoreSource?: string | null;
  catchScoreVersion?: number | null;
}) {
  if (
    typeof input.catchScore === "number" &&
    Number.isFinite(input.catchScore) &&
    input.catchScoreVersion === CATCH_SCORE_VERSION
  ) {
    const tier = getCatchScoreTier(input.catchScore);

    return {
      score: Math.min(100, Math.max(1, Math.round(input.catchScore))),
      tier: (input.catchScoreTier || tier.tier) as CatchScoreTier,
      tierLabel: tier.label,
      source: (input.catchScoreSource || "mixed") as CatchScoreSource,
      version: CATCH_SCORE_VERSION,
      fishKey: findRule(input.fishName)?.key ?? null,
      explanation: "Zapisany wynik Rybio Score V1.",
    } satisfies CatchScoreResult;
  }

  return calculateCatchScore(input);
}

export function getScoreTheme(score: number | null) {
  if (score === null) {
    return {
      frame: "#94a3b8",
      accent: "#64748b",
      soft: "#f1f5f9",
    };
  }

  if (score >= 95) {
    return {
      frame: "#f4c542",
      accent: "#b77900",
      soft: "#fff7d6",
    };
  }

  if (score >= 80) {
    return {
      frame: "#f0b429",
      accent: "#d97706",
      soft: "#fff7ed",
    };
  }

  if (score >= 60) {
    return {
      frame: "#2563eb",
      accent: "#1d4ed8",
      soft: "#eff6ff",
    };
  }

  if (score >= 40) {
    return {
      frame: "#0f766e",
      accent: "#0f766e",
      soft: "#f0fdfa",
    };
  }

  if (score >= 20) {
    return {
      frame: "#64748b",
      accent: "#475569",
      soft: "#f8fafc",
    };
  }

  return {
    frame: "#94a3b8",
    accent: "#64748b",
    soft: "#f8fafc",
  };
}
