import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import { getFishItems } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function WaterlineQuickInfo({
  data,
}: {
  data: PublicLakeWebsiteData;
}) {
  const fishSection =
    data.website.sections.find(
      (section) => section.type === "fish"
    );

  const fishCount =
    getFishItems(fishSection, data).length;

  const hasContact = Boolean(
    data.website.contactPhone ||
      data.website.contactEmail ||
      data.lake.contactPhone ||
      data.lake.contactEmail
  );

  const items = [
    {
      title: "Gatunki ryb",
      description:
        fishCount > 0
          ? `${fishCount} ${
              fishCount === 1
                ? "gatunek"
                : "gatunków"
            } w danych łowiska.`
          : "Szczegóły dostępne u właściciela.",
    },
    {
      title: "Cennik",
      description:
        data.lake.priceList.length > 0
          ? `${data.lake.priceList.length} pozycji w aktualnym cenniku.`
          : "Aktualne opłaty u właściciela.",
    },
    {
      title: "Regulamin",
      description:
        data.lake.rules.length > 0
          ? `${data.lake.rules.length} najważniejszych zasad na stronie.`
          : "Szczegółowe zasady u właściciela.",
    },
    {
      title: "Kontakt",
      description: hasContact
        ? "Dane kontaktowe dostępne na stronie."
        : "Skontaktuj się przez profil łowiska.",
    },
  ];

  return (
    <div className="bg-[#F5F6F2] pb-[22px]">
      <div className="mx-auto grid w-[min(1260px,calc(100%-40px))] grid-cols-4 gap-3 max-[1050px]:grid-cols-2 max-[720px]:w-[calc(100%-28px)] max-[720px]:grid-cols-1">
        {items.map((item, index) => (
          <article
            key={item.title}
            className="flex items-start gap-3.5 rounded-2xl border border-[#DFE4DE] bg-white p-[18px]"
          >
            <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-[#E9F1ED] text-[11px] font-black text-[var(--waterline-primary)]">
              {String(index + 1).padStart(
                2,
                "0"
              )}
            </span>

            <div>
              <strong className="block text-[13px] font-extrabold text-[#16211D]">
                {item.title}
              </strong>
              <span className="mt-1 block text-[12px] leading-5 text-[#66706B]">
                {item.description}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
