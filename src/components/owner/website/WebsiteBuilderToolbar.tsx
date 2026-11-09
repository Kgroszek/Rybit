"use client";

import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import type {
  WebsiteBuilderDevice,
  WebsiteBuilderMessage,
  WebsiteSaveAction,
} from "@/components/owner/website/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function WebsiteBuilderToolbar({
  lakeName,
  status,
  device,
  savingAction,
  isDirty,
  subdomainInvalid,
  publicUrl,
  message,
  onDeviceChange,
  onBack,
  onReset,
  onSaveDraft,
  onPublish,
  onSavePublished,
  onDismissMessage,
}: {
  lakeName: string;
  status: "draft" | "published";
  device: WebsiteBuilderDevice;
  savingAction:
    | WebsiteSaveAction
    | null;
  isDirty: boolean;
  subdomainInvalid: boolean;
  publicUrl: string;
  message: WebsiteBuilderMessage | null;
  onDeviceChange: (
    device: WebsiteBuilderDevice
  ) => void;
  onBack: () => void;
  onReset: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onSavePublished: () => void;
  onDismissMessage: () => void;
}) {
  const published =
    status === "published";

  const saving =
    savingAction !== null;

  return (
    <>
      <header className="relative z-40 flex h-[68px] shrink-0 items-center border-b border-border bg-surface px-3 shadow-[0_1px_8px_rgba(13,30,51,0.04)] sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:w-[380px] lg:flex-none">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            aria-label="Wróć do panelu łowiska"
          >
            <ArrowSmallRightIcon className="h-4 w-4 rotate-180" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-extrabold text-text">
                {lakeName}
              </p>

              <Badge
                variant={
                  published
                    ? "success"
                    : "warning"
                }
              >
                {published
                  ? "Online"
                  : "Szkic"}
              </Badge>
            </div>

            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-text-muted">
              Edytor strony WWW
              {isDirty && (
                <>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-warning"
                    aria-hidden="true"
                  />
                  Niezapisane zmiany
                </>
              )}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="grid grid-cols-2 gap-1 rounded-control bg-surface-muted p-1">
            <DeviceButton
              active={
                device === "desktop"
              }
              label="Desktop"
              onClick={() =>
                onDeviceChange(
                  "desktop"
                )
              }
            />

            <DeviceButton
              active={
                device === "mobile"
              }
              label="Mobile"
              onClick={() =>
                onDeviceChange(
                  "mobile"
                )
              }
            />
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-2 sm:flex lg:w-[430px] lg:flex-none">
          {published && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-border-strong bg-surface px-3.5 text-xs font-bold text-text transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
            >
              Otwórz stronę ↗
            </a>
          )}

          {isDirty && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={onReset}
            >
              Cofnij zmiany
            </Button>
          )}

          {published ? (
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
                !isDirty ||
                subdomainInvalid
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
                size="sm"
                variant="outline"
                isLoading={
                  savingAction ===
                  "draft"
                }
                loadingLabel="Zapisywanie…"
                disabled={
                  saving ||
                  !isDirty ||
                  subdomainInvalid
                }
                onClick={onSaveDraft}
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
                loadingLabel="Publikowanie…"
                disabled={
                  saving ||
                  subdomainInvalid
                }
                onClick={onPublish}
              >
                Opublikuj
              </Button>
            </>
          )}
        </div>
      </header>

      {message && (
        <div
          className={cn(
            "relative z-30 flex min-h-10 shrink-0 items-center justify-between gap-4 border-b px-4 py-2.5 text-xs font-semibold",
            message.tone ===
              "success"
              ? "border-success-border bg-success-subtle text-success-foreground"
              : message.tone ===
                  "error"
                ? "border-danger-border bg-danger-subtle text-danger-foreground"
                : "border-primary-200 bg-primary-50 text-primary-800"
          )}
          role={
            message.tone ===
            "error"
              ? "alert"
              : "status"
          }
        >
          <span>{message.text}</span>

          <button
            type="button"
            onClick={onDismissMessage}
            className="shrink-0 font-black opacity-60 hover:opacity-100"
            aria-label="Zamknij komunikat"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

function DeviceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-xl px-4 text-xs font-bold transition",
        active
          ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]"
          : "text-text-muted hover:text-text"
      )}
    >
      {label}
    </button>
  );
}
