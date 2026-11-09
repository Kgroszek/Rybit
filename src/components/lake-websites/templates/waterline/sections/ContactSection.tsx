import type { PublicLakeWebsiteData } from "@/components/lake-websites/types";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import {
  Eyebrow,
} from "@/components/lake-websites/templates/waterline/WaterlineUI";
import {
  getAddress,
  normalizeExternalUrl,
} from "@/components/lake-websites/templates/waterline/waterline-utils";

export function ContactSection({
  section,
  data,
}: {
  section: LakeWebsiteSection;
  data: PublicLakeWebsiteData;
}) {
  const phone =
    data.website.contactPhone ||
    data.lake.contactPhone ||
    "";
  const email =
    data.website.contactEmail ||
    data.lake.contactEmail ||
    "";
  const website =
    data.website.contactWebsite ||
    data.lake.contactWebsite ||
    "";
  const address = getAddress(data);

  return (
    <section
      id={section.id}
      className="bg-white pb-24 pt-10 max-[720px]:pb-[70px]"
    >
      <div className="mx-auto w-[min(1260px,calc(100%-40px))] max-[720px]:w-[calc(100%-28px)]">
        <div className="grid grid-cols-[.9fr_1.1fr] overflow-hidden rounded-3xl bg-[#17211E] text-white max-[1050px]:grid-cols-1">
          <div className="p-12 max-[720px]:px-[26px] max-[720px]:py-[34px]">
            <Eyebrow inverse>
              {section.eyebrow ||
                "Kontakt i rezerwacja"}
            </Eyebrow>

            <h2 className="mt-[14px] text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.02] tracking-[-0.04em]">
              {section.title ||
                "Masz pytanie przed przyjazdem?"}
            </h2>

            <p className="mt-[18px] max-w-[440px] text-[15px] leading-[1.8] text-white/55">
              {section.text ||
                "Skontaktuj się bezpośrednio z właścicielem i ustal szczegóły pobytu."}
            </p>

            {phone ? (
              <a
                href={`tel:${phone.replace(
                  /\s+/g,
                  ""
                )}`}
                className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-[22px] text-[13px] font-extrabold text-[#17211E] transition hover:-translate-y-0.5"
              >
                Zadzwoń teraz
              </a>
            ) : null}
          </div>

          <div className="grid grid-cols-2 border-l border-white/10 max-[1050px]:border-l-0 max-[1050px]:border-t max-[720px]:grid-cols-1">
            <ContactItem
              label="Adres"
              value={
                address ||
                [
                  data.lake.city,
                  data.lake.voivodeship,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                "Brak adresu"
              }
            />
            <ContactItem
              label="Telefon"
              value={phone || "Brak numeru"}
              href={
                phone
                  ? `tel:${phone.replace(
                      /\s+/g,
                      ""
                    )}`
                  : undefined
              }
            />
            <ContactItem
              label="E-mail"
              value={email || "Brak adresu"}
              href={
                email
                  ? `mailto:${email}`
                  : undefined
              }
            />
            <ContactItem
              label="WWW"
              value={
                website
                  ? website.replace(
                      /^https?:\/\//,
                      ""
                    )
                  : "Brak adresu"
              }
              href={
                website
                  ? normalizeExternalUrl(
                      website
                    )
                  : undefined
              }
              external
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  label,
  value,
  href,
  external = false,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const className =
    "flex min-h-[170px] flex-col justify-between border-b border-r border-white/10 p-[26px] transition hover:bg-white/[.04] even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 max-[720px]:min-h-[130px] max-[720px]:border-r-0 max-[720px]:border-b";

  const content = (
    <>
      <span className="text-[10px] font-extrabold uppercase tracking-[.1em] text-white/35">
        {label}
      </span>
      <strong className="mt-6 break-words text-[18px] font-extrabold leading-[1.4] tracking-[-0.02em]">
        {value}
      </strong>
    </>
  );

  if (!href) {
    return (
      <div className={className}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}
