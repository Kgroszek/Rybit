type FishDefinition = {
  label: string;
  aliases: string[];
  filterLabel?: string;
};

function normalizeLookupValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

function titleCasePolish(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toLocaleUpperCase("pl") + trimmed.slice(1).toLocaleLowerCase("pl");
}

const IGNORED_VALUES = new Set([
  "brak informacji",
  "brak danych",
  "brak",
  "nie podano",
  "nie wiadomo",
  "-",
  "—",
]);

const FISH_DEFINITIONS: FishDefinition[] = [
  { label: "Amur", aliases: ["amur", "amur biały", "amur bialy"] },
  { label: "Boleń", aliases: ["boleń", "bolen"] },
  { label: "Brzana", aliases: ["brzana"] },
  { label: "Certa", aliases: ["certa"] },
  { label: "Głowacica", aliases: ["głowacica", "glowacica"] },
  { label: "Jaź", aliases: ["jaź", "jaz"] },
  { label: "Jazgarz", aliases: ["jazgarz"] },
  { label: "Jelec", aliases: ["jelec"] },
  {
    label: "Jesiotr",
    aliases: [
      "jesiotr",
      "jesiotr syberyjski",
      "jesiotr rosyjski",
      "jesiotr atlantycki",
      "jesiotr ostronosy",
    ],
  },

  {
    label: "Karaś pospolity",
    filterLabel: "Karaś",
    aliases: [
      "karaś pospolity",
      "karas pospolity",
      "karaś złocisty",
      "karas zlocisty",
      "karaś złoty",
      "karas zloty",
      "złocisty",
      "zlocisty",
    ],
  },
  {
    label: "Karaś srebrzysty",
    filterLabel: "Karaś",
    aliases: [
      "karaś srebrzysty",
      "karas srebrzysty",
      "karaś srebrny",
      "karas srebrny",
    ],
  },
  {
    label: "Karaś",
    filterLabel: "Karaś",
    aliases: ["karaś", "karas"],
  },

  { label: "Karp", aliases: ["karp", "karp pełnołuski", "karp pelnoluski", "karp królewski", "karp krolewski"] },
  { label: "Kiełb", aliases: ["kiełb", "kielb"] },
  { label: "Kleń", aliases: ["kleń", "klen"] },
  { label: "Krąp", aliases: ["krąp", "krap"] },
  { label: "Leszcz", aliases: ["leszcz"] },
  { label: "Lin", aliases: ["lin"] },
  { label: "Lipień", aliases: ["lipień", "lipien"] },
  { label: "Łosoś", aliases: ["łosoś", "losos", "łosoś atlantycki", "losos atlantycki"] },
  { label: "Miętus", aliases: ["miętus", "mietus"] },
  { label: "Okoń", aliases: ["okoń", "okon"] },
  { label: "Płoć", aliases: ["płoć", "ploc"] },

  {
    label: "Pstrąg potokowy",
    filterLabel: "Pstrąg",
    aliases: ["pstrąg potokowy", "pstrag potokowy", "potokowiec"],
  },
  {
    label: "Pstrąg tęczowy",
    filterLabel: "Pstrąg",
    aliases: ["pstrąg tęczowy", "pstrag teczowy", "tęczak", "teczak"],
  },
  {
    label: "Pstrąg źródlany",
    filterLabel: "Pstrąg",
    aliases: ["pstrąg źródlany", "pstrag zrodlany"],
  },
  {
    label: "Pstrąg",
    filterLabel: "Pstrąg",
    aliases: ["pstrąg", "pstrag"],
  },

  { label: "Sandacz", aliases: ["sandacz"] },
  { label: "Sieja", aliases: ["sieja"] },
  { label: "Sielawa", aliases: ["sielawa"] },
  { label: "Sum", aliases: ["sum", "sum europejski"] },
  { label: "Sumik karłowaty", aliases: ["sumik karłowaty", "sumik karlowaty", "sumik"] },
  { label: "Szczupak", aliases: ["szczupak"] },
  { label: "Świnka", aliases: ["świnka", "swinka"] },

  {
    label: "Tołpyga biała",
    filterLabel: "Tołpyga",
    aliases: ["tołpyga biała", "tolpyga biala"],
  },
  {
    label: "Tołpyga pstra",
    filterLabel: "Tołpyga",
    aliases: ["tołpyga pstra", "tolpyga pstra"],
  },
  {
    label: "Tołpyga",
    filterLabel: "Tołpyga",
    aliases: ["tołpyga", "tolpyga"],
  },

  { label: "Troć", aliases: ["troć", "troc", "troć wędrowna", "troc wedrowna"] },
  { label: "Ukleja", aliases: ["ukleja"] },
  { label: "Węgorz", aliases: ["węgorz", "wegorz", "węgorz europejski", "wegorz europejski"] },
  { label: "Wzdręga", aliases: ["wzdręga", "wzdrega"] },
];

const ALL_ALIAS_ENTRIES = FISH_DEFINITIONS.flatMap((definition) =>
  definition.aliases.map((alias) => ({
    definition,
    alias,
    normalizedAlias: normalizeLookupValue(alias),
  }))
).sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length);

function containsWholePhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i");
  return expression.test(text);
}

function getExactDefinition(value: string) {
  const normalized = normalizeLookupValue(value);

  return FISH_DEFINITIONS.find((definition) =>
    definition.aliases.some(
      (alias) => normalizeLookupValue(alias) === normalized
    )
  );
}

export function getFishKey(value: string) {
  const definition = getExactDefinition(value);

  if (definition) {
    return normalizeLookupValue(definition.filterLabel ?? definition.label);
  }

  return normalizeLookupValue(value);
}

export function getFishSearchTerms(value: string) {
  const selectedKey = getFishKey(value);

  const definitions = FISH_DEFINITIONS.filter(
    (definition) =>
      normalizeLookupValue(definition.filterLabel ?? definition.label) ===
      selectedKey
  );

  const terms = definitions.flatMap((definition) => [
    definition.label,
    ...definition.aliases,
  ]);

  if (terms.length === 0 && value.trim()) {
    terms.push(value.trim());
  }

  return Array.from(
    new Map(
      terms
        .map((term) => term.trim())
        .filter(Boolean)
        .map((term) => [normalizeLookupValue(term), term] as const)
    ).values()
  );
}

export function extractFishNames(value: string) {
  const raw = value.trim();

  if (!raw) {
    return [];
  }

  const normalized = normalizeLookupValue(raw);

  if (IGNORED_VALUES.has(normalized)) {
    return [];
  }

  const exact = getExactDefinition(raw);

  if (exact) {
    return [exact.label];
  }

  const foundDefinitions: FishDefinition[] = [];

  for (const entry of ALL_ALIAS_ENTRIES) {
    if (!containsWholePhrase(normalized, entry.normalizedAlias)) {
      continue;
    }

    if (!foundDefinitions.includes(entry.definition)) {
      foundDefinitions.push(entry.definition);
    }
  }

  // Jeśli znaleźliśmy dokładniejszą odmianę, nie dokładamy ogólnego "Karaś/Pstrąg/Tołpyga".
  const preciseFilterLabels = new Set(
    foundDefinitions
      .filter((definition) => definition.filterLabel && definition.label !== definition.filterLabel)
      .map((definition) => definition.filterLabel)
  );

  const cleaned = foundDefinitions.filter(
    (definition) =>
      !(
        definition.filterLabel &&
        definition.label === definition.filterLabel &&
        preciseFilterLabels.has(definition.filterLabel)
      )
  );

  if (cleaned.length > 0) {
    return cleaned.map((definition) => definition.label);
  }

  // Zachowujemy nieznany, ale wyglądający jak pojedynczy gatunek wpis.
  // Długie "listy ryb" wpisane jako jeden rekord są celowo pomijane.
  const words = raw.split(/\s+/).filter(Boolean);

  if (
    words.length <= 3 &&
    !/[;,|/]/.test(raw) &&
    !IGNORED_VALUES.has(normalized)
  ) {
    return [titleCasePolish(raw)];
  }

  return [];
}

export function normalizeFishList(values: string[]) {
  const result = new Map<string, string>();

  for (const value of values) {
    for (const fishName of extractFishNames(String(value ?? ""))) {
      result.set(getFishKey(fishName) + "::" + normalizeLookupValue(fishName), fishName);
    }
  }

  return Array.from(result.values()).sort((a, b) =>
    a.localeCompare(b, "pl", { sensitivity: "base" })
  );
}

export function normalizeFishFilterOptions(values: string[]) {
  const filters = new Map<string, string>();

  for (const value of values) {
    const fishNames = extractFishNames(String(value ?? ""));

    for (const fishName of fishNames) {
      const definition = getExactDefinition(fishName);
      const label = definition?.filterLabel ?? definition?.label ?? fishName;
      filters.set(getFishKey(label), label);
    }
  }

  return Array.from(filters.values()).sort((a, b) =>
    a.localeCompare(b, "pl", { sensitivity: "base" })
  );
}
