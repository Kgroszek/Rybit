"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import {
  LakeWebsiteBuilderCanvas,
  type LakeWebsiteBuilderDevice,
} from "@/components/owner/LakeWebsiteBuilderCanvas";
import {
  LAKE_WEBSITE_SECTION_LIBRARY,
  createLakeWebsiteSection,
  getLakeWebsiteSectionLabel,
  type LakeWebsiteSection,
  type LakeWebsiteSectionType,
} from "@/lib/lake-website-sections";
import {
  LAKE_WEBSITE_TEMPLATES,
  normalizeHexColor,
  normalizeLakeWebsiteSubdomain,
  resolveLakeWebsiteTemplateKey,
  validateLakeWebsiteSubdomain,
} from "@/lib/lake-websites";
import {
  buildTemplateSections,
  getLakeWebsiteTemplatePreset,
} from "@/lib/lake-website-template-presets";

type PanelMode = "sections" | "design" | "settings";

type InitialWebsite = {
  subdomain: string;
  templateKey: string;
  siteName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  contactPhone: string | null;
  contactEmail: string | null;
  contactWebsite: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  sections: LakeWebsiteSection[];
};

export function LakeWebsiteBuilder({
  lakeSlug,
  lakeName,
  rootDomain,
  initialWebsite,
  lake,
}: {
  lakeSlug: string;
  lakeName: string;
  rootDomain: string;
  initialWebsite: InitialWebsite;
  lake: PublicLakeWebsiteData["lake"];
}) {
  const router = useRouter();

  const [mode, setMode] = useState<PanelMode>("sections");
  const [device, setDevice] =
    useState<LakeWebsiteBuilderDevice>("desktop");
  const [selectedSectionId, setSelectedSectionId] =
    useState<string | null>(
      initialWebsite.sections[0]?.id || null
    );
  const [showLibrary, setShowLibrary] = useState(false);

  const [sections, setSections] =
    useState<LakeWebsiteSection[]>(initialWebsite.sections);

  const [subdomain, setSubdomain] = useState(
    initialWebsite.subdomain
  );
  const [templateKey, setTemplateKey] = useState(
    resolveLakeWebsiteTemplateKey(initialWebsite.templateKey)
  );
  const [previewTemplateKey, setPreviewTemplateKey] =
    useState<string | null>(null);

  const [siteName, setSiteName] = useState(
    initialWebsite.siteName || lakeName
  );
  const [logoUrl, setLogoUrl] = useState(
    initialWebsite.logoUrl || ""
  );
  const [primaryColor, setPrimaryColor] = useState(
    initialWebsite.primaryColor
  );
  const [accentColor, setAccentColor] = useState(
    initialWebsite.accentColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    initialWebsite.backgroundColor
  );
  const [textColor, setTextColor] = useState(
    initialWebsite.textColor
  );
  const [contactPhone, setContactPhone] = useState(
    initialWebsite.contactPhone || ""
  );
  const [contactEmail, setContactEmail] = useState(
    initialWebsite.contactEmail || ""
  );
  const [contactWebsite, setContactWebsite] = useState(
    initialWebsite.contactWebsite || ""
  );
  const [seoTitle, setSeoTitle] = useState(
    initialWebsite.seoTitle || ""
  );
  const [seoDescription, setSeoDescription] = useState(
    initialWebsite.seoDescription || ""
  );
  const [status, setStatus] = useState(initialWebsite.status);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const normalizedSubdomain =
    normalizeLakeWebsiteSubdomain(subdomain);
  const subdomainError =
    validateLakeWebsiteSubdomain(normalizedSubdomain);

  const selectedSection =
    sections.find(
      (section) => section.id === selectedSectionId
    ) || null;

  const templateDefaults = useMemo(
    () => ({
      lakeName,
      description: lake.description,
      images: lake.images.map((image) => image.url),
    }),
    [lakeName, lake.description, lake.images]
  );

  const previewPreset = previewTemplateKey
    ? getLakeWebsiteTemplatePreset(
        resolveLakeWebsiteTemplateKey(previewTemplateKey)
      )
    : null;

  const previewSections = useMemo(
    () =>
      previewTemplateKey
        ? buildTemplateSections({
            templateKey: resolveLakeWebsiteTemplateKey(
              previewTemplateKey
            ),
            currentSections: sections,
            defaults: templateDefaults,
            preview: true,
          })
        : sections,
    [
      previewTemplateKey,
      sections,
      templateDefaults,
    ]
  );

  const previewData = useMemo<PublicLakeWebsiteData>(
    () => ({
      website: {
        subdomain: normalizedSubdomain,
        templateKey:
          previewTemplateKey || templateKey,
        siteName: siteName || null,
        logoUrl: logoUrl || null,
        primaryColor: previewPreset
          ? previewPreset.palette.primaryColor
          : normalizeHexColor(
              primaryColor,
              "#155EEF"
            ),
        accentColor: previewPreset
          ? previewPreset.palette.accentColor
          : normalizeHexColor(
              accentColor,
              "#6ED5D0"
            ),
        backgroundColor: previewPreset
          ? previewPreset.palette.backgroundColor
          : normalizeHexColor(
              backgroundColor,
              "#FFFFFF"
            ),
        textColor: previewPreset
          ? previewPreset.palette.textColor
          : normalizeHexColor(
              textColor,
              "#0B1628"
            ),
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        contactWebsite: contactWebsite || null,
        sections: previewSections,
      },
      lake,
    }),
    [
      normalizedSubdomain,
      previewTemplateKey,
      templateKey,
      siteName,
      logoUrl,
      previewPreset,
      primaryColor,
      accentColor,
      backgroundColor,
      textColor,
      contactPhone,
      contactEmail,
      contactWebsite,
      previewSections,
      lake,
    ]
  );

  const selectSection = useCallback(
    (sectionId: string) => {
      setPreviewTemplateKey(null);
      setMode("sections");
      setShowLibrary(false);
      setSelectedSectionId(sectionId);
    },
    []
  );

  function updateSection(
    id: string,
    patch: Partial<LakeWebsiteSection>
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === id
          ? { ...section, ...patch }
          : section
      )
    );
  }

  function addSection(type: LakeWebsiteSectionType) {
    const next = createLakeWebsiteSection(type, {
      lakeName,
      description: lake.description,
      images: lake.images.map((image) => image.url),
    });

    setSections((current) => [...current, next]);
    setSelectedSectionId(next.id);
    setShowLibrary(false);
  }

  function removeSection(id: string) {
    setSections((current) => {
      const index = current.findIndex(
        (section) => section.id === id
      );
      const next = current.filter(
        (section) => section.id !== id
      );

      if (selectedSectionId === id) {
        const fallback =
          next[Math.min(index, next.length - 1)] || null;
        setSelectedSectionId(fallback?.id || null);
      }

      return next;
    });
  }

  function moveSection(
    id: string,
    direction: -1 | 1
  ) {
    setSections((current) => {
      const index = current.findIndex(
        (section) => section.id === id
      );
      const nextIndex = index + direction;

      if (
        index < 0 ||
        nextIndex < 0 ||
        nextIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  function dragSection(
    sourceId: string,
    targetId: string
  ) {
    if (sourceId === targetId) {
      return;
    }

    setSections((current) => {
      const sourceIndex = current.findIndex(
        (section) => section.id === sourceId
      );
      const targetIndex = current.findIndex(
        (section) => section.id === targetId
      );

      if (sourceIndex < 0 || targetIndex < 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function uploadImage() {
    return new Promise<string>((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept =
        "image/jpeg,image/png,image/webp,image/avif";

      input.onchange = async () => {
        const file = input.files?.[0];

        if (!file) {
          reject(new Error("Nie wybrano zdjęcia."));
          return;
        }

        setUploading(true);

        try {
          const form = new FormData();
          form.append("image", file);

          const response = await fetch(
            `/api/owner/lakes/${lakeSlug}/website/upload`,
            {
              method: "POST",
              body: form,
            }
          );

          const payload = (await response
            .json()
            .catch(() => null)) as
            | { url?: string; message?: string }
            | null;

          if (!response.ok || !payload?.url) {
            throw new Error(
              payload?.message ||
                "Nie udało się przesłać zdjęcia."
            );
          }

          resolve(payload.url);
        } catch (error) {
          reject(error);
        } finally {
          setUploading(false);
        }
      };

      input.click();
    });
  }

  function applyPreviewTemplate() {
    if (!previewTemplateKey) {
      return;
    }

    const nextKey =
      resolveLakeWebsiteTemplateKey(previewTemplateKey);
    const preset =
      getLakeWebsiteTemplatePreset(nextKey);

    const nextSections = buildTemplateSections({
      templateKey: nextKey,
      currentSections: sections,
      defaults: templateDefaults,
      preview: false,
    });

    setTemplateKey(nextKey);
    setSections(nextSections);
    setPrimaryColor(
      preset.palette.primaryColor
    );
    setAccentColor(
      preset.palette.accentColor
    );
    setBackgroundColor(
      preset.palette.backgroundColor
    );
    setTextColor(
      preset.palette.textColor
    );
    setSelectedSectionId(
      nextSections[0]?.id || null
    );
    setPreviewTemplateKey(null);
    setMessage(
      `Zastosowano szablon ${
        LAKE_WEBSITE_TEMPLATES.find(
          (item) => item.key === nextKey
        )?.label || nextKey
      }. Zapisz zmiany, aby je zachować.`
    );
  }

  async function save(
    nextStatus: "draft" | "published"
  ) {
    setMessage("");
    setPreviewTemplateKey(null);

    if (subdomainError) {
      setMessage(subdomainError);
      setMode("settings");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/owner/lakes/${lakeSlug}/website`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subdomain: normalizedSubdomain,
            templateKey,
            siteName,
            logoUrl: logoUrl || null,
            primaryColor,
            accentColor,
            backgroundColor,
            textColor,
            contactPhone,
            contactEmail,
            contactWebsite,
            seoTitle,
            seoDescription,
            sections,
            status: nextStatus,
          }),
        }
      );

      const payload = (await response
        .json()
        .catch(() => null)) as
        | { message?: string; subdomain?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            "Nie udało się zapisać strony."
        );
      }

      if (payload?.subdomain) {
        setSubdomain(payload.subdomain);
      }

      setStatus(nextStatus);
      setMessage(
        nextStatus === "published"
          ? "Strona została opublikowana."
          : "Zmiany zostały zapisane."
      );
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się zapisać strony."
      );
    } finally {
      setSaving(false);
    }
  }

  function changeMode(nextMode: PanelMode) {
    if (nextMode !== "design") {
      setPreviewTemplateKey(null);
    }

    setMode(nextMode);
    setShowLibrary(false);
    setSelectedSectionId(null);
  }

  return (
    <div className="fixed inset-0 z-[100] grid min-h-0 overflow-hidden bg-slate-100 lg:grid-cols-[420px_minmax(0,1fr)]">
      <aside className="relative z-20 flex min-h-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-xl">
        <div className="shrink-0">
          <BuilderHeader
            lakeSlug={lakeSlug}
            lakeName={lakeName}
            status={status}
            device={device}
            onDeviceChange={setDevice}
          />

          <BuilderTabs
            mode={mode}
            onChange={changeMode}
          />
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          style={{ scrollbarGutter: "stable" }}
        >
          {mode === "sections" && (
            <>
              {showLibrary ? (
                <SectionLibrary
                  onBack={() => setShowLibrary(false)}
                  onAdd={addSection}
                />
              ) : selectedSection ? (
                <SectionEditor
                  section={selectedSection}
                  lake={lake}
                  uploading={uploading}
                  onBack={() =>
                    setSelectedSectionId(null)
                  }
                  onChange={(patch) =>
                    updateSection(
                      selectedSection.id,
                      patch
                    )
                  }
                  onUpload={uploadImage}
                  onDelete={() =>
                    removeSection(selectedSection.id)
                  }
                />
              ) : (
                <SectionsList
                  sections={sections}
                  onSelect={selectSection}
                  onAdd={() => setShowLibrary(true)}
                  onRemove={removeSection}
                  onMove={moveSection}
                  onDrag={dragSection}
                />
              )}
            </>
          )}

          {mode === "design" && (
            <DesignPanel
              templateKey={templateKey}
              previewTemplateKey={previewTemplateKey}
              onPreviewTemplate={
                setPreviewTemplateKey
              }
              onApplyPreview={applyPreviewTemplate}
              onCancelPreview={() =>
                setPreviewTemplateKey(null)
              }
              logoUrl={logoUrl}
              onLogoChange={setLogoUrl}
              onUpload={uploadImage}
              uploading={uploading}
              primaryColor={primaryColor}
              accentColor={accentColor}
              backgroundColor={backgroundColor}
              textColor={textColor}
              onPrimaryColor={setPrimaryColor}
              onAccentColor={setAccentColor}
              onBackgroundColor={
                setBackgroundColor
              }
              onTextColor={setTextColor}
            />
          )}

          {mode === "settings" && (
            <SettingsPanel
              subdomain={subdomain}
              rootDomain={rootDomain}
              subdomainError={subdomainError}
              onSubdomain={setSubdomain}
              siteName={siteName}
              onSiteName={setSiteName}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
              contactWebsite={contactWebsite}
              onContactPhone={setContactPhone}
              onContactEmail={setContactEmail}
              onContactWebsite={setContactWebsite}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              onSeoTitle={setSeoTitle}
              onSeoDescription={
                setSeoDescription
              }
            />
          )}
        </div>

        <div className="shrink-0">
          <BuilderFooter
            saving={saving}
            message={message}
            published={status === "published"}
            disabled={Boolean(subdomainError)}
            onSave={() => void save("draft")}
            onPublish={() =>
              void save("published")
            }
            publicUrl={`https://${normalizedSubdomain}.${rootDomain}`}
          />
        </div>
      </aside>

      <div className="hidden min-h-0 min-w-0 lg:block">
        <LakeWebsiteBuilderCanvas
          lakeSlug={lakeSlug}
          data={previewData}
          selectedSectionId={
            selectedSectionId
          }
          device={device}
          onSelectSection={selectSection}
        />
      </div>

      <div className="flex items-center justify-center p-8 lg:hidden">
        <div className="max-w-sm text-center">
          <h2 className="text-xl font-extrabold text-slate-950">
            Edytor strony działa na większym ekranie
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Otwórz panel na komputerze lub tablecie
            w poziomie, aby wygodnie edytować stronę
            łowiska.
          </p>
        </div>
      </div>
    </div>
  );
}

function BuilderHeader({
  lakeSlug,
  lakeName,
  status,
  device,
  onDeviceChange,
}: {
  lakeSlug: string;
  lakeName: string;
  status: string;
  device: LakeWebsiteBuilderDevice;
  onDeviceChange: (
    device: LakeWebsiteBuilderDevice
  ) => void;
}) {
  return (
    <div className="border-b border-slate-200 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/moje-lowiska/${lakeSlug}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-lg font-bold text-slate-600 transition hover:bg-slate-50"
          aria-label="Wróć do panelu łowiska"
        >
          ←
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-slate-950">
            {lakeName}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
            Edytor strony WWW
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            status === "published"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {status === "published"
            ? "Online"
            : "Szkic"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            onDeviceChange("desktop")
          }
          className={`rounded-xl px-3 py-2 text-xs font-bold ${
            device === "desktop"
              ? "bg-slate-950 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          Desktop
        </button>

        <button
          type="button"
          onClick={() =>
            onDeviceChange("mobile")
          }
          className={`rounded-xl px-3 py-2 text-xs font-bold ${
            device === "mobile"
              ? "bg-slate-950 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          Mobile
        </button>
      </div>
    </div>
  );
}

function BuilderTabs({
  mode,
  onChange,
}: {
  mode: PanelMode;
  onChange: (mode: PanelMode) => void;
}) {
  return (
    <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-2">
      {[
        ["sections", "Sekcje"],
        ["design", "Wygląd"],
        ["settings", "Ustawienia"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() =>
            onChange(value as PanelMode)
          }
          className={`rounded-xl px-2 py-2.5 text-xs font-bold transition ${
            mode === value
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SectionsList({
  sections,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  onDrag,
}: {
  sections: LakeWebsiteSection[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (
    id: string,
    direction: -1 | 1
  ) => void;
  onDrag: (
    sourceId: string,
    targetId: string
  ) => void;
}) {
  const [draggingId, setDraggingId] =
    useState<string | null>(null);

  return (
    <div className="p-4 pb-8">
      <PanelHeading
        eyebrow="Struktura strony"
        title="Sekcje"
        description="Przeciągnij sekcje, aby zmienić ich kolejność."
      />

      <div className="mt-5 space-y-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() =>
              setDraggingId(section.id)
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
            className={`group flex items-center gap-2 rounded-2xl border bg-white p-2 transition ${
              draggingId === section.id
                ? "border-blue-400 opacity-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span
              className="cursor-grab px-2 text-lg font-bold text-slate-300 active:cursor-grabbing"
              title="Przeciągnij"
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
              <span className="block text-sm font-bold text-slate-800">
                {getLakeWebsiteSectionLabel(
                  section.type
                )}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                {section.title ||
                  section.variant}
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-1 opacity-70 group-hover:opacity-100">
              <MiniButton
                label="W górę"
                disabled={index === 0}
                onClick={() =>
                  onMove(section.id, -1)
                }
              >
                ↑
              </MiniButton>
              <MiniButton
                label="W dół"
                disabled={
                  index === sections.length - 1
                }
                onClick={() =>
                  onMove(section.id, 1)
                }
              >
                ↓
              </MiniButton>
              <MiniButton
                label="Usuń"
                onClick={() =>
                  onRemove(section.id)
                }
                danger
              >
                ×
              </MiniButton>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 flex w-full items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
      >
        + Dodaj sekcję
      </button>
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
    <div className="p-4 pb-8">
      <PanelBack
        onClick={onBack}
        label="Sekcje"
      />

      <h2 className="mt-4 text-lg font-extrabold text-slate-950">
        Dodaj sekcję
      </h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Wybierz gotową sekcję. Układ i
        responsywność są już przygotowane.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {LAKE_WEBSITE_SECTION_LIBRARY.map(
          (item) => (
            <button
              key={item.type}
              type="button"
              onClick={() =>
                onAdd(item.type)
              }
              className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
            >
              <div className="mb-3 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
              <p className="text-sm font-bold text-slate-900">
                {item.label}
              </p>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                {item.description}
              </p>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function SectionEditor({
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
      // no-op
    }
  }

  async function uploadGallery() {
    try {
      const url = await onUpload();
      onChange({
        images: [
          ...(section.images || []),
          url,
        ].slice(0, 20),
      });
    } catch {
      // no-op
    }
  }

  function moveGalleryImage(
    from: number,
    to: number
  ) {
    const current = section.images || [];

    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= current.length ||
      to >= current.length
    ) {
      return;
    }

    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    onChange({ images: next });
  }

  return (
    <div className="p-4 pb-8">
      <PanelBack
        onClick={onBack}
        label="Wszystkie sekcje"
      />

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
          Edytuj sekcję
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">
          {getLakeWebsiteSectionLabel(
            section.type
          )}
        </h2>
      </div>

      <div className="mt-5 space-y-5">
        {isDataBackedSection(section.type) && (
          <SectionDataSourceEditor
            section={section}
            lake={lake}
            onChange={onChange}
          />
        )}

        <VariantField
          section={section}
          onChange={onChange}
        />

        {supports(
          section.type,
          "eyebrow"
        ) && (
          <Field
            label="Mały nagłówek"
            value={section.eyebrow || ""}
            onChange={(value) =>
              onChange({ eyebrow: value })
            }
          />
        )}

        {supports(section.type, "title") && (
          <Field
            label="Tytuł"
            value={section.title || ""}
            onChange={(value) =>
              onChange({ title: value })
            }
          />
        )}

        {supports(
          section.type,
          "subtitle"
        ) && (
          <TextArea
            label="Podtytuł"
            value={section.subtitle || ""}
            rows={3}
            onChange={(value) =>
              onChange({ subtitle: value })
            }
          />
        )}

        {supports(section.type, "text") && (
          <TextArea
            label="Treść"
            value={section.text || ""}
            rows={7}
            onChange={(value) =>
              onChange({ text: value })
            }
          />
        )}

        {supports(
          section.type,
          "image"
        ) && (
          <ImageField
            label={
              section.type === "hero"
                ? "Zdjęcie główne"
                : "Zdjęcie sekcji"
            }
            url={section.imageUrl || ""}
            uploading={uploading}
            onUpload={() =>
              void uploadSingle()
            }
            onRemove={() =>
              onChange({ imageUrl: "" })
            }
          />
        )}

        {section.type === "gallery" && (
          <GalleryEditor
            images={section.images || []}
            uploading={uploading}
            onAdd={() =>
              void uploadGallery()
            }
            onRemove={(index) =>
              onChange({
                images: (
                  section.images || []
                ).filter(
                  (_, current) =>
                    current !== index
                ),
              })
            }
            onMove={moveGalleryImage}
          />
        )}

        {supports(
          section.type,
          "button"
        ) && (
          <>
            <Field
              label="Tekst przycisku"
              value={
                section.buttonLabel || ""
              }
              onChange={(value) =>
                onChange({
                  buttonLabel: value,
                })
              }
            />
            <Field
              label="Link przycisku"
              value={
                section.buttonHref || ""
              }
              onChange={(value) =>
                onChange({
                  buttonHref: value,
                })
              }
              placeholder="#kontakt"
            />
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="mt-8 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
      >
        Usuń tę sekcję
      </button>
    </div>
  );
}

function DesignPanel({
  templateKey,
  previewTemplateKey,
  onPreviewTemplate,
  onApplyPreview,
  onCancelPreview,
  logoUrl,
  onLogoChange,
  onUpload,
  uploading,
  primaryColor,
  accentColor,
  backgroundColor,
  textColor,
  onPrimaryColor,
  onAccentColor,
  onBackgroundColor,
  onTextColor,
}: {
  templateKey: string;
  previewTemplateKey: string | null;
  onPreviewTemplate: (value: string) => void;
  onApplyPreview: () => void;
  onCancelPreview: () => void;
  logoUrl: string;
  onLogoChange: (value: string) => void;
  onUpload: () => Promise<string>;
  uploading: boolean;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  onPrimaryColor: (value: string) => void;
  onAccentColor: (value: string) => void;
  onBackgroundColor: (value: string) => void;
  onTextColor: (value: string) => void;
}) {
  async function uploadLogo() {
    try {
      onLogoChange(await onUpload());
    } catch {
      // no-op
    }
  }

  const previewTemplate = LAKE_WEBSITE_TEMPLATES.find(
    (item) => item.key === previewTemplateKey
  );

  const selectedTemplate = LAKE_WEBSITE_TEMPLATES.find(
    (item) => item.key === templateKey
  );

  return (
    <div className="space-y-8 p-4 pb-10">
      <PanelHeading
        eyebrow="Wygląd"
        title="Projekt strony"
        description="Wybierz gotowy kierunek artystyczny. Każdy preset zmienia nie tylko kolory, ale cały układ i charakter strony."
      />

      {previewTemplate && (
        <div className="sticky top-0 z-10 -mx-1 rounded-2xl border border-blue-200 bg-blue-50/95 p-4 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-600">
                Podgląd na żywo
              </p>
              <p className="mt-1 text-base font-extrabold text-slate-950">
                {previewTemplate.label}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-blue-700/65">
                {previewTemplate.category}
              </p>
            </div>

            <div className="flex gap-1">
              {previewTemplate.swatches.map((color) => (
                <span
                  key={color}
                  className="h-4 w-4 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-blue-950/62">
            Zastosowanie zmieni układ i warianty sekcji. Teksty i zdjęcia są
            przenoszone do odpowiadających im elementów nowego projektu.
          </p>

          <div className="mt-4 grid grid-cols-[.8fr_1.2fr] gap-2">
            <button
              type="button"
              onClick={onCancelPreview}
              className="rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={onApplyPreview}
              className="rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              Użyj tego projektu
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <Label>Gotowe projekty</Label>
            <p className="text-[11px] leading-5 text-slate-400">
              Kliknij projekt, aby obejrzeć go na pełnej stronie po prawej.
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {LAKE_WEBSITE_TEMPLATES.length} projekty
          </span>
        </div>

        <div className="space-y-4">
          {LAKE_WEBSITE_TEMPLATES.map((template) => {
            const selected = template.key === templateKey;
            const previewing = template.key === previewTemplateKey;

            return (
              <article
                key={template.key}
                className={`overflow-hidden rounded-[22px] border bg-white transition ${
                  previewing
                    ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,.08)]"
                    : selected
                      ? "border-emerald-300"
                      : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onPreviewTemplate(template.key)}
                  className="block w-full text-left"
                >
                  <TemplateThumbnail templateKey={template.key} />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold tracking-[-.02em] text-slate-950">
                            {template.label}
                          </h3>

                          {selected && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                              Aktualny
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-blue-600">
                          {template.category}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        {template.swatches.slice(0, 4).map((color) => (
                          <span
                            key={color}
                            className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] leading-5 text-slate-500">
                      {template.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {template.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-500"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[10px] text-slate-400">
                        {template.bestFor}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600">
                        {previewing ? "Podglądasz →" : "Pełny podgląd →"}
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-7">
        <PanelHeading
          eyebrow="Branding"
          title="Logo i kolor marki"
          description="Zmieniaj tylko najważniejsze elementy identyfikacji. Resztę dopasowuje projekt."
        />

        <div className="mt-5">
          <ImageField
            label="Logo łowiska"
            url={logoUrl}
            uploading={uploading}
            onUpload={() => void uploadLogo()}
            onRemove={() => onLogoChange("")}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ColorField
            label="Kolor marki"
            value={primaryColor}
            onChange={onPrimaryColor}
          />
          <ColorField
            label="Akcent"
            value={accentColor}
            onChange={onAccentColor}
          />
        </div>

        <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-slate-600">
            Ustawienia zaawansowane
          </summary>
          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 p-4">
            <ColorField
              label="Tło"
              value={backgroundColor}
              onChange={onBackgroundColor}
            />
            <ColorField
              label="Tekst"
              value={textColor}
              onChange={onTextColor}
            />
          </div>
        </details>

        {selectedTemplate && (
          <p className="mt-3 text-[10px] leading-5 text-slate-400">
            Projekt <strong>{selectedTemplate.label}</strong> posiada własny
            system kolorów. Zmiana koloru marki nie zmienia ręcznie każdego
            elementu strony.
          </p>
        )}
      </div>
    </div>
  );
}

function TemplateThumbnail({
  templateKey,
}: {
  templateKey: string;
}) {
  if (templateKey === "carp-lodge") {
    return (
      <div className="relative h-56 overflow-hidden bg-[#0D1110] p-4 text-[#F4F0E7]">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="h-2.5 w-24 bg-[#C69A63]" />
          <div className="flex gap-2">
            <div className="h-1.5 w-8 bg-white/18" />
            <div className="h-1.5 w-8 bg-white/18" />
          </div>
        </div>

        <div className="mt-4 grid h-[165px] grid-cols-[.82fr_1.18fr] gap-3">
          <div className="flex flex-col justify-center">
            <div className="h-2.5 w-16 bg-[#C69A63]/65" />
            <div className="mt-3 h-5 w-full bg-white" />
            <div className="mt-1.5 h-5 w-5/6 bg-white" />
            <div className="mt-4 h-2 w-full bg-white/13" />
            <div className="mt-1.5 h-2 w-3/4 bg-white/13" />
            <div className="mt-4 h-6 w-20 bg-[#C69A63]" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-[#526150] via-[#28352D] to-[#111715]">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#0D1110]/65 to-transparent" />
            <div className="absolute bottom-3 right-3 h-7 w-16 border border-white/15 bg-black/20" />
          </div>
        </div>
      </div>
    );
  }

  if (templateKey === "wild-water") {
    return (
      <div className="relative h-56 overflow-hidden bg-[#F4F0E5] p-4 text-[#263129]">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded-full bg-[#3F654F]/28" />
          <div className="h-2 w-20 rounded-full bg-[#263129]/10" />
        </div>

        <div className="mt-4 grid h-[165px] grid-cols-[.9fr_1.1fr] items-center gap-4">
          <div>
            <div className="h-2.5 w-16 bg-[#3F654F]/65" />
            <div className="mt-3 h-4 w-full bg-[#263129]" />
            <div className="mt-1.5 h-4 w-4/5 bg-[#263129]" />
            <div className="mt-4 h-2 w-full bg-[#263129]/13" />
            <div className="mt-1.5 h-2 w-3/4 bg-[#263129]/13" />
            <div className="mt-4 h-6 w-20 rounded-full bg-[#3F654F]" />
          </div>

          <div className="relative">
            <div className="h-[150px] rounded-[52%_48%_46%_54%/42%_44%_56%_58%] bg-gradient-to-br from-[#9BAD92] to-[#3F654F]" />
            <div className="absolute -bottom-2 -left-2 h-10 w-16 rounded-[14px_3px_14px_3px] bg-[#A77A4B]" />
          </div>
        </div>
      </div>
    );
  }

  if (templateKey === "fishery-club") {
    return (
      <div className="h-56 overflow-hidden bg-white p-4 text-black">
        <div className="flex items-center justify-between border-b border-black pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-[#F05A28]" />
            <div className="h-3 w-20 bg-black" />
          </div>
          <div className="h-1.5 w-20 bg-black/16" />
        </div>

        <div className="mt-4 grid h-[160px] grid-cols-[1.12fr_.88fr] gap-3">
          <div className="flex flex-col justify-center">
            <div className="h-2.5 w-20 bg-[#F05A28]" />
            <div className="mt-3 h-6 w-full bg-black" />
            <div className="mt-1.5 h-6 w-5/6 bg-black" />
            <div className="mt-4 h-2 w-full bg-black/12" />
            <div className="mt-1.5 h-2 w-2/3 bg-black/12" />
            <div className="mt-4 flex gap-1">
              <div className="h-1.5 w-10 bg-black" />
              <div className="h-1.5 w-10 bg-black/15" />
              <div className="h-1.5 w-10 bg-black/15" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-black via-slate-700 to-[#F05A28]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#061426] via-[#0D3567] to-[#155EEF] p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded-full bg-white/90" />
        <div className="flex gap-2">
          <div className="h-1.5 w-8 rounded bg-white/22" />
          <div className="h-1.5 w-8 rounded bg-white/22" />
          <div className="h-1.5 w-8 rounded bg-white/22" />
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-5">
        <div className="h-2.5 w-24 rounded-full bg-[#6ED5D0]" />
        <div className="mt-3 h-6 w-4/5 rounded bg-white" />
        <div className="mt-1.5 h-6 w-3/5 rounded bg-white" />
        <div className="mt-4 h-2 w-2/3 rounded bg-white/25" />
        <div className="mt-1.5 h-2 w-1/2 rounded bg-white/20" />
        <div className="mt-4 h-7 w-24 rounded-xl bg-white" />
      </div>

      <div className="absolute right-10 top-14 h-20 w-20 rounded-full border border-white/20" />
      <div className="absolute right-0 top-0 h-full w-[30%] border-l border-white/10 bg-white/[.025]" />
    </div>
  );
}

function SettingsPanel({
  subdomain,
  rootDomain,
  subdomainError,
  onSubdomain,
  siteName,
  onSiteName,
  contactPhone,
  contactEmail,
  contactWebsite,
  onContactPhone,
  onContactEmail,
  onContactWebsite,
  seoTitle,
  seoDescription,
  onSeoTitle,
  onSeoDescription,
}: {
  subdomain: string;
  rootDomain: string;
  subdomainError: string | null;
  onSubdomain: (
    value: string
  ) => void;
  siteName: string;
  onSiteName: (value: string) => void;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  onContactPhone: (
    value: string
  ) => void;
  onContactEmail: (
    value: string
  ) => void;
  onContactWebsite: (
    value: string
  ) => void;
  seoTitle: string;
  seoDescription: string;
  onSeoTitle: (value: string) => void;
  onSeoDescription: (
    value: string
  ) => void;
}) {
  return (
    <div className="space-y-7 p-4 pb-8">
      <PanelHeading
        eyebrow="Ustawienia"
        title="Strona i SEO"
        description="Adres, nazwa i dane używane na całej stronie."
      />

      <div>
        <Label>Adres strony</Label>
        <div className="flex items-center rounded-2xl border border-slate-200 px-3 focus-within:border-blue-500">
          <input
            value={subdomain}
            onChange={(event) =>
              onSubdomain(
                normalizeLakeWebsiteSubdomain(
                  event.target.value
                )
              )
            }
            className="h-12 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
          />
          <span className="text-xs font-semibold text-slate-400">
            .{rootDomain}
          </span>
        </div>

        {subdomainError && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            {subdomainError}
          </p>
        )}
      </div>

      <Field
        label="Nazwa strony"
        value={siteName}
        onChange={onSiteName}
      />

      <div className="border-t border-slate-200 pt-6">
        <Label>Dane kontaktowe</Label>
        <div className="space-y-3">
          <Field
            label="Telefon"
            value={contactPhone}
            onChange={onContactPhone}
          />
          <Field
            label="E-mail"
            value={contactEmail}
            onChange={onContactEmail}
          />
          <Field
            label="Strona / link"
            value={contactWebsite}
            onChange={onContactWebsite}
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <Label>SEO</Label>
        <div className="space-y-3">
          <Field
            label="Tytuł SEO"
            value={seoTitle}
            onChange={onSeoTitle}
          />
          <TextArea
            label="Opis SEO"
            value={seoDescription}
            rows={4}
            onChange={onSeoDescription}
          />
        </div>
      </div>
    </div>
  );
}

function BuilderFooter({
  saving,
  message,
  published,
  disabled,
  onSave,
  onPublish,
  publicUrl,
}: {
  saving: boolean;
  message: string;
  published: boolean;
  disabled: boolean;
  onSave: () => void;
  onPublish: () => void;
  publicUrl: string;
}) {
  return (
    <div className="border-t border-slate-200 bg-white p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      {message && (
        <p className="mb-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
          {message}
        </p>
      )}

      <div className="grid grid-cols-[1fr_1.25fr] gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold text-slate-700 disabled:opacity-50"
        >
          Zapisz
        </button>

        <button
          type="button"
          disabled={
            saving || disabled
          }
          onClick={onPublish}
          className="rounded-xl bg-blue-600 px-3 py-3 text-xs font-bold text-white disabled:opacity-50"
        >
          {published
            ? "Aktualizuj"
            : "Opublikuj"}
        </button>
      </div>

      {published && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-[11px] font-semibold text-blue-600 hover:underline"
        >
          Otwórz stronę ↗
        </a>
      )}
    </div>
  );
}

function GalleryEditor({
  images,
  uploading,
  onAdd,
  onRemove,
  onMove,
}: {
  images: string[];
  uploading: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (
    from: number,
    to: number
  ) => void;
}) {
  const [
    draggingIndex,
    setDraggingIndex,
  ] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Label>Zdjęcia galerii</Label>
        <span className="text-[10px] font-semibold text-slate-400">
          Przeciągnij, aby ustawić kolejność
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={() =>
              setDraggingIndex(index)
            }
            onDragEnd={() =>
              setDraggingIndex(null)
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={() => {
              if (
                draggingIndex !== null
              ) {
                onMove(
                  draggingIndex,
                  index
                );
              }
              setDraggingIndex(null);
            }}
            className={`group relative overflow-hidden rounded-xl bg-slate-100 ring-1 transition ${
              draggingIndex === index
                ? "opacity-50 ring-blue-400"
                : "ring-slate-200"
            }`}
          >
            <img
              src={url}
              alt=""
              className="h-28 w-full object-cover"
            />

            <div className="absolute left-1.5 top-1.5 rounded-lg bg-black/55 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
              ⋮⋮ {index + 1}
            </div>

            <button
              type="button"
              onClick={() =>
                onRemove(index)
              }
              className="absolute right-1.5 top-1.5 rounded-lg bg-white/95 px-2 py-1 text-[9px] font-bold text-red-600 shadow"
            >
              Usuń
            </button>

            <div className="absolute inset-x-1.5 bottom-1.5 grid grid-cols-2 gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                disabled={index === 0}
                onClick={() =>
                  onMove(
                    index,
                    index - 1
                  )
                }
                className="rounded-lg bg-white/95 py-1.5 text-xs font-bold text-slate-700 shadow disabled:opacity-30"
                title="Przesuń wcześniej"
              >
                ←
              </button>
              <button
                type="button"
                disabled={
                  index ===
                  images.length - 1
                }
                onClick={() =>
                  onMove(
                    index,
                    index + 1
                  )
                }
                className="rounded-lg bg-white/95 py-1.5 text-xs font-bold text-slate-700 shadow disabled:opacity-30"
                title="Przesuń później"
              >
                →
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          disabled={uploading}
          onClick={onAdd}
          className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-bold text-slate-500 disabled:opacity-50"
        >
          + Zdjęcie
        </button>
      </div>
    </div>
  );
}

function SectionDataSourceEditor({
  section,
  lake,
  onChange,
}: {
  section: LakeWebsiteSection;
  lake: PublicLakeWebsiteData["lake"];
  onChange: (patch: Partial<LakeWebsiteSection>) => void;
}) {
  const rybioItems = getRybioSectionItems(section.type, lake);
  const isCustom = section.dataSource === "custom";
  const items = isCustom ? section.items || [] : rybioItems;

  function enableCustom() {
    onChange({
      dataSource: "custom",
      items: [...rybioItems],
    });
  }

  function useRybio() {
    onChange({
      dataSource: "rybio",
      items: undefined,
    });
  }

  function importAgain() {
    onChange({
      dataSource: "custom",
      items: [...rybioItems],
    });
  }

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange({ items: next });
  }

  function addItem() {
    onChange({
      dataSource: "custom",
      items: [...items, ""],
    });
  }

  function removeItem(index: number) {
    onChange({
      items: items.filter((_, current) => current !== index),
    });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= items.length) {
      return;
    }

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);

    onChange({ items: next });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-slate-900">
            Źródło danych
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {isCustom
              ? "Ta sekcja ma własną wersję danych. Zmiany nie wpływają na profil łowiska w Rybio."
              : "Ta sekcja korzysta automatycznie z aktualnych danych profilu łowiska w Rybio."}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
            isCustom
              ? "bg-violet-100 text-violet-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isCustom ? "Własne" : "Rybio"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={useRybio}
          className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
            !isCustom
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200"
          }`}
        >
          Dane z Rybio
        </button>

        <button
          type="button"
          onClick={enableCustom}
          className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
            isCustom
              ? "bg-violet-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200"
          }`}
        >
          Własne dane
        </button>
      </div>

      {!isCustom ? (
        <div className="mt-4">
          <div className="space-y-2">
            {items.length > 0 ? (
              items.slice(0, 8).map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200"
                >
                  <span className="mt-0.5 text-[9px] font-bold text-slate-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] leading-5 text-slate-600">
                    {item}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-white px-3 py-4 text-center text-[11px] text-slate-400 ring-1 ring-slate-200">
                Brak danych w profilu łowiska.
              </p>
            )}

            {items.length > 8 && (
              <p className="text-center text-[10px] font-semibold text-slate-400">
                + {items.length - 8} kolejnych pozycji
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={enableCustom}
            className="mt-3 w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
          >
            Skopiuj dane i edytuj niezależnie
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[auto_1fr_auto] items-start gap-2"
              >
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200 disabled:opacity-25"
                    title="Przesuń wyżej"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200 disabled:opacity-25"
                    title="Przesuń niżej"
                  >
                    ↓
                  </button>
                </div>

                <textarea
                  value={item}
                  rows={section.type === "fish" ? 1 : 2}
                  onChange={(event) => updateItem(index, event.target.value)}
                  placeholder={
                    section.type === "fish"
                      ? "Nazwa gatunku"
                      : section.type === "priceList"
                        ? "Pozycja cennika"
                        : "Punkt regulaminu"
                  }
                  className="min-h-11 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50"
                />

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-500 transition hover:bg-red-100"
                  aria-label="Usuń pozycję"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 w-full rounded-xl border border-dashed border-violet-300 bg-white px-3 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50"
          >
            + Dodaj pozycję
          </button>

          <div className="mt-4 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={importAgain}
              className="w-full rounded-xl bg-slate-200/70 px-3 py-2.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
            >
              Pobierz ponownie z Rybio
            </button>
            <p className="mt-2 text-[9px] leading-4 text-slate-400">
              Zastąpi własną listę aktualnymi danymi z profilu łowiska.
              Nic nie zostanie zapisane, dopóki nie klikniesz „Zapisz”
              lub „Aktualizuj”.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function isDataBackedSection(type: LakeWebsiteSectionType) {
  return type === "fish" || type === "priceList" || type === "rules";
}

function getRybioSectionItems(
  type: LakeWebsiteSectionType,
  lake: PublicLakeWebsiteData["lake"]
) {
  if (type === "fish") {
    if (lake.fishSpecies.length > 0) {
      return lake.fishSpecies.map((item) => item.name);
    }

    return lake.fish
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (type === "priceList") {
    return lake.priceList.map((item) => item.text);
  }

  if (type === "rules") {
    return lake.rules.map((item) => item.text);
  }

  return [];
}

function VariantField({
  section,
  onChange,
}: {
  section: LakeWebsiteSection;
  onChange: (
    patch: Partial<LakeWebsiteSection>
  ) => void;
}) {
  const variants = getVariants(
    section.type
  );

  if (variants.length < 2) {
    return null;
  }

  return (
    <label className="block">
      <Label>Układ sekcji</Label>
      <select
        value={section.variant}
        onChange={(event) =>
          onChange({
            variant:
              event.target.value,
          })
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500"
      >
        {variants.map(
          ([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function getVariants(
  type: LakeWebsiteSectionType
): Array<[string, string]> {
  if (type === "hero") {
    return [
      ["cover", "Zdjęcie w tle"],
      ["split", "Tekst + zdjęcie"],
    ];
  }

  if (type === "about") {
    return [
      [
        "image-right",
        "Zdjęcie po prawej",
      ],
      [
        "image-left",
        "Zdjęcie po lewej",
      ],
      ["text", "Sam tekst"],
    ];
  }

  if (type === "gallery") {
    return [
      ["grid", "Mozaika"],
      ["wide", "Duże kafelki"],
    ];
  }

  if (type === "fish") {
    return [
      ["pills", "Etykiety"],
      ["list", "Lista"],
    ];
  }

  if (type === "cta") {
    return [
      ["solid", "Kolor"],
      ["image", "Zdjęcie w tle"],
    ];
  }

  return [["list", "Lista"]];
}

function supports(
  type: LakeWebsiteSectionType,
  field:
    | "eyebrow"
    | "title"
    | "subtitle"
    | "text"
    | "image"
    | "button"
) {
  const map: Record<
    LakeWebsiteSectionType,
    Array<typeof field>
  > = {
    hero: [
      "eyebrow",
      "title",
      "subtitle",
      "image",
      "button",
    ],
    about: [
      "eyebrow",
      "title",
      "text",
      "image",
    ],
    gallery: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    fish: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    priceList: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    rules: [
      "eyebrow",
      "title",
      "subtitle",
    ],
    contact: [
      "eyebrow",
      "title",
      "text",
    ],
    cta: [
      "eyebrow",
      "title",
      "text",
      "image",
      "button",
    ],
  };

  return map[type].includes(field);
}

function ImageField({
  label,
  url,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>

      {url ? (
        <div>
          <img
            src={url}
            alt=""
            className="h-36 w-full rounded-2xl bg-slate-100 object-cover"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={onUpload}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
            >
              Zmień
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
            >
              Usuń
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={onUpload}
          className="flex h-28 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs font-bold text-slate-500"
        >
          {uploading
            ? "Wysyłanie…"
            : "+ Wybierz zdjęcie"}
        </button>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeValue =
    /^#[0-9a-fA-F]{6}$/.test(value)
      ? value
      : "#000000";

  return (
    <label>
      <span className="mb-1.5 block text-[11px] font-semibold text-slate-500">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
        <input
          type="color"
          value={safeValue}
          onChange={(event) =>
            onChange(
              event.target.value.toUpperCase()
            )
          }
          className="h-7 w-8 cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-w-0 flex-1 bg-transparent text-[11px] font-bold uppercase outline-none"
        />
      </div>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
      />
    </label>
  );
}

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="mb-2 block text-xs font-bold text-slate-700">
      {children}
    </span>
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-extrabold text-slate-950">
        {title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PanelBack({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-bold text-blue-600 hover:text-blue-700"
    >
      ← {label}
    </button>
  );
}

function MiniButton({
  children,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
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
      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold disabled:opacity-25 ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
