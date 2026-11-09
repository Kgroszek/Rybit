"use client";

import { TrashIcon } from "@/components/icons/TrashIcon";
import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import {
  BuilderDataSourceEditor,
  BuilderGalleryEditor,
  BuilderImageField,
  BuilderInput,
  BuilderTextarea,
  BuilderVariantField,
} from "@/components/owner/website/WebsiteBuilderFields";
import {
  isDataBackedSection,
  sectionSupports,
} from "@/components/owner/website/website-builder-utils";
import {
  getLakeWebsiteSectionLabel,
  type LakeWebsiteSection,
} from "@/lib/lake-website-sections";
import { Button } from "@/components/ui/Button";

export function WebsiteSectionEditor({
  section,
  lake,
  uploading,
  onBack,
  onChange,
  onUpload,
  onDelete,
}: {
  section: LakeWebsiteSection;
  lake: PublicLakeWebsiteData["lake"];
  uploading: boolean;
  onBack: () => void;
  onChange: (
    patch: Partial<LakeWebsiteSection>
  ) => void;
  onUpload: () => Promise<string>;
  onDelete: () => void;
}) {
  async function uploadSingle() {
    try {
      const url = await onUpload();
      onChange({ imageUrl: url });
    } catch {
      // Kontroler pokazuje błąd.
    }
  }

  return (
    <div className="p-5 pb-8">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-bold text-primary-700 transition hover:text-primary-900"
      >
        ← Wszystkie sekcje
      </button>

      <div className="mt-5 border-b border-border pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
          Edytuj sekcję
        </p>

        <h2 className="mt-1.5 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
          {getLakeWebsiteSectionLabel(
            section.type
          )}
        </h2>
      </div>

      <div
        className="grid"
        style={{
          rowGap: "22px",
          paddingTop: "22px",
        }}
      >
        {isDataBackedSection(
          section.type
        ) && (
          <BuilderDataSourceEditor
            section={section}
            lake={lake}
            onChange={onChange}
          />
        )}

        <BuilderVariantField
          section={section}
          onChange={onChange}
        />

        {sectionSupports(
          section.type,
          "eyebrow"
        ) && (
          <BuilderInput
            label="Mały nagłówek"
            value={section.eyebrow || ""}
            maxLength={120}
            onChange={(value) =>
              onChange({
                eyebrow: value,
              })
            }
          />
        )}

        {sectionSupports(
          section.type,
          "title"
        ) && (
          <BuilderInput
            label="Tytuł"
            value={section.title || ""}
            maxLength={220}
            onChange={(value) =>
              onChange({
                title: value,
              })
            }
          />
        )}

        {sectionSupports(
          section.type,
          "subtitle"
        ) && (
          <BuilderTextarea
            label="Podtytuł"
            value={
              section.subtitle || ""
            }
            rows={3}
            maxLength={600}
            onChange={(value) =>
              onChange({
                subtitle: value,
              })
            }
          />
        )}

        {sectionSupports(
          section.type,
          "text"
        ) && (
          <BuilderTextarea
            label="Treść"
            value={section.text || ""}
            rows={7}
            maxLength={10000}
            onChange={(value) =>
              onChange({ text: value })
            }
          />
        )}

        {sectionSupports(
          section.type,
          "image"
        ) && (
          <BuilderImageField
            label={
              section.type === "hero"
                ? "Zdjęcie główne"
                : "Zdjęcie sekcji"
            }
            url={
              section.imageUrl || ""
            }
            uploading={uploading}
            onUpload={() =>
              void uploadSingle()
            }
            onRemove={() =>
              onChange({
                imageUrl: "",
              })
            }
          />
        )}

        {section.type === "gallery" && (
          <BuilderGalleryEditor
            images={
              section.images || []
            }
            uploading={uploading}
            onUpload={onUpload}
            onChange={(images) =>
              onChange({ images })
            }
          />
        )}

        {sectionSupports(
          section.type,
          "button"
        ) && (
          <div className="grid gap-4">
            <BuilderInput
              label="Tekst przycisku"
              value={
                section.buttonLabel || ""
              }
              maxLength={100}
              onChange={(value) =>
                onChange({
                  buttonLabel: value,
                })
              }
            />

            <BuilderInput
              label="Link przycisku"
              value={
                section.buttonHref || ""
              }
              placeholder="#kontakt"
              maxLength={1400}
              onChange={(value) =>
                onChange({
                  buttonHref: value,
                })
              }
            />
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-5">
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={onDelete}
          className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
        >
          <TrashIcon className="h-4 w-4" />
          Usuń tę sekcję
        </Button>
      </div>
    </div>
  );
}
