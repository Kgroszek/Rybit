import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import {
  Eyebrow,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import { getFishItems } from "@/components/lake-websites/templates/waterline/waterline-utils";

export function WaterlineHighlights({
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

  const contactAvailable = Boolean(
    data.website.contactPhone ||
      data.website.contactEmail ||
      data.website.contactWebsite ||
      data.lake.contactPhone ||
      data.lake.contactEmail ||
      data.lake.contactWebsite
  );

  const items = [
    {
      title: "Lokalizacja",
      description: [
        data.lake.city,
        data.lake.voivodeship
          ? `woj. ${data.lake.voivodeship}`
          : "",
      ]
        .filter(Boolean)
        .join(", ") || "Dane lokalizacji w profilu łowiska.",
    },
    {
      title: "Galeria",
      description:
        data.lake.images.length > 0
          ? `${data.lake.images.length} ${
              data.lake.images.length === 1
                ? "zdjęcie"
                : "zdjęć"
            } łowiska w bazie.`
          : "Zdjęcia można dodać w edytorze strony.",
    },
    {
      title: "Informacje",
      description:
        fishCount > 0
          ? `Baza zawiera ${fishCount} ${
              fishCount === 1
                ? "gatunek ryby"
                : "gatunków ryb"
            }.`
          : "Dane łowiska można uzupełnić niezależnie w builderze.",
    },
    {
      title: "Kontakt",
      description: contactAvailable
        ? "Bezpośredni kontakt z łowiskiem dostępny poniżej."
        : "Dane kontaktowe można uzupełnić w ustawieniach strony.",
    },
  ];

  return (
    <section className="bg-[#EEF1EB] py-24 max-[720px]:py-[70px]">
      <div className="mx-auto w-[min(1260px,calc(100%-40px))] max-[720px]:w-[calc(100%-28px)]">
        <div className="mb-[38px] flex items-end justify-between gap-10 max-md:flex-col max-md:items-start">
          <div className="max-w-[700px]">
            <Eyebrow>
              Najważniejsze informacje
            </Eyebrow>
            <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#16211D]">
              Wszystko, czego potrzebujesz
              przed przyjazdem.
            </h2>
          </div>

          <p className="max-w-[430px] text-[15px] leading-7 text-[#66706B]">
            Najważniejsze dane pobierane z profilu
            łowiska i ustawień jego strony.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3.5 max-[1050px]:grid-cols-2 max-[720px]:grid-cols-1">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[18px] border border-[#DFE4DE] bg-white p-6"
            >
              <p className="mb-[26px] text-[11px] font-black text-[var(--waterline-primary)]">
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </p>
              <h3 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#16211D]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-[1.7] text-[#66706B]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
