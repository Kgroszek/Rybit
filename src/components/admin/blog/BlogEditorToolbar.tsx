"use client";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import type {
  BlogEditorMessage,
  BlogEditorSaveAction,
} from "@/components/admin/blog/BlogEditorTypes";
import { Button } from "@/components/ui/Button";
import {
  type BlogPublicationState,
} from "@/lib/blog";
import { cn } from "@/lib/cn";

export function BlogEditorToolbar({
  title,
  isDirty,
  publicationState,
  publicationMode,
  savingAction,
  message,
  onBack,
  onPreview,
  onReset,
  onSaveDraft,
  onPublish,
  onSavePublished,
  onDismissMessage,
}: {
  title: string;
  isDirty: boolean;
  publicationState:
    BlogPublicationState;
  publicationMode:
    | "now"
    | "scheduled";
  savingAction:
    | BlogEditorSaveAction
    | null;
  message: BlogEditorMessage | null;
  onBack: () => void;
  onPreview: () => void;
  onReset: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSavePublished: () => void;
  onDismissMessage: () => void;
}) {
  const saving =
    savingAction !== null;

  const isLive =
    publicationState ===
    "published";

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-[68px] items-center border-b border-border bg-surface/96 px-3 py-3 backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            aria-label="Wróć do listy artykułów"
          >
            <ArrowSmallRightIcon className="h-4 w-4 rotate-180" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-text">
              {title.trim() ||
                "Nowy artykuł"}
            </p>

            <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold text-text-muted">
              <StatusDot
                state={
                  publicationState
                }
              />

              <span>
                {publicationState ===
                "published"
                  ? "Opublikowany"
                  : publicationState ===
                      "scheduled"
                    ? "Zaplanowany"
                    : "Szkic"}
              </span>

              {isDirty && (
                <>
                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-border-strong"
                  />

                  <span className="text-warning-foreground">
                    Niezapisane
                    zmiany
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreview}
          >
            Podgląd
          </Button>

          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={onReset}
            >
              Cofnij zmiany
            </Button>
          )}

          {isLive ||
          publicationState ===
            "scheduled" ? (
            <Button
              type="button"
              size="sm"
              isLoading={
                savingAction ===
                "published"
              }
              loadingLabel="Zapisywanie…"
              disabled={
                saving ||
                !isDirty
              }
              onClick={
                onSavePublished
              }
            >
              Zapisz zmiany
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={
                  savingAction ===
                  "draft"
                }
                loadingLabel="Zapisywanie…"
                disabled={
                  saving ||
                  !isDirty
                }
                onClick={
                  onSaveDraft
                }
              >
                Zapisz szkic
              </Button>

              <Button
                type="button"
                size="sm"
                isLoading={
                  savingAction ===
                  "publish"
                }
                loadingLabel="Zapisywanie…"
                disabled={saving}
                onClick={onPublish}
              >
                {publicationMode ===
                "scheduled"
                  ? "Zaplanuj"
                  : "Opublikuj"}
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="ml-2 inline-flex h-10 items-center rounded-control border border-border px-3 text-xs font-extrabold text-text-secondary sm:hidden"
        >
          Podgląd
        </button>
      </header>

      {message && (
        <div
          role={
            message.tone ===
            "error"
              ? "alert"
              : "status"
          }
          className={cn(
            "sticky top-[68px] z-30 flex items-center justify-between gap-4 border-b px-4 py-2.5 text-xs font-bold",
            message.tone ===
              "success"
              ? "border-success-border bg-success-subtle text-success-foreground"
              : message.tone ===
                  "error"
                ? "border-danger-border bg-danger-subtle text-danger-foreground"
                : "border-primary-200 bg-primary-50 text-primary-800"
          )}
        >
          <span>
            {message.text}
          </span>

          <button
            type="button"
            onClick={
              onDismissMessage
            }
            className="shrink-0 text-base font-black opacity-60 hover:opacity-100"
            aria-label="Zamknij komunikat"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

function StatusDot({
  state,
}: {
  state:
    BlogPublicationState;
}) {
  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        state ===
          "published"
          ? "bg-success"
          : state ===
              "scheduled"
            ? "bg-primary"
            : "bg-warning"
      )}
      aria-hidden="true"
    />
  );
}
