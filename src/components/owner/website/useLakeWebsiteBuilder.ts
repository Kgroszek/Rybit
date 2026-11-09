"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { PublicLakeWebsiteData } from "@/components/lake-websites/LakeWebsiteRenderer";
import type {
  LakeWebsiteBuilderProps,
  LakeWebsiteEditableSnapshot,
  WebsiteBuilderDevice,
  WebsiteBuilderMessage,
  WebsiteBuilderMode,
  WebsiteSaveAction,
} from "@/components/owner/website/types";
import {
  WEBSITE_IMAGE_ACCEPT,
  WEBSITE_IMAGE_MAX_BYTES,
  WEBSITE_IMAGE_TYPES,
  buildPublicWebsiteUrl,
  cloneSnapshot,
  snapshotSignature,
} from "@/components/owner/website/website-builder-utils";
import {
  createLakeWebsiteSection,
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

function createInitialSnapshot({
  lakeName,
  initialWebsite,
}: Pick<
  LakeWebsiteBuilderProps,
  "lakeName" | "initialWebsite"
>): LakeWebsiteEditableSnapshot {
  return {
    subdomain:
      normalizeLakeWebsiteSubdomain(
        initialWebsite.subdomain
      ),
    templateKey:
      resolveLakeWebsiteTemplateKey(
        initialWebsite.templateKey
      ),
    siteName:
      initialWebsite.siteName ||
      lakeName,
    logoUrl:
      initialWebsite.logoUrl || "",
    primaryColor:
      initialWebsite.primaryColor,
    accentColor:
      initialWebsite.accentColor,
    backgroundColor:
      initialWebsite.backgroundColor,
    textColor:
      initialWebsite.textColor,
    contactPhone:
      initialWebsite.contactPhone || "",
    contactEmail:
      initialWebsite.contactEmail || "",
    contactWebsite:
      initialWebsite.contactWebsite || "",
    seoTitle:
      initialWebsite.seoTitle || "",
    seoDescription:
      initialWebsite.seoDescription || "",
    status:
      initialWebsite.status === "published"
        ? "published"
        : "draft",
    sections:
      initialWebsite.sections,
  };
}

export function useLakeWebsiteBuilder({
  lakeSlug,
  lakeName,
  rootDomain,
  initialWebsite,
  lake,
}: LakeWebsiteBuilderProps) {
  const router = useRouter();

  const initialSnapshot = useMemo(
    () =>
      createInitialSnapshot({
        lakeName,
        initialWebsite,
      }),
    [lakeName, initialWebsite]
  );

  const [savedSnapshot, setSavedSnapshot] =
    useState<LakeWebsiteEditableSnapshot>(
      () => cloneSnapshot(initialSnapshot)
    );

  const [snapshot, setSnapshot] =
    useState<LakeWebsiteEditableSnapshot>(
      () => cloneSnapshot(initialSnapshot)
    );

  const [mode, setMode] =
    useState<WebsiteBuilderMode>("sections");

  const [device, setDevice] =
    useState<WebsiteBuilderDevice>("desktop");

  const [
    selectedSectionId,
    setSelectedSectionId,
  ] = useState<string | null>(null);

  const [libraryOpen, setLibraryOpen] =
    useState(false);

  const [
    previewTemplateKey,
    setPreviewTemplateKey,
  ] = useState<string | null>(null);

  const [savingAction, setSavingAction] =
    useState<WebsiteSaveAction | null>(
      null
    );

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState<WebsiteBuilderMessage | null>(
      null
    );

  const templateDefaults = useMemo(
    () => ({
      lakeName,
      description: lake.description,
      images: lake.images.map(
        (image) => image.url
      ),
    }),
    [
      lakeName,
      lake.description,
      lake.images,
    ]
  );

  const normalizedSubdomain =
    normalizeLakeWebsiteSubdomain(
      snapshot.subdomain
    );

  const subdomainError =
    validateLakeWebsiteSubdomain(
      normalizedSubdomain
    );

  const isDirty =
    useMemo(
      () =>
        snapshotSignature(snapshot) !==
        snapshotSignature(savedSnapshot),
      [snapshot, savedSnapshot]
    );

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent
    ) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [isDirty]);

  const selectedSection =
    snapshot.sections.find(
      (section) =>
        section.id === selectedSectionId
    ) || null;

  const previewPreset =
    previewTemplateKey
      ? getLakeWebsiteTemplatePreset(
          resolveLakeWebsiteTemplateKey(
            previewTemplateKey
          )
        )
      : null;

  const previewSections = useMemo(
    () =>
      previewTemplateKey
        ? buildTemplateSections({
            templateKey:
              resolveLakeWebsiteTemplateKey(
                previewTemplateKey
              ),
            currentSections:
              snapshot.sections,
            defaults: templateDefaults,
            preview: true,
          })
        : snapshot.sections,
    [
      previewTemplateKey,
      snapshot.sections,
      templateDefaults,
    ]
  );

  const previewData =
    useMemo<PublicLakeWebsiteData>(
      () => ({
        website: {
          subdomain:
            normalizedSubdomain,
          templateKey:
            previewTemplateKey ||
            snapshot.templateKey,
          siteName:
            snapshot.siteName || null,
          logoUrl:
            snapshot.logoUrl || null,
          primaryColor: previewPreset
            ? previewPreset.palette
                .primaryColor
            : normalizeHexColor(
                snapshot.primaryColor,
                "#155EEF"
              ),
          accentColor: previewPreset
            ? previewPreset.palette
                .accentColor
            : normalizeHexColor(
                snapshot.accentColor,
                "#6ED5D0"
              ),
          backgroundColor: previewPreset
            ? previewPreset.palette
                .backgroundColor
            : normalizeHexColor(
                snapshot.backgroundColor,
                "#FFFFFF"
              ),
          textColor: previewPreset
            ? previewPreset.palette
                .textColor
            : normalizeHexColor(
                snapshot.textColor,
                "#0B1628"
              ),
          contactPhone:
            snapshot.contactPhone || null,
          contactEmail:
            snapshot.contactEmail || null,
          contactWebsite:
            snapshot.contactWebsite ||
            null,
          sections: previewSections,
        },
        lake,
      }),
      [
        lake,
        normalizedSubdomain,
        previewPreset,
        previewSections,
        previewTemplateKey,
        snapshot,
      ]
    );

  /*
   * Link „Otwórz stronę” ma prowadzić do faktycznie zapisanej
   * wersji publicznej. Użytkownik może w edytorze wpisać nową,
   * jeszcze niezapisaną (lub chwilowo błędną) subdomenę.
   */
  const publicUrl = useMemo(
    () =>
      buildPublicWebsiteUrl(
        savedSnapshot.subdomain,
        rootDomain
      ),
    [
      savedSnapshot.subdomain,
      rootDomain,
    ]
  );

  function patchSnapshot(
    patch: Partial<LakeWebsiteEditableSnapshot>
  ) {
    setSnapshot((current) => ({
      ...current,
      ...patch,
    }));
  }

  const selectSection = useCallback(
    (sectionId: string) => {
      setPreviewTemplateKey(null);
      setMode("sections");
      setLibraryOpen(false);
      setSelectedSectionId(sectionId);
    },
    []
  );

  function updateSection(
    id: string,
    patch: Partial<LakeWebsiteSection>
  ) {
    setSnapshot((current) => ({
      ...current,
      sections:
        current.sections.map(
          (section) =>
            section.id === id
              ? {
                  ...section,
                  ...patch,
                }
              : section
        ),
    }));
  }

  function addSection(
    type: LakeWebsiteSectionType
  ) {
    if (
      snapshot.sections.length >= 30
    ) {
      setMessage({
        tone: "error",
        text:
          "Strona może zawierać maksymalnie 30 sekcji.",
      });
      return;
    }

    const next =
      createLakeWebsiteSection(
        type,
        templateDefaults
      );

    setSnapshot((current) => ({
      ...current,
      sections: [
        ...current.sections,
        next,
      ],
    }));

    setSelectedSectionId(next.id);
    setLibraryOpen(false);
  }

  function removeSection(id: string) {
    setSnapshot((current) => {
      if (
        current.sections.length <= 1
      ) {
        return current;
      }

      return {
        ...current,
        sections:
          current.sections.filter(
            (section) =>
              section.id !== id
          ),
      };
    });

    setSelectedSectionId(null);
  }

  function moveSection(
    id: string,
    direction: -1 | 1
  ) {
    setSnapshot((current) => {
      const index =
        current.sections.findIndex(
          (section) =>
            section.id === id
        );

      const target = index + direction;

      if (
        index < 0 ||
        target < 0 ||
        target >=
          current.sections.length
      ) {
        return current;
      }

      const sections = [
        ...current.sections,
      ];

      const [moved] =
        sections.splice(index, 1);

      sections.splice(
        target,
        0,
        moved
      );

      return {
        ...current,
        sections,
      };
    });
  }

  function dragSection(
    sourceId: string,
    targetId: string
  ) {
    if (sourceId === targetId) {
      return;
    }

    setSnapshot((current) => {
      const sourceIndex =
        current.sections.findIndex(
          (section) =>
            section.id === sourceId
        );

      const targetIndex =
        current.sections.findIndex(
          (section) =>
            section.id === targetId
        );

      if (
        sourceIndex < 0 ||
        targetIndex < 0
      ) {
        return current;
      }

      const sections = [
        ...current.sections,
      ];

      const [moved] =
        sections.splice(
          sourceIndex,
          1
        );

      sections.splice(
        targetIndex,
        0,
        moved
      );

      return {
        ...current,
        sections,
      };
    });
  }

  async function uploadImage() {
    return new Promise<string>(
      (resolve, reject) => {
        const input =
          document.createElement(
            "input"
          );

        input.type = "file";
        input.accept =
          WEBSITE_IMAGE_ACCEPT;

        input.onchange =
          async () => {
            const file =
              input.files?.[0];

            if (!file) {
              reject(
                new Error(
                  "Nie wybrano zdjęcia."
                )
              );
              return;
            }

            if (
              !WEBSITE_IMAGE_TYPES.has(
                file.type
              )
            ) {
              const error =
                new Error(
                  "Dozwolone formaty: JPG, PNG, WEBP i AVIF."
                );

              setMessage({
                tone: "error",
                text: error.message,
              });

              reject(error);
              return;
            }

            if (
              file.size >
              WEBSITE_IMAGE_MAX_BYTES
            ) {
              const error =
                new Error(
                  "Zdjęcie może mieć maksymalnie 8 MB."
                );

              setMessage({
                tone: "error",
                text: error.message,
              });

              reject(error);
              return;
            }

            setUploading(true);
            setMessage(null);

            try {
              const form =
                new FormData();

              form.append(
                "image",
                file
              );

              const response =
                await fetch(
                  `/api/owner/lakes/${lakeSlug}/website/upload`,
                  {
                    method: "POST",
                    body: form,
                  }
                );

              const payload =
                (await response
                  .json()
                  .catch(
                    () => null
                  )) as
                  | {
                      url?: string;
                      message?: string;
                    }
                  | null;

              if (
                !response.ok ||
                !payload?.url
              ) {
                throw new Error(
                  payload?.message ||
                    "Nie udało się przesłać zdjęcia."
                );
              }

              resolve(payload.url);
            } catch (error) {
              const text =
                error instanceof Error
                  ? error.message
                  : "Nie udało się przesłać zdjęcia.";

              setMessage({
                tone: "error",
                text,
              });

              reject(error);
            } finally {
              setUploading(false);
            }
          };

        input.click();
      }
    );
  }

  function previewTemplate(
    key: string
  ) {
    setMode("design");
    setSelectedSectionId(null);
    setLibraryOpen(false);
    setPreviewTemplateKey(key);
  }

  function cancelTemplatePreview() {
    setPreviewTemplateKey(null);
  }

  function applyPreviewTemplate() {
    if (!previewTemplateKey) {
      return;
    }

    const nextKey =
      resolveLakeWebsiteTemplateKey(
        previewTemplateKey
      );

    const preset =
      getLakeWebsiteTemplatePreset(
        nextKey
      );

    const sections =
      buildTemplateSections({
        templateKey: nextKey,
        currentSections:
          snapshot.sections,
        defaults: templateDefaults,
        preview: false,
      });

    setSnapshot((current) => ({
      ...current,
      templateKey: nextKey,
      primaryColor:
        preset.palette.primaryColor,
      accentColor:
        preset.palette.accentColor,
      backgroundColor:
        preset.palette
          .backgroundColor,
      textColor:
        preset.palette.textColor,
      sections,
    }));

    setSelectedSectionId(null);
    setPreviewTemplateKey(null);

    const label =
      LAKE_WEBSITE_TEMPLATES.find(
        (template) =>
          template.key === nextKey
      )?.label || nextKey;

    setMessage({
      tone: "info",
      text: `Zastosowano projekt ${label}. Zapisz zmiany, aby je zachować.`,
    });
  }

  function changeMode(
    nextMode: WebsiteBuilderMode
  ) {
    if (nextMode !== "design") {
      setPreviewTemplateKey(null);
    }

    setMode(nextMode);
    setSelectedSectionId(null);
    setLibraryOpen(false);
  }

  async function save(
    nextStatus: "draft" | "published",
    action: WebsiteSaveAction
  ) {
    setMessage(null);
    setPreviewTemplateKey(null);

    if (subdomainError) {
      setMode("settings");

      setMessage({
        tone: "error",
        text: subdomainError,
      });

      return false;
    }

    if (
      snapshot.sections.length === 0
    ) {
      setMode("sections");

      setMessage({
        tone: "error",
        text:
          "Strona musi zawierać co najmniej jedną sekcję.",
      });

      return false;
    }

    setSavingAction(action);

    try {
      const response = await fetch(
        `/api/owner/lakes/${lakeSlug}/website`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subdomain:
              normalizedSubdomain,
            templateKey:
              snapshot.templateKey,
            siteName:
              snapshot.siteName,
            logoUrl:
              snapshot.logoUrl ||
              null,
            primaryColor:
              snapshot.primaryColor,
            accentColor:
              snapshot.accentColor,
            backgroundColor:
              snapshot.backgroundColor,
            textColor:
              snapshot.textColor,
            contactPhone:
              snapshot.contactPhone,
            contactEmail:
              snapshot.contactEmail,
            contactWebsite:
              snapshot.contactWebsite,
            seoTitle:
              snapshot.seoTitle,
            seoDescription:
              snapshot.seoDescription,
            sections:
              snapshot.sections,
            status: nextStatus,
          }),
        }
      );

      const payload =
        (await response
          .json()
          .catch(() => null)) as
          | {
              message?: string;
              subdomain?: string;
              status?: string;
            }
          | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            "Nie udało się zapisać strony."
        );
      }

      const saved:
        LakeWebsiteEditableSnapshot = {
          ...snapshot,
          subdomain:
            payload?.subdomain ||
            normalizedSubdomain,
          status: nextStatus,
        };

      setSnapshot(
        cloneSnapshot(saved)
      );

      setSavedSnapshot(
        cloneSnapshot(saved)
      );

      setMessage({
        tone: "success",
        text:
          action === "publish"
            ? "Strona została opublikowana."
            : action === "published"
              ? "Zmiany na opublikowanej stronie zostały zapisane."
              : action === "unpublish"
                ? "Publikacja została wyłączona. Strona jest teraz szkicem."
                : "Szkic został zapisany.",
      });

      router.refresh();

      return true;
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać strony.",
      });

      return false;
    } finally {
      setSavingAction(null);
    }
  }

  function resetToSaved() {
    setSnapshot(
      cloneSnapshot(savedSnapshot)
    );

    setPreviewTemplateKey(null);
    setSelectedSectionId(null);
    setLibraryOpen(false);

    setMessage({
      tone: "info",
      text:
        "Przywrócono ostatnio zapisaną wersję.",
    });
  }

  return {
    mode,
    device,
    selectedSection,
    selectedSectionId,
    libraryOpen,
    previewTemplateKey,
    snapshot,
    previewData,
    normalizedSubdomain,
    subdomainError,
    publicUrl,
    isDirty,
    savingAction,
    uploading,
    message,

    setDevice,
    setLibraryOpen,
    setSelectedSectionId,
    setMessage,

    patchSnapshot,
    selectSection,
    updateSection,
    addSection,
    removeSection,
    moveSection,
    dragSection,
    uploadImage,
    previewTemplate,
    cancelTemplatePreview,
    applyPreviewTemplate,
    changeMode,
    save,
    resetToSaved,
  };
}

export type LakeWebsiteBuilderController =
  ReturnType<
    typeof useLakeWebsiteBuilder
  >;
