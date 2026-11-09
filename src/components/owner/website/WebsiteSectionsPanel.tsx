"use client";

import {
  useState,
  type ReactNode,
} from "react";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import { WebsiteSectionEditor } from "@/components/owner/website/WebsiteSectionEditor";
import {
  normalizedSectionTitle,
} from "@/components/owner/website/website-builder-utils";
import {
  LAKE_WEBSITE_SECTION_LIBRARY,
  getLakeWebsiteSectionLabel,
  type LakeWebsiteSection,
  type LakeWebsiteSectionType,
} from "@/lib/lake-website-sections";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function WebsiteSectionsPanel({
  sections,
  selectedSection,
  libraryOpen,
  lake,
  uploading,
  onLibraryOpen,
  onSelect,
  onAdd,
  onUpdate,
  onMove,
  onDrag,
  onUpload,
  onRequestDelete,
}: {
  sections: LakeWebsiteSection[];
  selectedSection:
    | LakeWebsiteSection
    | null;
  libraryOpen: boolean;
  lake: PublicLakeWebsiteData["lake"];
  uploading: boolean;
  onLibraryOpen: (
    open: boolean
  ) => void;
  onSelect: (
    id: string | null
  ) => void;
  onAdd: (
    type: LakeWebsiteSectionType
  ) => void;
  onUpdate: (
    id: string,
    patch: Partial<LakeWebsiteSection>
  ) => void;
  onMove: (
    id: string,
    direction: -1 | 1
  ) => void;
  onDrag: (
    sourceId: string,
    targetId: string
  ) => void;
  onUpload: () => Promise<string>;
  onRequestDelete: (
    section: LakeWebsiteSection
  ) => void;
}) {
  if (libraryOpen) {
    return (
      <SectionLibrary
        onBack={() =>
          onLibraryOpen(false)
        }
        onAdd={onAdd}
      />
    );
  }

  if (selectedSection) {
    return (
      <WebsiteSectionEditor
        section={selectedSection}
        lake={lake}
        uploading={uploading}
        onBack={() =>
          onSelect(null)
        }
        onChange={(patch) =>
          onUpdate(
            selectedSection.id,
            patch
          )
        }
        onUpload={onUpload}
        onDelete={() =>
          onRequestDelete(
            selectedSection
          )
        }
      />
    );
  }

  return (
    <SectionsList
      sections={sections}
      onSelect={(id) =>
        onSelect(id)
      }
      onAdd={() =>
        onLibraryOpen(true)
      }
      onMove={onMove}
      onDrag={onDrag}
      onDelete={onRequestDelete}
    />
  );
}

function SectionsList({
  sections,
  onSelect,
  onAdd,
  onMove,
  onDrag,
  onDelete,
}: {
  sections: LakeWebsiteSection[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onMove: (
    id: string,
    direction: -1 | 1
  ) => void;
  onDrag: (
    sourceId: string,
    targetId: string
  ) => void;
  onDelete: (
    section: LakeWebsiteSection
  ) => void;
}) {
  const [
    draggingId,
    setDraggingId,
  ] = useState<string | null>(null);

  return (
    <div className="p-5 pb-8">
      <PanelHeading
        eyebrow="Struktura strony"
        title="Sekcje"
        description="Kliknij sekcję, aby ją edytować. Kolejność możesz zmienić przeciąganiem lub strzałkami."
      />

      <div className="mt-5 space-y-2.5">
        {sections.map(
          (section, index) => (
            <article
              key={section.id}
              draggable
              onDragStart={() =>
                setDraggingId(
                  section.id
                )
              }
              onDragEnd={() =>
                setDraggingId(null)
              }
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={() => {
                if (draggingId) {
                  onDrag(
                    draggingId,
                    section.id
                  );
                }

                setDraggingId(null);
              }}
              className={cn(
                "group flex items-center gap-2 rounded-card border bg-surface p-2.5 transition",
                draggingId ===
                  section.id
                  ? "border-primary-300 opacity-50"
                  : "border-border hover:border-primary-200 hover:bg-primary-50/35"
              )}
            >
              <span
                className="cursor-grab px-1.5 text-base font-black text-text-muted active:cursor-grabbing"
                title="Przeciągnij sekcję"
              >
                ⋮⋮
              </span>

              <button
                type="button"
                onClick={() =>
                  onSelect(section.id)
                }
                className="min-w-0 flex-1 px-1 py-2 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-black tabular-nums text-text-muted">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <span className="text-sm font-extrabold text-text">
                    {getLakeWebsiteSectionLabel(
                      section.type
                    )}
                  </span>
                </span>

                <span className="mt-1 block truncate text-[11px] text-text-muted">
                  {normalizedSectionTitle(
                    section
                  )}
                </span>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <MiniAction
                  label="Przesuń wyżej"
                  disabled={index === 0}
                  onClick={() =>
                    onMove(
                      section.id,
                      -1
                    )
                  }
                >
                  <ArrowSmallRightIcon className="h-3.5 w-3.5 -rotate-90" />
                </MiniAction>

                <MiniAction
                  label="Przesuń niżej"
                  disabled={
                    index ===
                    sections.length - 1
                  }
                  onClick={() =>
                    onMove(
                      section.id,
                      1
                    )
                  }
                >
                  <ArrowSmallRightIcon className="h-3.5 w-3.5 rotate-90" />
                </MiniAction>

                <MiniAction
                  label="Usuń"
                  danger
                  onClick={() =>
                    onDelete(section)
                  }
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </MiniAction>
              </div>
            </article>
          )
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        className="mt-4"
        onClick={onAdd}
      >
        <AddCircleIcon className="h-4 w-4" />
        Dodaj sekcję
      </Button>
    </div>
  );
}

function SectionLibrary({
  onBack,
  onAdd,
}: {
  onBack: () => void;
  onAdd: (
    type: LakeWebsiteSectionType
  ) => void;
}) {
  return (
    <div className="p-5 pb-8">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-bold text-primary-700 hover:text-primary-900"
      >
        ← Sekcje
      </button>

      <div className="mt-5">
        <PanelHeading
          eyebrow="Biblioteka"
          title="Dodaj sekcję"
          description="Wybierz gotowy moduł. Układ mobilny i desktopowy są już przygotowane."
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {LAKE_WEBSITE_SECTION_LIBRARY.map(
          (item) => (
            <button
              key={item.type}
              type="button"
              onClick={() =>
                onAdd(item.type)
              }
              className="group rounded-card border border-border bg-surface p-3 text-left transition hover:border-primary-300 hover:bg-primary-50"
            >
              <SectionMiniature
                type={item.type}
              />

              <p className="mt-3 text-sm font-extrabold text-text">
                {item.label}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-text-muted">
                {item.description}
              </p>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function SectionMiniature({
  type,
}: {
  type: LakeWebsiteSectionType;
}) {
  return (
    <div className="h-16 overflow-hidden rounded-xl border border-border bg-surface-muted p-2">
      {type === "hero" ? (
        <div className="flex h-full items-end rounded-lg bg-gradient-to-br from-primary-900 to-primary p-2">
          <div className="w-2/3">
            <div className="h-1.5 w-1/2 rounded bg-white/50" />
            <div className="mt-1.5 h-2 w-full rounded bg-white" />
            <div className="mt-1 h-2 w-4/5 rounded bg-white" />
          </div>
        </div>
      ) : type === "gallery" ? (
        <div className="grid h-full grid-cols-2 gap-1">
          <div className="rounded bg-primary-200" />
          <div className="grid gap-1">
            <div className="rounded bg-primary-100" />
            <div className="rounded bg-surface-strong" />
          </div>
        </div>
      ) : type === "fish" ? (
        <div className="flex h-full flex-wrap content-center gap-1">
          {[1, 2, 3, 4, 5].map(
            (item) => (
              <span
                key={item}
                className="h-3 rounded-full bg-primary-100"
                style={{
                  width:
                    item % 2
                      ? "36%"
                      : "28%",
                }}
              />
            )
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col justify-center">
          <div className="h-1.5 w-1/3 rounded bg-primary-300" />
          <div className="mt-2 h-2 w-3/4 rounded bg-navy-950/70" />
          <div className="mt-1 h-1.5 w-full rounded bg-navy-950/10" />
          <div className="mt-1 h-1.5 w-4/5 rounded bg-navy-950/10" />
        </div>
      )}
    </div>
  );
}

function MiniAction({
  label,
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-25",
        danger
          ? "text-danger-foreground hover:bg-danger-subtle"
          : "text-text-muted hover:bg-surface-hover hover:text-text"
      )}
    >
      {children}
    </button>
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
