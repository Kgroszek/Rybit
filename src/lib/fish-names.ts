const FISH_NAME_OVERRIDES: Record<string, string> = {
  // Najpopularniejsze gatunki spokojnego żeru
  amur: "Amur",
  boleń: "Boleń",
  brzana: "Brzana",
  certa: "Certa",
  jaź: "Jaź",
  karaś: "Karaś",
  "karaś pospolity": "Karaś pospolity",
  "karaś srebrzysty": "Karaś srebrzysty",
  karp: "Karp",
  kiełb: "Kiełb",
  kleń: "Kleń",
  krąp: "Krąp",
  leszcz: "Leszcz",
  lin: "Lin",
  miętus: "Miętus",
  płoć: "Płoć",
  rozpiór: "Rozpiór",
  różanka: "Różanka",
  świnka: "Świnka",
  ukleja: "Ukleja",
  wzdręga: "Wzdręga",

  // Drapieżniki
  okoń: "Okoń",
  sandacz: "Sandacz",
  sum: "Sum",
  szczupak: "Szczupak",
  węgorz: "Węgorz",

  // Łososiowate i pstrągowe
  głowacica: "Głowacica",
  lipień: "Lipień",
  łosoś: "Łosoś",
  "pstrąg potokowy": "Pstrąg potokowy",
  "pstrąg tęczowy": "Pstrąg tęczowy",
  "pstrąg źródlany": "Pstrąg źródlany",
  troć: "Troć",
  "troć wędrowna": "Troć wędrowna",

  // Jesiotrowate i większe ryby spotykane na łowiskach
  jesiotr: "Jesiotr",
  "jesiotr syberyjski": "Jesiotr syberyjski",
  "jesiotr rosyjski": "Jesiotr rosyjski",
  sterlet: "Sterlet",

  // Mniejsze / mniej typowe gatunki
  ciernik: "Ciernik",
  cierniczek: "Cierniczek",
  głowacz: "Głowacz",
  "głowacz białopłetwy": "Głowacz białopłetwy",
  "głowacz pręgopłetwy": "Głowacz pręgopłetwy",
  koza: "Koza",
  "koza pospolita": "Koza pospolita",
  "koza złotawa": "Koza złotawa",
  piskorz: "Piskorz",
  piekielnica: "Piekielnica",
  słonecznica: "Słonecznica",
  strzebla: "Strzebla",
  "strzebla potokowa": "Strzebla potokowa",
  śliz: "Śliz",

  // Gatunki obce / inwazyjne / często spotykane lokalnie
  "babka bycza": "Babka bycza",
  "babka łysa": "Babka łysa",
  "babka rurkonosa": "Babka rurkonosa",
  "babka szczupła": "Babka szczupła",
  "czebaczek amurski": "Czebaczek amurski",
  "sumik karłowaty": "Sumik karłowaty",
  "trawianka": "Trawianka",

  // Gatunki typowo hodowlane / łowiska komercyjne
  "tołpyga": "Tołpyga",
  "tołpyga biała": "Tołpyga biała",
  "tołpyga pstra": "Tołpyga pstra",

  // Opcja techniczna
  "brak informacji": "Brak informacji",
};

export function getFishKey(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pl-PL");
}

export function normalizeFishName(value: string) {
  const cleanValue = value.trim().replace(/\s+/g, " ");

  if (!cleanValue) {
    return "";
  }

  const key = getFishKey(cleanValue);
  const override = FISH_NAME_OVERRIDES[key];

  if (override) {
    return override;
  }

  return cleanValue.charAt(0).toLocaleUpperCase("pl-PL") + cleanValue.slice(1).toLocaleLowerCase("pl-PL");
}

export function normalizeFishList(values: string[]) {
  const fishMap = new Map<string, string>();

  values.forEach((value) => {
    const normalizedName = normalizeFishName(value);

    if (!normalizedName) {
      return;
    }

    fishMap.set(getFishKey(normalizedName), normalizedName);
  });

  return Array.from(fishMap.values()).sort((a, b) => a.localeCompare(b, "pl"));
}