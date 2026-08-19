import type { Metadata } from "next";

export const SEO_LAKES_SITE_URL = "https://rybio.pl";

type SeoLandingLink = {
  href: string;
  label: string;
};

export type SeoLakesLandingConfig = {
  slug: string;
  canonicalVoivodeship: string;
  voivodeshipAliases: string[];
  voivodeshipLabel: string;

  metadata: {
    title: string;
    description: string;
    keywords: string[];
    openGraphTitle: string;
    openGraphDescription: string;
    twitterTitle: string;
    twitterDescription: string;
    imageAlt: string;
  };

  jsonLd: {
    name: string;
    description: string;
    about: string[];
  };

  headerSubtitle?: string;
  badge: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;

  stats: {
    countLabel: string;
    second: { value: string; label: string };
    third: { value: string; label: string };
  };

  introTitle: string;
  introParagraphs: string[];

  sideCard: {
    title: string;
    description: string;
    primary: SeoLandingLink;
    secondary: SeoLandingLink;
  };

  bottomTitle: string;
  bottomParagraphs: string[];
};

type RegionInput = {
  slug: string;
  canonical: string;
  aliases: string[];
  label: string;
  adjective: string;
  locative: string;
  regionPhrase: string;
  extraKeywords?: string[];
  introFirst?: string;
  special?: Partial<
    Pick<
      SeoLakesLandingConfig,
      | "headerSubtitle"
      | "badge"
      | "heroTitle"
      | "heroDescription"
      | "heroCta"
      | "stats"
      | "introTitle"
      | "introParagraphs"
      | "sideCard"
      | "bottomTitle"
      | "bottomParagraphs"
    >
  >;
};

const accountSideCard: SeoLakesLandingConfig["sideCard"] = {
  title: "Chcesz zapisywać swoje połowy?",
  description:
    "Załóż konto w Rybio, dodawaj połowy ze zdjęciami, zapisuj ulubione łowiska, oceniaj miejsca i korzystaj z rankingów największych oraz najdłuższych ryb.",
  primary: {
    href: "/register",
    label: "Załóż konto",
  },
  secondary: {
    href: "/login",
    label: "Zaloguj się",
  },
};

function createRegionConfig(input: RegionInput): SeoLakesLandingConfig {
  const baseKeywords = [
    `łowiska ${input.adjective}`,
    `łowiska w województwie ${input.locative}`,
    `gdzie na ryby ${input.adjective}`,
    `łowiska komercyjne ${input.adjective}`,
    `łowiska karpiowe ${input.adjective}`,
    `łowiska PZW ${input.adjective}`,
    `wędkarstwo ${input.adjective}`,
    `baza łowisk ${input.adjective}`,
    ...(input.extraKeywords ?? []),
    "Rybio",
  ];

  const introParagraphs = [
    input.introFirst ??
      `Województwo ${input.adjective} oferuje wiele ciekawych miejsc dla wędkarzy: łowiska komercyjne, zbiorniki rekreacyjne, łowiska karpiowe, miejsca dobre pod feeder, method feeder, spinning oraz spokojne wyprawy rodzinne. Dzięki Rybio możesz szybciej sprawdzić podstawowe informacje o łowisku przed wyjazdem.`,
    `Na tej stronie znajdziesz łowiska ${input.adjective} dostępne w bazie Rybio. Możesz filtrować je według rodzaju łowiska, typu łowienia, gatunku ryb oraz udogodnień, takich jak parking, pomost, wędkowanie nocne, domki, toaleta, sklep, altana czy możliwość płatności kartą.`,
  ];

  const bottomParagraphs = [
    `Wybierając łowisko w województwie ${input.locative}, warto sprawdzić lokalizację, gatunki ryb, regulamin, cennik, możliwość nocnego wędkowania, dostęp do parkingu, pomostów oraz zaplecza dla wędkarzy. Dla wielu osób ważne są również domki, toaleta, sklep z przynętami, zadaszone stanowiska i wygodny dojazd.`,
    `Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu możesz szybciej porównać łowiska, sprawdzić opis, zdjęcia, udogodnienia i zdecydować, gdzie warto zaplanować kolejną wyprawę wędkarską ${input.regionPhrase}.`,
  ];

  return {
    slug: input.slug,
    canonicalVoivodeship: input.canonical,
    voivodeshipAliases: input.aliases,
    voivodeshipLabel: input.label,

    metadata: {
      title: `Łowiska ${input.adjective} – łowiska w województwie ${input.locative} | Rybio`,
      description: `Sprawdź łowiska w województwie ${input.locative}. Przeglądaj łowiska ${input.adjective}, filtruj miejsca według typu łowiska, gatunków ryb, udogodnień i lokalizacji.`,
      keywords: baseKeywords,
      openGraphTitle: `Łowiska ${input.adjective} – baza łowisk w województwie ${input.locative} | Rybio`,
      openGraphDescription: `Znajdź łowiska w województwie ${input.locative}. Sprawdzaj gatunki ryb, typ łowiska, udogodnienia, lokalizację i informacje przydatne przed wyprawą.`,
      twitterTitle: `Łowiska ${input.adjective} | Rybio`,
      twitterDescription: `Przeglądaj łowiska w województwie ${input.locative} i znajdź miejsce na kolejną wyprawę nad wodę.`,
      imageAlt: `Łowiska ${input.adjective} – Rybio`,
    },

    jsonLd: {
      name: `Łowiska ${input.adjective}`,
      description: `Publiczna baza łowisk w województwie ${input.locative}. Miejsca na ryby, łowiska komercyjne, łowiska PZW, łowiska karpiowe i miejsca na wyprawy wędkarskie.`,
      about: [
        `łowiska ${input.adjective}`,
        `łowiska w województwie ${input.locative}`,
        `wędkarstwo ${input.adjective}`,
        `gdzie na ryby ${input.adjective}`,
      ],
    },

    badge:
      input.special?.badge ??
      `Publiczna baza łowisk w województwie ${input.locative}`,

    heroTitle:
      input.special?.heroTitle ??
      `Łowiska ${input.adjective} – znajdź miejsce na ryby w województwie ${input.locative}`,

    heroDescription:
      input.special?.heroDescription ??
      `Szukasz łowiska ${input.regionPhrase}? Sprawdź publiczną bazę łowisk w województwie ${input.locative}, porównuj miejsca według gatunków ryb, typu łowienia, udogodnień i lokalizacji. Znajdź łowisko na karpia, amura, szczupaka, sandacza, suma, lina albo leszcza i lepiej zaplanuj kolejną wyprawę nad wodę.`,

    heroCta:
      input.special?.heroCta ?? `Przeglądaj łowiska ${input.adjective}`,

    stats:
      input.special?.stats ?? {
        countLabel: "łowisk w bazie",
        second: {
          value: input.label,
          label: "województwo",
        },
        third: {
          value: "Filtry",
          label: "ryby i udogodnienia",
        },
      },

    introTitle:
      input.special?.introTitle ??
      `Łowiska w województwie ${input.locative}`,

    introParagraphs:
      input.special?.introParagraphs ?? introParagraphs,

    sideCard:
      input.special?.sideCard ?? accountSideCard,

    bottomTitle:
      input.special?.bottomTitle ??
      `Jak wybrać dobre łowisko w województwie ${input.locative}?`,

    bottomParagraphs:
      input.special?.bottomParagraphs ?? bottomParagraphs,

    headerSubtitle: input.special?.headerSubtitle,
  };
}

export function createSeoLakesMetadata(
  config: SeoLakesLandingConfig
): Metadata {
  return {
    metadataBase: new URL(SEO_LAKES_SITE_URL),
    title: config.metadata.title,
    description: config.metadata.description,
    keywords: config.metadata.keywords,
    alternates: {
      canonical: `/${config.slug}`,
    },
    openGraph: {
      title: config.metadata.openGraphTitle,
      description: config.metadata.openGraphDescription,
      url: `/${config.slug}`,
      siteName: "Rybio",
      locale: "pl_PL",
      type: "website",
      images: [
        {
          url: "/og-lakes.jpg",
          width: 1200,
          height: 630,
          alt: config.metadata.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.metadata.twitterTitle,
      description: config.metadata.twitterDescription,
      images: ["/og-lakes.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const seoLakesLandings = {
  mazowieckie: createRegionConfig({
    slug: "lowiska-mazowieckie",
    canonical: "mazowieckie",
    aliases: ["mazowieckie", "mazowsze", "mazowiecka", "mazowiecki"],
    label: "Mazowieckie",
    adjective: "mazowieckie",
    locative: "mazowieckim",
    regionPhrase: "na Mazowszu",
    extraKeywords: [
      "łowiska na Mazowszu",
      "łowiska Warszawa",
      "łowiska Siedlce",
      "łowiska Garwolin",
    ],
  }),

  slaskie: createRegionConfig({
    slug: "lowiska-slaskie",
    canonical: "śląskie",
    aliases: [
      "śląskie",
      "slaskie",
      "śląsk",
      "slask",
      "śląski",
      "slaski",
      "śląska",
      "slaska",
    ],
    label: "Śląskie",
    adjective: "śląskie",
    locative: "śląskim",
    regionPhrase: "na Śląsku",
    extraKeywords: [
      "łowiska slaskie",
      "łowiska na Śląsku",
      "łowiska Katowice",
      "łowiska Gliwice",
      "łowiska Częstochowa",
    ],
  }),

  lubelskie: createRegionConfig({
    slug: "lowiska-lubelskie",
    canonical: "lubelskie",
    aliases: ["lubelskie", "lubelska", "lubelski"],
    label: "Lubelskie",
    adjective: "lubelskie",
    locative: "lubelskim",
    regionPhrase: "na Lubelszczyźnie",
    extraKeywords: ["łowiska na Lubelszczyźnie"],
  }),

  malopolskie: createRegionConfig({
    slug: "lowiska-malopolskie",
    canonical: "małopolskie",
    aliases: [
      "małopolskie",
      "malopolskie",
      "małopolska",
      "malopolska",
      "małopolski",
      "malopolski",
    ],
    label: "Małopolskie",
    adjective: "małopolskie",
    locative: "małopolskim",
    regionPhrase: "w Małopolsce",
    extraKeywords: ["łowiska w Małopolsce"],
  }),

  podkarpackie: createRegionConfig({
    slug: "lowiska-podkarpackie",
    canonical: "podkarpackie",
    aliases: [
      "podkarpackie",
      "podkarpacie",
      "podkarpacki",
      "podkarpacka",
    ],
    label: "Podkarpackie",
    adjective: "podkarpackie",
    locative: "podkarpackim",
    regionPhrase: "na Podkarpaciu",
    extraKeywords: [
      "łowiska na Podkarpaciu",
      "łowiska Rzeszów",
      "łowiska Przemyśl",
      "łowiska Krosno",
    ],
  }),

  wielkopolskie: createRegionConfig({
    slug: "lowiska-wielkopolskie",
    canonical: "wielkopolskie",
    aliases: [
      "wielkopolskie",
      "wielkopolska",
      "wielkopolski",
    ],
    label: "Wielkopolskie",
    adjective: "wielkopolskie",
    locative: "wielkopolskim",
    regionPhrase: "w Wielkopolsce",
    extraKeywords: ["łowiska w Wielkopolsce"],
    introFirst:
      "Województwo wielkopolskie to region z wieloma ciekawymi miejscami dla wędkarzy. Możesz znaleźć tu łowiska komercyjne, zbiorniki rekreacyjne, łowiska karpiowe, miejsca dobre pod feeder, method feeder, spinning oraz spokojne wyprawy rodzinne. Dzięki Rybio możesz szybciej sprawdzić podstawowe informacje o łowisku przed wyjazdem.",
  }),

  zachodniopomorskie: createRegionConfig({
    slug: "lowiska-zachodniopomorskie",
    canonical: "zachodniopomorskie",
    aliases: [
      "zachodniopomorskie",
      "zachodniopomorski",
      "pomorze zachodnie",
    ],
    label: "Zachodniopomorskie",
    adjective: "zachodniopomorskie",
    locative: "zachodniopomorskim",
    regionPhrase: "na Pomorzu Zachodnim",
    extraKeywords: [
      "łowiska Pomorze Zachodnie",
      "łowiska Szczecin",
      "łowiska Koszalin",
      "łowiska Kołobrzeg",
      "łowiska Stargard",
      "łowiska Świnoujście",
    ],
    special: {
      headerSubtitle: "Łowiska w Polsce",
      badge: "Łowiska w województwie zachodniopomorskim",
      heroTitle:
        "Łowiska zachodniopomorskie – znajdź miejsce na ryby w regionie",
      heroDescription:
        "Szukasz łowiska w województwie zachodniopomorskim? Sprawdź bazę łowisk w Rybio i porównuj miejsca według lokalizacji, gatunków ryb, typu łowiska oraz dostępnych udogodnień. Znajdziesz tu łowiska komercyjne, PZW, karpiowe i miejsca dobre na weekendową wyprawę nad wodę.",
      stats: {
        countLabel: "łowisk w regionie",
        second: {
          value: "Filtry",
          label: "ryby i udogodnienia",
        },
        third: {
          value: "Mapa",
          label: "lokalizacja łowisk",
        },
      },
      introParagraphs: [
        "Województwo zachodniopomorskie kojarzy się przede wszystkim z wodą, jeziorami, rzekami i dostępem do morza, dlatego jest ciekawym kierunkiem dla wędkarzy szukających nowych miejsc na wyprawę. W bazie Rybio możesz sprawdzić łowiska z tego regionu i szybciej porównać, które miejsce będzie najlepsze pod Twój sposób łowienia.",
        "Na tej stronie znajdziesz łowiska zachodniopomorskie dostępne w bazie Rybio. Możesz filtrować je po gatunkach ryb, typie łowiska, udogodnieniach oraz miejscowości. Dzięki temu łatwiej wybierzesz miejsce na krótkie łowienie, weekendowy wyjazd albo dłuższą zasiadkę.",
      ],
      sideCard: {
        title: "Znasz łowisko z tego regionu?",
        description:
          "Pomóż rozbudować bazę Rybio. Możesz dodać łowisko, uzupełnić informacje, dodać zdjęcia albo zgłosić poprawkę do istniejącego profilu.",
        primary: {
          href: "/dashboard/lakes/new",
          label: "Dodaj łowisko",
        },
        secondary: {
          href: "/kontakt",
          label: "Skontaktuj się",
        },
      },
      bottomTitle: "Gdzie na ryby w zachodniopomorskim?",
      bottomParagraphs: [
        "Przed wyjazdem nad wodę warto sprawdzić kilka podstawowych informacji: regulamin łowiska, cennik, wymagane zezwolenia, możliwość rezerwacji stanowiska, godziny otwarcia, łowienie nocne oraz dostępne gatunki ryb. W przypadku dalszej wyprawy przydatne mogą być też udogodnienia, takie jak parking, toaleta, domek, pole namiotowe, gastronomia albo możliwość rozbicia namiotu.",
        "Rybio pomaga zebrać te informacje w jednym miejscu. Dzięki temu możesz szybciej porównać łowiska w województwie zachodniopomorskim i wybrać miejsce dopasowane do planowanej wyprawy.",
      ],
    },
  }),
} satisfies Record<string, SeoLakesLandingConfig>;
