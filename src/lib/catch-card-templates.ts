export type CatchCardTemplate = {
  key: string;
  publicPath: string;
  format: "story";
  width: number;
  height: number;
};

const CATCH_CARD_TEMPLATES: Record<string, CatchCardTemplate> = {
  szczupak: {
    key: "szczupak",
    publicPath: "/images/catch-cards/szczupak.png",
    format: "story",
    width: 1080,
    height: 1920,
  },
};

export function normalizeCatchCardFishName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCatchCardTemplate(
  fishName: string
): CatchCardTemplate | null {
  const key = normalizeCatchCardFishName(fishName);
  return CATCH_CARD_TEMPLATES[key] ?? null;
}
