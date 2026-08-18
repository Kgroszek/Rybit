import {
  createLakeWebsiteSection,
  type LakeWebsiteSection,
  type LakeWebsiteSectionDefaults,
  type LakeWebsiteSectionType,
} from "@/lib/lake-website-sections";
import type { LakeWebsiteTemplateKey } from "@/lib/lake-websites";

type SectionPreset = {
  type: LakeWebsiteSectionType;
  variant: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  buttonLabel?: string;
  buttonTargetType?: LakeWebsiteSectionType;
};

export type LakeWebsiteTemplatePreset = {
  key: LakeWebsiteTemplateKey;
  palette: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  sections: SectionPreset[];
};

export const LAKE_WEBSITE_TEMPLATE_PRESETS: Record<
  LakeWebsiteTemplateKey,
  LakeWebsiteTemplatePreset
> = {
  waterline: {
    key: "waterline",
    palette: {
      primaryColor: "#155EEF",
      accentColor: "#6ED5D0",
      backgroundColor: "#FFFFFF",
      textColor: "#0B1628",
    },
    sections: [
      {
        type: "hero",
        variant: "cover",
        eyebrow: "Woda · natura · emocje",
        subtitle:
          "Miejsce stworzone dla tych, którzy nad wodą szukają czegoś więcej.",
        buttonLabel: "Poznaj łowisko",
        buttonTargetType: "about",
      },
      {
        type: "about",
        variant: "image-right",
        eyebrow: "Poznaj miejsce",
        title: "Woda, do której chce się wracać",
      },
      {
        type: "gallery",
        variant: "grid",
        eyebrow: "Nad wodą",
        title: "Zobacz klimat łowiska",
      },
      {
        type: "fish",
        variant: "pills",
        eyebrow: "Mieszkańcy wody",
        title: "Ryby",
      },
      {
        type: "priceList",
        variant: "list",
        eyebrow: "Zaplanuj pobyt",
        title: "Cennik",
      },
      {
        type: "cta",
        variant: "image",
        eyebrow: "Twoja następna wyprawa",
        title: "Do zobaczenia nad wodą",
        text:
          "Sprawdź warunki, przygotuj sprzęt i zaplanuj swój pobyt.",
        buttonLabel: "Kontakt",
        buttonTargetType: "contact",
      },
      {
        type: "contact",
        variant: "cards",
        eyebrow: "Kontakt",
        title: "Masz pytania? Napisz lub zadzwoń",
      },
    ],
  },

  "carp-lodge": {
    key: "carp-lodge",
    palette: {
      primaryColor: "#C69A63",
      accentColor: "#71815D",
      backgroundColor: "#0D1110",
      textColor: "#F4F0E7",
    },
    sections: [
      {
        type: "hero",
        variant: "split",
        eyebrow: "Private fishery",
        subtitle:
          "Spokój, wymagająca woda i miejsce stworzone dla świadomego wędkarstwa.",
        buttonLabel: "Zaplanuj zasiadkę",
        buttonTargetType: "contact",
      },
      {
        type: "fish",
        variant: "list",
        eyebrow: "Target species",
        title: "Ryby, po które tu przyjeżdżasz",
      },
      {
        type: "about",
        variant: "image-left",
        eyebrow: "The water",
        title: "Charakter tej wody poznaje się z czasem",
      },
      {
        type: "gallery",
        variant: "wide",
        eyebrow: "Moments",
        title: "Nad wodą",
      },
      {
        type: "rules",
        variant: "list",
        eyebrow: "Respect the water",
        title: "Najważniejsze zasady",
      },
      {
        type: "priceList",
        variant: "list",
        eyebrow: "Access",
        title: "Cennik",
      },
      {
        type: "cta",
        variant: "image",
        eyebrow: "Next session",
        title: "Zaplanuj kolejną zasiadkę",
        text:
          "Skontaktuj się z nami i sprawdź dostępność stanowisk.",
        buttonLabel: "Skontaktuj się",
        buttonTargetType: "contact",
      },
      {
        type: "contact",
        variant: "cards",
        eyebrow: "Contact",
        title: "Rezerwacje i kontakt",
      },
    ],
  },

  "wild-water": {
    key: "wild-water",
    palette: {
      primaryColor: "#3F654F",
      accentColor: "#A77A4B",
      backgroundColor: "#F4F0E5",
      textColor: "#263129",
    },
    sections: [
      {
        type: "hero",
        variant: "split",
        eyebrow: "Blisko natury",
        subtitle:
          "Spokojna woda, cisza i przestrzeń do prawdziwego odpoczynku.",
        buttonLabel: "Odkryj to miejsce",
        buttonTargetType: "about",
      },
      {
        type: "about",
        variant: "image-right",
        eyebrow: "Nasza historia",
        title: "Miejsce stworzone przez naturę",
      },
      {
        type: "gallery",
        variant: "wide",
        eyebrow: "Kadry znad wody",
        title: "Galeria",
      },
      {
        type: "fish",
        variant: "pills",
        eyebrow: "W naszej wodzie",
        title: "Ryby",
      },
      {
        type: "priceList",
        variant: "list",
        eyebrow: "Przed przyjazdem",
        title: "Cennik",
      },
      {
        type: "rules",
        variant: "list",
        eyebrow: "Dbamy o wodę",
        title: "Zasady",
      },
      {
        type: "contact",
        variant: "cards",
        eyebrow: "Znajdź nas",
        title: "Kontakt",
      },
    ],
  },

  "fishery-club": {
    key: "fishery-club",
    palette: {
      primaryColor: "#121212",
      accentColor: "#F05A28",
      backgroundColor: "#FFFFFF",
      textColor: "#111111",
    },
    sections: [
      {
        type: "hero",
        variant: "cover",
        eyebrow: "Fishery / Poland",
        subtitle:
          "Woda. Ryby. Wynik. Wszystko, czego potrzebujesz przed kolejną sesją.",
        buttonLabel: "Sprawdź łowisko",
        buttonTargetType: "about",
      },
      {
        type: "about",
        variant: "text",
        eyebrow: "01 / O łowisku",
        title: "Nie przyjeżdżasz tu przypadkiem",
      },
      {
        type: "fish",
        variant: "list",
        eyebrow: "02 / Gatunki",
        title: "Ryby",
      },
      {
        type: "gallery",
        variant: "grid",
        eyebrow: "03 / Kadry",
        title: "Galeria",
      },
      {
        type: "cta",
        variant: "solid",
        eyebrow: "04 / Sesja",
        title: "Następna wyprawa zaczyna się tutaj",
        text:
          "Sprawdź zasady i skontaktuj się z łowiskiem.",
        buttonLabel: "Kontakt",
        buttonTargetType: "contact",
      },
      {
        type: "priceList",
        variant: "list",
        eyebrow: "05 / Cennik",
        title: "Opłaty",
      },
      {
        type: "rules",
        variant: "list",
        eyebrow: "06 / Zasady",
        title: "Regulamin",
      },
      {
        type: "contact",
        variant: "cards",
        eyebrow: "07 / Kontakt",
        title: "Znajdź nas nad wodą",
      },
    ],
  },
};

export function getLakeWebsiteTemplatePreset(
  key: LakeWebsiteTemplateKey
) {
  return LAKE_WEBSITE_TEMPLATE_PRESETS[key];
}

export function buildTemplateSections({
  templateKey,
  currentSections,
  defaults,
  preview = false,
}: {
  templateKey: LakeWebsiteTemplateKey;
  currentSections: LakeWebsiteSection[];
  defaults: LakeWebsiteSectionDefaults;
  preview?: boolean;
}) {
  const preset = getLakeWebsiteTemplatePreset(templateKey);
  const remaining = new Map<LakeWebsiteSectionType, LakeWebsiteSection[]>();

  currentSections.forEach((section) => {
    const list = remaining.get(section.type) || [];
    list.push(section);
    remaining.set(section.type, list);
  });

  const built = preset.sections.map((sectionPreset, index) => {
    const existing = remaining.get(sectionPreset.type)?.shift();

    const base = createLakeWebsiteSection(
      sectionPreset.type,
      defaults,
      preview
        ? `preview-${templateKey}-${sectionPreset.type}-${index}`
        : `${templateKey}-${sectionPreset.type}-${index}-${createShortId()}`
    );

    return {
      ...base,
      ...(existing
        ? {
            eyebrow: existing.eyebrow,
            title: existing.title,
            subtitle: existing.subtitle,
            text: existing.text,
            imageUrl: existing.imageUrl,
            images: existing.images,
            buttonLabel: existing.buttonLabel,
            dataSource: existing.dataSource,
            items: existing.items,
          }
        : {}),
      id: base.id,
      variant: sectionPreset.variant,
      eyebrow:
        existing?.eyebrow ||
        sectionPreset.eyebrow ||
        base.eyebrow,
      title:
        existing?.title ||
        sectionPreset.title ||
        base.title,
      subtitle:
        existing?.subtitle ||
        sectionPreset.subtitle ||
        base.subtitle,
      text:
        existing?.text ||
        sectionPreset.text ||
        base.text,
      imageUrl:
        existing?.imageUrl ||
        base.imageUrl,
      images:
        existing?.images?.length
          ? existing.images
          : base.images,
      buttonLabel:
        existing?.buttonLabel ||
        sectionPreset.buttonLabel ||
        base.buttonLabel,
      dataSource:
        existing?.dataSource ||
        base.dataSource,
      items:
        existing?.items,
      buttonHref: undefined,
    } satisfies LakeWebsiteSection;
  });

  return built.map((section, index) => {
    const presetSection = preset.sections[index];
    const targetType = presetSection?.buttonTargetType;

    if (!targetType || !section.buttonLabel) {
      return section;
    }

    const target = built.find((item) => item.type === targetType);

    return {
      ...section,
      buttonHref: target ? `#${target.id}` : undefined,
    };
  });
}

function createShortId() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    "randomUUID" in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10);
}
