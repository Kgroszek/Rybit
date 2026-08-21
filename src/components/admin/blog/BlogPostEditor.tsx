"use client";

import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  BlogBlockEditor,
} from "@/components/admin/blog/BlogBlockEditor";
import {
  BlogEditorDialog,
} from "@/components/admin/blog/BlogEditorDialog";
import {
  BlogEditorSidebar,
} from "@/components/admin/blog/BlogEditorSidebar";
import {
  BlogEditorToolbar,
} from "@/components/admin/blog/BlogEditorToolbar";
import type {
  BlogEditorInitialPost,
} from "@/components/admin/blog/BlogEditorTypes";
import {
  BlogPreviewDialog,
} from "@/components/admin/blog/BlogPreviewDialog";
import {
  useBlogPostEditor,
} from "@/components/admin/blog/useBlogPostEditor";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function BlogPostEditor({
  initialPost,
}: {
  initialPost: BlogEditorInitialPost;
}) {
  const router = useRouter();

  const controller =
    useBlogPostEditor({
      initialPost,
    });

  const [
    leaveDialogOpen,
    setLeaveDialogOpen,
  ] = useState(false);

  const [
    unpublishDialogOpen,
    setUnpublishDialogOpen,
  ] = useState(false);

  function requestBack() {
    if (controller.isDirty) {
      setLeaveDialogOpen(
        true
      );
      return;
    }

    router.push(
      "/admin/blog"
    );
  }

  async function confirmUnpublish() {
    const saved =
      await controller.save(
        "unpublish"
      );

    if (saved) {
      setUnpublishDialogOpen(
        false
      );
    }
  }

  return (
    <div className="min-h-[calc(100dvh-80px)] bg-background">
      <BlogEditorToolbar
        title={
          controller.snapshot
            .title
        }
        isDirty={
          controller.isDirty
        }
        publicationState={
          controller.publicationState
        }
        publicationMode={
          controller.publicationMode
        }
        savingAction={
          controller.savingAction
        }
        message={
          controller.message
        }
        onBack={requestBack}
        onPreview={() =>
          controller.setPreviewOpen(
            true
          )
        }
        onReset={
          controller.resetToSaved
        }
        onSaveDraft={() =>
          void controller.save(
            "draft"
          )
        }
        onPublish={() =>
          void controller.save(
            "publish"
          )
        }
        onSavePublished={() =>
          void controller.save(
            "published"
          )
        }
        onDismissMessage={() =>
          controller.setMessage(
            null
          )
        }
      />

      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <main className="min-w-0">
          <div className="mx-auto max-w-[920px] rounded-panel border border-border bg-surface shadow-card">
            <div className="border-b border-border px-5 py-7 sm:px-8 sm:py-9">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                Artykuł
              </p>

              <textarea
                value={
                  controller.snapshot
                    .title
                }
                onChange={(event) =>
                  controller.setTitle(
                    event.target
                      .value
                  )
                }
                rows={2}
                maxLength={220}
                placeholder="Tytuł artykułu..."
                className="mt-3 w-full resize-none bg-transparent font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-text outline-none placeholder:text-text-muted/45 sm:text-5xl"
              />

              <textarea
                value={
                  controller.snapshot
                    .excerpt
                }
                onChange={(event) =>
                  controller.patchSnapshot(
                    {
                      excerpt:
                        event.target
                          .value,
                    }
                  )
                }
                rows={3}
                maxLength={320}
                placeholder="Krótki lead — czego czytelnik dowie się z artykułu?"
                className="mt-4 w-full resize-none bg-transparent text-lg leading-8 text-text-secondary outline-none placeholder:text-text-muted/60"
              />

              <div className="mt-2 flex justify-end">
                <span
                  className={cn(
                    "text-[10px] font-bold tabular-nums",
                    controller
                      .snapshot
                      .excerpt
                      .length > 280
                      ? "text-warning-foreground"
                      : "text-text-muted"
                  )}
                >
                  {
                    controller
                      .snapshot
                      .excerpt
                      .length
                  }
                  /320
                </span>
              </div>

              {controller.snapshot
                .coverImageUrl && (
                <img
                  src={
                    controller
                      .snapshot
                      .coverImageUrl
                  }
                  alt=""
                  className="mt-7 max-h-[520px] w-full rounded-panel border border-border object-cover"
                />
              )}
            </div>

            <div className="px-4 py-6 sm:px-6 sm:py-8">
              <div className="mx-auto max-w-[820px]">
                <BlogBlockEditor
                  blocks={
                    controller.snapshot
                      .blocks
                  }
                  selectedBlockId={
                    controller.selectedBlockId
                  }
                  onSelect={
                    controller.selectBlock
                  }
                  onChange={
                    controller.replaceBlock
                  }
                  onAdd={
                    controller.addBlock
                  }
                  onRemove={
                    controller.removeBlock
                  }
                  onMove={
                    controller.moveBlock
                  }
                  onDrag={
                    controller.dragBlock
                  }
                  onUpload={
                    controller.uploadContentImage
                  }
                />
              </div>
            </div>
          </div>
        </main>

        <BlogEditorSidebar
          controller={controller}
          onRequestUnpublish={() =>
            setUnpublishDialogOpen(
              true
            )
          }
        />
      </div>

      <div className="sticky bottom-0 z-30 border-t border-border bg-surface/96 p-3 backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          {controller.publicationState ===
            "draft" ? (
            <>
              <Button
                type="button"
                variant="outline"
                isLoading={
                  controller.savingAction ===
                  "draft"
                }
                loadingLabel="Zapisywanie…"
                onClick={() =>
                  void controller.save(
                    "draft"
                  )
                }
              >
                Zapisz szkic
              </Button>

              <Button
                type="button"
                isLoading={
                  controller.savingAction ===
                  "publish"
                }
                loadingLabel="Zapisywanie…"
                onClick={() =>
                  void controller.save(
                    "publish"
                  )
                }
              >
                {controller.publicationMode ===
                "scheduled"
                  ? "Zaplanuj"
                  : "Opublikuj"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              fullWidth
              className="col-span-2"
              isLoading={
                controller.savingAction ===
                "published"
              }
              loadingLabel="Zapisywanie…"
              disabled={
                !controller.isDirty
              }
              onClick={() =>
                void controller.save(
                  "published"
                )
              }
            >
              Zapisz zmiany
            </Button>
          )}
        </div>
      </div>

      <BlogPreviewDialog
        open={
          controller.previewOpen
        }
        snapshot={
          controller.snapshot
        }
        device={
          controller.previewDevice
        }
        onDeviceChange={
          controller.setPreviewDevice
        }
        onClose={() =>
          controller.setPreviewOpen(
            false
          )
        }
      />

      <BlogEditorDialog
        open={leaveDialogOpen}
        onClose={() =>
          setLeaveDialogOpen(
            false
          )
        }
        title="Opuścić edytor?"
        description="Masz niezapisane zmiany w artykule."
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setLeaveDialogOpen(
                  false
                )
              }
            >
              Zostań
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() =>
                router.push(
                  "/admin/blog"
                )
              }
            >
              Opuść bez
              zapisywania
            </Button>
          </div>
        }
      >
        <div className="p-5 sm:p-6">
          <div className="rounded-card border border-warning-border bg-warning-subtle p-4 text-sm leading-6 text-text-secondary">
            Ostatnio zapisana
            wersja artykułu
            pozostanie bez zmian.
          </div>
        </div>
      </BlogEditorDialog>

      <BlogEditorDialog
        open={
          unpublishDialogOpen
        }
        onClose={() =>
          setUnpublishDialogOpen(
            false
          )
        }
        title="Cofnąć publikację?"
        description="Artykuł przestanie być widoczny publicznie i wróci do szkiców."
        size="sm"
        busy={
          controller.savingAction ===
          "unpublish"
        }
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={
                controller.savingAction ===
                "unpublish"
              }
              onClick={() =>
                setUnpublishDialogOpen(
                  false
                )
              }
            >
              Anuluj
            </Button>

            <Button
              type="button"
              variant="danger"
              isLoading={
                controller.savingAction ===
                "unpublish"
              }
              loadingLabel="Wyłączanie…"
              onClick={() =>
                void confirmUnpublish()
              }
            >
              Cofnij publikację
            </Button>
          </div>
        }
      >
        <div className="p-5 sm:p-6">
          <div className="rounded-card border border-warning-border bg-warning-subtle p-4 text-sm leading-6 text-text-secondary">
            Treść, zdjęcia i SEO
            zostaną zachowane.
            Zmienia się wyłącznie
            stan publikacji.
          </div>
        </div>
      </BlogEditorDialog>
    </div>
  );
}
