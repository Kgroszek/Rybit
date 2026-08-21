"use client";

import {
  BuilderInput,
  BuilderTextarea,
} from "@/components/owner/website/WebsiteBuilderFields";
import { Button } from "@/components/ui/Button";
import {
  normalizeLakeWebsiteSubdomain,
} from "@/lib/lake-websites";
import { cn } from "@/lib/cn";

export function WebsiteSettingsPanel({
  subdomain,
  rootDomain,
  subdomainError,
  siteName,
  contactPhone,
  contactEmail,
  contactWebsite,
  seoTitle,
  seoDescription,
  published,
  onSubdomain,
  onSiteName,
  onContactPhone,
  onContactEmail,
  onContactWebsite,
  onSeoTitle,
  onSeoDescription,
  onRequestUnpublish,
}: {
  subdomain: string;
  rootDomain: string;
  subdomainError: string | null;
  siteName: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  onSubdomain: (
    value: string
  ) => void;
  onSiteName: (
    value: string
  ) => void;
  onContactPhone: (
    value: string
  ) => void;
  onContactEmail: (
    value: string
  ) => void;
  onContactWebsite: (
    value: string
  ) => void;
  onSeoTitle: (
    value: string
  ) => void;
  onSeoDescription: (
    value: string
  ) => void;
  onRequestUnpublish: () => void;
}) {
  return (
    <div className="p-5 pb-8">
      <PanelHeading
        eyebrow="Ustawienia"
        title="Strona i SEO"
        description="Adres, nazwa strony, dane kontaktowe i informacje dla wyszukiwarek."
      />

      <div
        className="mt-6 grid"
        style={{ rowGap: "22px" }}
      >
        <div>
          <p className="text-xs font-bold text-text-secondary">
            Adres strony
          </p>

          <div
            className={cn(
              "mt-2.5 flex h-11 items-center rounded-control border bg-surface px-3.5 shadow-sm transition focus-within:ring-4",
              subdomainError
                ? "border-danger focus-within:ring-danger-subtle"
                : "border-border-strong focus-within:border-primary focus-within:ring-primary-100"
            )}
          >
            <input
              value={subdomain}
              onChange={(event) =>
                onSubdomain(
                  normalizeLakeWebsiteSubdomain(
                    event.target.value
                  )
                )
              }
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-text outline-none"
              aria-invalid={
                Boolean(
                  subdomainError
                ) || undefined
              }
            />

            <span className="ml-2 shrink-0 text-xs font-semibold text-text-muted">
              .{rootDomain}
            </span>
          </div>

          {subdomainError ? (
            <p className="mt-2 text-xs font-bold leading-5 text-danger-foreground">
              {subdomainError}
            </p>
          ) : (
            <p className="mt-2 text-[10px] leading-4 text-text-muted">
              Adres zostanie zapisany małymi literami, bez polskich znaków.
            </p>
          )}
        </div>

        <BuilderInput
          label="Nazwa strony"
          value={siteName}
          maxLength={120}
          onChange={onSiteName}
        />

        <section className="border-t border-border pt-6">
          <SectionTitle
            title="Dane kontaktowe"
            description="Mogą być inne niż dane na głównym profilu łowiska w Rybio."
          />

          <div className="mt-4 grid gap-4">
            <BuilderInput
              label="Telefon"
              value={contactPhone}
              maxLength={80}
              onChange={
                onContactPhone
              }
            />

            <BuilderInput
              label="E-mail"
              type="email"
              value={contactEmail}
              maxLength={160}
              onChange={
                onContactEmail
              }
            />

            <BuilderInput
              label="Strona / link"
              value={contactWebsite}
              maxLength={1400}
              onChange={
                onContactWebsite
              }
            />
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <SectionTitle
            title="SEO"
            description="Tytuł i opis używane przez publiczną stronę łowiska."
          />

          <div className="mt-4 grid gap-4">
            <BuilderInput
              label="Tytuł SEO"
              value={seoTitle}
              maxLength={180}
              onChange={onSeoTitle}
            />

            <BuilderTextarea
              label="Opis SEO"
              value={seoDescription}
              rows={4}
              maxLength={320}
              onChange={
                onSeoDescription
              }
            />
          </div>
        </section>

        {published && (
          <section className="border-t border-border pt-6">
            <div className="rounded-card border border-warning-border bg-warning-subtle p-4">
              <p className="text-sm font-extrabold text-warning-foreground">
                Strona jest opublikowana
              </p>

              <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                Cofnięcie publikacji ukryje stronę publiczną, ale zachowa wszystkie ustawienia w edytorze.
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 border-warning-border text-warning-foreground hover:bg-warning-subtle hover:text-warning-foreground"
                onClick={
                  onRequestUnpublish
                }
              >
                Cofnij publikację
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function PanelHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
        {title}
      </h2>
      <p className="mt-1.5 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold text-text">
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}
