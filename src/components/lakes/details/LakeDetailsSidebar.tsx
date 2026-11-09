import type { ReactNode } from "react";

import { LakeCorrectionReportButton } from "@/components/dashboard/LakeCorrectionReportButton";
import { MapIcon } from "@/components/icons/MapIcon";
import { ButtonLink, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { LakeDto } from "@/lib/lakes";
import type { LakeDetailsMode } from "./types";
import { getNavigationUrl, getWebsiteUrl } from "./utils";

type LakeDetailsSidebarProps = {
  lake: LakeDto;
  mode: LakeDetailsMode;
};

export function LakeDetailsSidebar({ lake, mode }: LakeDetailsSidebarProps) {
  const hasOpeningHours =
    lake.openingHours.isOpenAllDay || Boolean(lake.openingHours.text?.trim());

  return (
    <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
      <Card>
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold text-text">Najważniejsze informacje</h2>
        </div>
        <div className="space-y-4 px-5 py-5">
          <InfoRow label="Powierzchnia" value={lake.details.area} />
          <InfoRow label="Średnia głębokość" value={lake.details.averageDepth} />
          <InfoRow label="Rodzaj dna" value={lake.details.bottomType} />
          <InfoRow label="Typ wody" value={lake.details.waterType} />
        </div>
      </Card>

      {hasOpeningHours && (
        <Card>
          <div className="px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Godziny</p>
            <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-text">
              {lake.openingHours.isOpenAllDay ? "Otwarte całodobowo" : lake.openingHours.text}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold text-text">Adres</h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm font-bold text-text">{lake.address.street || lake.name}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text-secondary">
            {lake.address.postalCode} {lake.address.city}
            {lake.address.voivodeship ? `\nwoj. ${lake.address.voivodeship}` : ""}
          </p>
          <a
            href={getNavigationUrl(lake.lat, lake.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName({
              variant: "primary",
              size: "md",
              fullWidth: true,
              className: "mt-4",
            })}
          >
            <MapIcon className="h-4 w-4" />
            Prowadź w Google Maps
          </a>
        </div>
      </Card>

      <Card>
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold text-text">Kontakt</h2>
        </div>
        <div className="space-y-4 px-5 py-5">
          <ContactRow label="Nazwa" value={lake.contact.name} />
          <ContactRow label="Telefon" value={lake.contact.phone} type="phone" />
          <ContactRow label="E-mail" value={lake.contact.email} type="email" />
          <ContactRow label="Strona" value={lake.contact.website} type="website" />
        </div>
      </Card>

      {mode === "authenticated" ? (
        <Card variant="subtle">
          <div className="px-5 py-5">
            <h2 className="font-display text-lg font-bold text-text">Zauważyłeś błąd?</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Pomóż utrzymać informacje o łowisku w aktualnym stanie.
            </p>
            <div className="mt-4">
              <LakeCorrectionReportButton lakeSlug={lake.slug} />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-primary-200 bg-primary-50 shadow-none">
          <div className="px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Dla właściciela</p>
            <h2 className="mt-2 font-display text-lg font-bold text-text">To Twoje łowisko?</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Przejmij profil i zarządzaj opisem, zdjęciami, kontaktem, cennikiem oraz regulaminem.
            </p>
            <ButtonLink
              href={`/lowiska-w-polsce/${lake.slug}/przejmij`}
              variant="primary"
              size="md"
              fullWidth
              className="mt-4"
            >
              Przejmij profil łowiska
            </ButtonLink>
          </div>
        </Card>
      )}
    </aside>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const normalized = normalizeValue(value);

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-none last:pb-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="max-w-[58%] text-right text-sm font-bold text-text">{normalized}</span>
    </div>
  );
}

function ContactRow({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: "text" | "phone" | "email" | "website";
}) {
  const normalized = normalizeValue(value);
  const empty = normalized === "Brak danych";

  let content: ReactNode = normalized;

  if (!empty && type === "phone") {
    content = <a href={`tel:${normalized.replace(/\s+/g, "")}`} className="text-primary hover:underline">{normalized}</a>;
  }
  if (!empty && type === "email") {
    content = <a href={`mailto:${normalized}`} className="break-all text-primary hover:underline">{normalized}</a>;
  }
  if (!empty && type === "website") {
    content = <a href={getWebsiteUrl(normalized)} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">{normalized}</a>;
  }

  return (
    <div className="border-b border-border pb-4 last:border-none last:pb-0">
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      <div className="mt-1 text-sm font-bold text-text">{content}</div>
    </div>
  );
}

function normalizeValue(value: string) {
  const clean = String(value || "").trim();
  if (!clean || clean.toLowerCase() === "brak" || clean.toLowerCase() === "brak danych") {
    return "Brak danych";
  }
  return clean;
}
