"use client";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import { WebsiteDesignPanel } from "@/components/owner/website/WebsiteDesignPanel";
import { WebsiteSectionsPanel } from "@/components/owner/website/WebsiteSectionsPanel";
import { WebsiteSettingsPanel } from "@/components/owner/website/WebsiteSettingsPanel";
import type {
  WebsiteBuilderMode,
} from "@/components/owner/website/types";
import type {
  LakeWebsiteBuilderController,
} from "@/components/owner/website/useLakeWebsiteBuilder";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";
import { cn } from "@/lib/cn";

const MODES: Array<{
  value: WebsiteBuilderMode;
  label: string;
}> = [
  {
    value: "sections",
    label: "Sekcje",
  },
  {
    value: "design",
    label: "Wygląd",
  },
  {
    value: "settings",
    label: "Ustawienia",
  },
];

export function WebsiteBuilderSidebar({
  controller,
  rootDomain,
  lake,
  onRequestDeleteSection,
  onRequestUnpublish,
}: {
  controller: LakeWebsiteBuilderController;
  rootDomain: string;
  lake: PublicLakeWebsiteData["lake"];
  onRequestDeleteSection: (
    section: LakeWebsiteSection
  ) => void;
  onRequestUnpublish: () => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-surface">
      <div className="shrink-0 border-b border-border bg-surface px-3 py-3">
        <div className="grid grid-cols-3 gap-1 rounded-control bg-surface-muted p-1">
          {MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                controller.changeMode(
                  item.value
                )
              }
              aria-pressed={
                controller.mode ===
                item.value
              }
              className={cn(
                "min-h-9 rounded-xl px-2 text-xs font-bold transition",
                controller.mode ===
                  item.value
                  ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
                  : "text-text-muted hover:text-text"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
        {controller.mode ===
          "sections" && (
          <WebsiteSectionsPanel
            sections={
              controller.snapshot
                .sections
            }
            selectedSection={
              controller.selectedSection
            }
            libraryOpen={
              controller.libraryOpen
            }
            lake={lake}
            uploading={
              controller.uploading
            }
            onLibraryOpen={
              controller.setLibraryOpen
            }
            onSelect={(id) => {
              if (!id) {
                controller.setSelectedSectionId(
                  null
                );
                return;
              }

              controller.selectSection(
                id
              );
            }}
            onAdd={
              controller.addSection
            }
            onUpdate={
              controller.updateSection
            }
            onMove={
              controller.moveSection
            }
            onDrag={
              controller.dragSection
            }
            onUpload={
              controller.uploadImage
            }
            onRequestDelete={
              onRequestDeleteSection
            }
          />
        )}

        {controller.mode ===
          "design" && (
          <WebsiteDesignPanel
            templateKey={
              controller.snapshot
                .templateKey
            }
            previewTemplateKey={
              controller.previewTemplateKey
            }
            logoUrl={
              controller.snapshot.logoUrl
            }
            uploading={
              controller.uploading
            }
            primaryColor={
              controller.snapshot
                .primaryColor
            }
            accentColor={
              controller.snapshot
                .accentColor
            }
            backgroundColor={
              controller.snapshot
                .backgroundColor
            }
            textColor={
              controller.snapshot
                .textColor
            }
            onPreviewTemplate={
              controller.previewTemplate
            }
            onApplyPreview={
              controller.applyPreviewTemplate
            }
            onCancelPreview={
              controller.cancelTemplatePreview
            }
            onLogoChange={(logoUrl) =>
              controller.patchSnapshot({
                logoUrl,
              })
            }
            onUpload={
              controller.uploadImage
            }
            onPrimaryColor={(
              primaryColor
            ) =>
              controller.patchSnapshot({
                primaryColor,
              })
            }
            onAccentColor={(
              accentColor
            ) =>
              controller.patchSnapshot({
                accentColor,
              })
            }
            onBackgroundColor={(
              backgroundColor
            ) =>
              controller.patchSnapshot({
                backgroundColor,
              })
            }
            onTextColor={(textColor) =>
              controller.patchSnapshot({
                textColor,
              })
            }
          />
        )}

        {controller.mode ===
          "settings" && (
          <WebsiteSettingsPanel
            subdomain={
              controller.snapshot
                .subdomain
            }
            rootDomain={rootDomain}
            subdomainError={
              controller.subdomainError
            }
            siteName={
              controller.snapshot
                .siteName
            }
            contactPhone={
              controller.snapshot
                .contactPhone
            }
            contactEmail={
              controller.snapshot
                .contactEmail
            }
            contactWebsite={
              controller.snapshot
                .contactWebsite
            }
            seoTitle={
              controller.snapshot
                .seoTitle
            }
            seoDescription={
              controller.snapshot
                .seoDescription
            }
            published={
              controller.snapshot
                .status === "published"
            }
            onSubdomain={(
              subdomain
            ) =>
              controller.patchSnapshot({
                subdomain,
              })
            }
            onSiteName={(siteName) =>
              controller.patchSnapshot({
                siteName,
              })
            }
            onContactPhone={(
              contactPhone
            ) =>
              controller.patchSnapshot({
                contactPhone,
              })
            }
            onContactEmail={(
              contactEmail
            ) =>
              controller.patchSnapshot({
                contactEmail,
              })
            }
            onContactWebsite={(
              contactWebsite
            ) =>
              controller.patchSnapshot({
                contactWebsite,
              })
            }
            onSeoTitle={(seoTitle) =>
              controller.patchSnapshot({
                seoTitle,
              })
            }
            onSeoDescription={(
              seoDescription
            ) =>
              controller.patchSnapshot({
                seoDescription,
              })
            }
            onRequestUnpublish={
              onRequestUnpublish
            }
          />
        )}
      </div>
    </aside>
  );
}
