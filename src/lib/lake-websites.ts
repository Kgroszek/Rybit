export const LAKE_WEBSITE_TEMPLATES = [
  {
    key: "waterline",
    label: "Waterline",
    category: "Premium / nowoczesny",
    description:
      "Nowoczesny, jasny projekt z mocnym układem informacji, fotografią i czytelną strukturą strony.",
    bestFor: "Łowiska komercyjne, premium, nowoczesne",
    features: ["Jasny layout", "Galeria premium", "Nowoczesny"],
    swatches: ["#155EEF", "#6ED5D0", "#071526", "#FFFFFF"],
  },
  {
    key: "carp-lodge",
    label: "Carp Lodge",
    category: "Lodge / outdoor premium",
    description:
      "Ciepły, butikowy projekt inspirowany outdoor hospitality i małymi resortami nad wodą. Kremowe tła, editorial serif, kolaż fotografii i mocne sekcje.",
    bestFor: "Łowiska karpiowe, klubowe, noclegi, obiekty premium",
    features: ["Editorial serif", "Photo collage", "Warm lodge"],
    swatches: ["#B85B3E", "#71765A", "#211B18", "#F5EFE7"],
  },
  {
    key: "wild-water",
    label: "Wild Water",
    category: "Nature / spokojny",
    description:
      "Kremowe powierzchnie, naturalne kolory i eleganckie nagłówki serif. Bardziej jak resort nad wodą niż typowa strona wędkarska.",
    bestFor: "Jeziora, agroturystyka, łowiska w naturze",
    features: ["Serif", "Organic shapes", "Natural palette"],
    swatches: ["#3F654F", "#A77A4B", "#F4F0E5", "#263129"],
  },
  {
    key: "fishery-club",
    label: "Fishery Club",
    category: "Editorial / sportowy",
    description:
      "Mocny kontrast, brutalistyczne detale i ogromna typografia. Projekt przypominający nowoczesny magazyn sportowy.",
    bestFor: "Sportowe łowiska, zawody, mocne marki",
    features: ["Editorial", "Numeracja", "High contrast"],
    swatches: ["#121212", "#F05A28", "#FFFFFF", "#111111"],
  },
] as const;

export type LakeWebsiteTemplateKey =
  (typeof LAKE_WEBSITE_TEMPLATES)[number]["key"];

const LEGACY_TEMPLATE_KEYS = new Set([
  "modern",
  "classic",
  "nature",
  "editorial",
]);

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "blog",
  "dashboard",
  "lowiska",
  "moje-lowiska",
  "login",
  "register",
  "kontakt",
  "static",
  "assets",
  "mail",
  "smtp",
  "ftp",
  "support",
  "help",
]);

export function resolveLakeWebsiteTemplateKey(
  value: string | null | undefined
): LakeWebsiteTemplateKey {
  if (value === "carp-lodge") return "carp-lodge";
  if (value === "wild-water") return "wild-water";
  if (value === "fishery-club") return "fishery-club";
  if (value === "waterline") return "waterline";

  if (value === "classic" || value === "nature") {
    return "wild-water";
  }

  if (value === "editorial") {
    return "fishery-club";
  }

  return "waterline";
}

export function normalizeLakeWebsiteSubdomain(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function validateLakeWebsiteSubdomain(value: string) {
  const normalized = normalizeLakeWebsiteSubdomain(value);

  if (normalized.length < 3) {
    return "Adres musi mieć co najmniej 3 znaki.";
  }

  if (normalized.length > 40) {
    return "Adres może mieć maksymalnie 40 znaków.";
  }

  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(normalized)) {
    return "Adres może zawierać tylko małe litery, cyfry i myślniki.";
  }

  if (RESERVED_SUBDOMAINS.has(normalized)) {
    return "Ten adres jest zarezerwowany przez Rybio.";
  }

  return null;
}

export function isLakeWebsiteTemplate(value: string) {
  return (
    LAKE_WEBSITE_TEMPLATES.some((template) => template.key === value) ||
    LEGACY_TEMPLATE_KEYS.has(value)
  );
}

export function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const color = value.trim();

  return /^#[0-9a-fA-F]{6}$/.test(color)
    ? color.toUpperCase()
    : fallback;
}

export function getRootDomain() {
  return (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    "rybio.pl"
  )
    .trim()
    .toLowerCase();
}

export function getLakeWebsiteUrl(subdomain: string) {
  const rootDomain = getRootDomain();

  if (
    process.env.NODE_ENV === "development" &&
    (rootDomain === "localhost" || rootDomain.endsWith(".localhost"))
  ) {
    return `http://${subdomain}.localhost:3000`;
  }

  return `https://${subdomain}.${rootDomain}`;
}
