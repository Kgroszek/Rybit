"use client";

import {
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { LakeWebsiteBuilderCanvas } from "@/components/owner/LakeWebsiteBuilderCanvas";
import {
  DeleteWebsiteSectionDialog,
  LeaveWebsiteBuilderDialog,
  UnpublishWebsiteDialog,
} from "@/components/owner/website/WebsiteBuilderDialogs";
import { WebsiteBuilderSidebar } from "@/components/owner/website/WebsiteBuilderSidebar";
import { WebsiteBuilderToolbar } from "@/components/owner/website/WebsiteBuilderToolbar";
import type { LakeWebsiteBuilderProps } from "@/components/owner/website/types";
import {
  useLakeWebsiteBuilder,
} from "@/components/owner/website/useLakeWebsiteBuilder";
import { Button } from "@/components/ui/Button";
import type { LakeWebsiteSection } from "@/lib/lake-website-sections";

export function LakeWebsiteBuilder(
  props: LakeWebsiteBuilderProps
) {
  const router = useRouter();

  const controller =
    useLakeWebsiteBuilder(props);

  const [
    deleteSection,
    setDeleteSection,
  ] =
    useState<LakeWebsiteSection | null>(
      null
    );

  const [
    leaveConfirmOpen,
    setLeaveConfirmOpen,
  ] = useState(false);

  const [
    unpublishConfirmOpen,
    setUnpublishConfirmOpen,
  ] = useState(false);

  function requestBack() {
    if (controller.isDirty) {
      setLeaveConfirmOpen(true);
      return;
    }

    router.push(
      `/moje-lowiska/${props.lakeSlug}`
    );
  }

  function requestDeleteSection(
    section: LakeWebsiteSection
  ) {
    if (
      controller.snapshot.sections
        .length <= 1
    ) {
      controller.setMessage({
        tone: "error",
        text:
          "Strona musi zawierać co najmniej jedną sekcję.",
      });

      return;
    }

    setDeleteSection(section);
  }

  async function confirmUnpublish() {
    const saved =
      await controller.save(
        "draft",
        "unpublish"
      );

    if (saved) {
      setUnpublishConfirmOpen(false);
    }
  }

  const published =
    controller.snapshot.status ===
    "published";

  return (
    <div className="fixed inset-0 z-[100] flex min-h-0 flex-col overflow-hidden bg-background">
      <WebsiteBuilderToolbar
        lakeName={props.lakeName}
        status={
          controller.snapshot.status
        }
        device={controller.device}
        savingAction={
          controller.savingAction
        }
        isDirty={controller.isDirty}
        subdomainInvalid={Boolean(
          controller.subdomainError
        )}
        publicUrl={
          controller.publicUrl
        }
        message={controller.message}
        onDeviceChange={
          controller.setDevice
        }
        onBack={requestBack}
        onReset={
          controller.resetToSaved
        }
        onSaveDraft={() =>
          void controller.save(
            "draft",
            "draft"
          )
        }
        onPublish={() =>
          void controller.save(
            "published",
            "publish"
          )
        }
        onSavePublished={() =>
          void controller.save(
            "published",
            "published"
          )
        }
        onDismissMessage={() =>
          controller.setMessage(null)
        }
      />

      <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-[380px_minmax(0,1fr)]">
        <WebsiteBuilderSidebar
          controller={controller}
          rootDomain={
            props.rootDomain
          }
          lake={props.lake}
          onRequestDeleteSection={
            requestDeleteSection
          }
          onRequestUnpublish={() =>
            setUnpublishConfirmOpen(
              true
            )
          }
        />

        <main className="min-h-0 min-w-0">
          <LakeWebsiteBuilderCanvas
            lakeSlug={
              props.lakeSlug
            }
            data={
              controller.previewData
            }
            selectedSectionId={
              controller.selectedSectionId
            }
            device={
              controller.device
            }
            onSelectSection={
              controller.selectSection
            }
          />
        </main>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-10 lg:hidden">
        <div className="w-full max-w-md rounded-panel border border-border bg-surface p-6 text-center shadow-card">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
            Edytor strony WWW
          </p>

          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-text">
            Do edycji użyj większego ekranu
          </h2>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Pełny edytor wykorzystuje jednocześnie panel ustawień i podgląd strony. Otwórz go na komputerze lub tablecie w poziomie.
          </p>

          <div className="mt-6 grid gap-3">
            {published && (
              <a
                href={
                  controller.publicUrl
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover"
              >
                Otwórz stronę
              </a>
            )}

            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={requestBack}
            >
              Wróć do panelu łowiska
            </Button>
          </div>
        </div>
      </div>

      <DeleteWebsiteSectionDialog
        section={deleteSection}
        onClose={() =>
          setDeleteSection(null)
        }
        onConfirm={() => {
          if (!deleteSection) {
            return;
          }

          controller.removeSection(
            deleteSection.id
          );

          setDeleteSection(null);
        }}
      />

      <LeaveWebsiteBuilderDialog
        open={leaveConfirmOpen}
        onClose={() =>
          setLeaveConfirmOpen(false)
        }
        onLeave={() =>
          router.push(
            `/moje-lowiska/${props.lakeSlug}`
          )
        }
      />

      <UnpublishWebsiteDialog
        open={unpublishConfirmOpen}
        busy={
          controller.savingAction ===
          "unpublish"
        }
        onClose={() =>
          setUnpublishConfirmOpen(
            false
          )
        }
        onConfirm={() =>
          void confirmUnpublish()
        }
      />
    </div>
  );
}
