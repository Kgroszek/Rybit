import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import {
  getContactPhone,
  getFishSummary,
} from "@/components/lake-websites/templates/waterline/waterline-utils";

export function WaterlineQuickInfo({
  data,
}: {
  data: PublicLakeWebsiteData;
}) {
  const fishSection =
    data.website.sections.find(
      (section) => section.type === "fish"
    );

  const phone = getContactPhone(data);

  const items = [
    {
      title: "Lokalizacja",
      description:
        data.lake.city ||
        "Sprawdź dokładny adres w sekcji kontakt.",
    },
    {
      title: "Region",
      description:
        data.lake.voivodeship ||
        "Informacja dostępna u właściciela.",
    },
    {
      title: "Ryby",
      description: getFishSummary(
        fishSection,
        data,
        3
      ),
    },
    {
      title: "Kontakt",
      description:
        phone ||
        data.website.contactEmail ||
        data.lake.contactEmail ||
        "Dane kontaktowe znajdziesz niżej.",
    },
  ];

  return (
    <div className="bg-[#F5F6F2] pb-[22px]">
      <div className="mx-auto grid w-[min(1260px,calc(100%-40px))] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 max-[720px]:w-[calc(100%-28px)]">
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

            <div className="min-w-0">
              <strong className="block text-[13px] font-extrabold text-[#16211D]">
                {item.title}
              </strong>
              <span className="mt-1 block break-words text-[12px] leading-5 text-[#66706B]">
                {item.description}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
