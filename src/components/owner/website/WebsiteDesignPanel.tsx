"use client";

import {
  BuilderColorField,
  BuilderImageField,
} from "@/components/owner/website/WebsiteBuilderFields";
import {
  TemplateSwatches,
  WebsiteTemplateThumbnail,
} from "@/components/owner/website/WebsiteTemplateThumbnail";
import { Button } from "@/components/ui/Button";
import {
  LAKE_WEBSITE_TEMPLATES,
} from "@/lib/lake-websites";
import { cn } from "@/lib/cn";

export function WebsiteDesignPanel({
  templateKey,
  previewTemplateKey,
  logoUrl,
  uploading,
  primaryColor,
  accentColor,
  backgroundColor,
  textColor,
  onPreviewTemplate,
  onApplyPreview,
  onCancelPreview,
  onLogoChange,
  onUpload,
  onPrimaryColor,
  onAccentColor,
  onBackgroundColor,
  onTextColor,
}: {
  templateKey: string;
  previewTemplateKey: string | null;
  logoUrl: string;
  uploading: boolean;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  onPreviewTemplate: (
    key: string
  ) => void;
  onApplyPreview: () => void;
  onCancelPreview: () => void;
  onLogoChange: (
    value: string
  ) => void;
  onUpload: () => Promise<string>;
  onPrimaryColor: (
    value: string
  ) => void;
  onAccentColor: (
    value: string
  ) => void;
  onBackgroundColor: (
    value: string
  ) => void;
  onTextColor: (
    value: string
  ) => void;
}) {
  const preview =
    LAKE_WEBSITE_TEMPLATES.find(
      (template) =>
        template.key ===
        previewTemplateKey
    );

  async function uploadLogo() {
    try {
      onLogoChange(
        await onUpload()
      );
    } catch {
      // Kontroler pokazuje błąd.
    }
  }

  return (
    <div className="p-5 pb-8">
      <PanelHeading
        eyebrow="Wygląd"
        title="Projekt strony"
        description="Wybierz kierunek artystyczny, a potem dopracuj branding. Podgląd po prawej aktualizuje się na żywo."
      />

      {preview && (
        <div className="mt-5 rounded-card border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary-700">
                Podgląd projektu
              </p>

              <p className="mt-1 font-display text-lg font-extrabold text-text">
                {preview.label}
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted">
                {preview.category}
              </p>
            </div>

            <TemplateSwatches
              swatches={
                preview.swatches
              }
              size="md"
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-text-secondary">
            Zastosowanie projektu zmieni kolejność i warianty sekcji, ale zachowa możliwie dużo Twoich tekstów i zdjęć.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancelPreview}
            >
              Anuluj
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onApplyPreview}
            >
              Użyj projektu
            </Button>
          </div>
        </div>
      )}

      <div className="mt-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-text-secondary">
              Gotowe projekty
            </p>
            <p className="mt-1 text-[11px] leading-5 text-text-muted">
              Kliknij kartę, aby obejrzeć projekt bez zapisywania zmian.
            </p>
          </div>

          <span className="text-[10px] font-bold text-text-muted">
            {
              LAKE_WEBSITE_TEMPLATES.length
            }
          </span>
        </div>

        <div className="mt-3 space-y-4">
          {LAKE_WEBSITE_TEMPLATES.map(
            (template) => {
              const selected =
                template.key ===
                templateKey;

              const previewing =
                template.key ===
                previewTemplateKey;

              return (
                <article
                  key={template.key}
                  className={cn(
                    "overflow-hidden rounded-card border bg-surface transition",
                    previewing
                      ? "border-primary-400 shadow-[0_0_0_3px_rgba(47,91,167,0.08)]"
                      : selected
                        ? "border-success-border"
                        : "border-border hover:border-primary-200"
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewTemplate(
                        template.key
                      )
                    }
                    className="block w-full text-left"
                  >
                    <WebsiteTemplateThumbnail
                      templateKey={
                        template.key
                      }
                    />

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-extrabold tracking-[-0.02em] text-text">
                              {
                                template.label
                              }
                            </h3>

                            {selected && (
                              <span className="rounded-full bg-success-subtle px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-success-foreground">
                                Aktualny
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
                            {
                              template.category
                            }
                          </p>
                        </div>

                        <TemplateSwatches
                          swatches={
                            template.swatches
                          }
                        />
                      </div>

                      <p className="mt-3 text-[11px] leading-5 text-text-secondary">
                        {
                          template.description
                        }
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {template.features.map(
                          (feature) => (
                            <span
                              key={feature}
                              className="rounded-full bg-surface-muted px-2.5 py-1 text-[9px] font-semibold text-text-muted"
                            >
                              {feature}
                            </span>
                          )
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                        <span className="text-[10px] text-text-muted">
                          {template.bestFor}
                        </span>

                        <span className="shrink-0 text-[10px] font-bold text-primary-700">
                          {previewing
                            ? "Podglądasz →"
                            : "Podgląd →"}
                        </span>
                      </div>
                    </div>
                  </button>
                </article>
              );
            }
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-7">
        <PanelHeading
          eyebrow="Branding"
          title="Logo i kolory"
          description="Dopasuj najważniejsze elementy identyfikacji. Szablon zachowuje własną typografię i układ."
        />

        <div className="mt-5">
          <BuilderImageField
            label="Logo łowiska"
            url={logoUrl}
            uploading={uploading}
            onUpload={() =>
              void uploadLogo()
            }
            onRemove={() =>
              onLogoChange("")
            }
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <BuilderColorField
            label="Kolor marki"
            value={primaryColor}
            onChange={onPrimaryColor}
          />

          <BuilderColorField
            label="Akcent"
            value={accentColor}
            onChange={onAccentColor}
          />
        </div>

        <details className="mt-4 overflow-hidden rounded-card border border-border bg-surface-muted">
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-text-secondary">
            Kolory zaawansowane
          </summary>

          <div className="grid grid-cols-2 gap-3 border-t border-border p-4">
            <BuilderColorField
              label="Tło"
              value={backgroundColor}
              onChange={
                onBackgroundColor
              }
            />

            <BuilderColorField
              label="Tekst"
              value={textColor}
              onChange={onTextColor}
            />
          </div>
        </details>
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
