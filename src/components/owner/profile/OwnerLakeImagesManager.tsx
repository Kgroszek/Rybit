"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import { AddCircleIcon } from "@/components/icons/AddCircleIcon";
import { ArrowSmallRightIcon } from "@/components/icons/ArrowSmallRightIcon";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { OwnerDialog } from "@/components/owner/shared/OwnerDialog";
import type {
  OwnerLakeImageDto,
} from "@/components/owner/profile/types";
import {
  formatFileSize,
  formatImageDate,
} from "@/components/owner/profile/profile-utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  deleteLakeImage,
  makeLakeImagePrimary,
  reorderLakeImage,
  uploadLakeImage,
} from "@/lib/owner/image-actions";
import { cn } from "@/lib/cn";

const MAX_IMAGE_SIZE_IN_BYTES =
  8 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function OwnerLakeImagesManager({
  lakeId,
  lakeSlug,
  lakeName,
  images,
}: {
  lakeId: string;
  lakeSlug: string;
  lakeName: string;
  images: OwnerLakeImageDto[];
}) {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);
  const [fileError, setFileError] =
    useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<OwnerLakeImageDto | null>(
      null
    );
  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url =
      URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  function handleFile(
    file: File | null,
    input: HTMLInputElement
  ) {
    setFileError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      setFileError(
        "Dodaj plik JPG, PNG, WEBP albo AVIF."
      );
      setSelectedFile(null);
      input.value = "";
      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE_IN_BYTES
    ) {
      setFileError(
        "Plik jest za duży. Maksymalny rozmiar zdjęcia to 8 MB."
      );
      setSelectedFile(null);
      input.value = "";
      return;
    }

    setSelectedFile(file);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <Card className="min-w-0 overflow-visible">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-[-0.025em] text-text">
              Galeria
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-text-secondary">
              Pierwsze zdjęcie jest zdjęciem głównym profilu.
            </p>
          </div>

          <Badge
            variant={
              images.length > 0
                ? "primary"
                : "neutral"
            }
            size="md"
          >
            {images.length}{" "}
            {images.length === 1
              ? "zdjęcie"
              : "zdjęć"}
          </Badge>
        </div>

        {images.length > 0 ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 2xl:grid-cols-3">
            {images.map(
              (image, index) => (
                <LakeImageCard
                  key={image.id}
                  lakeId={lakeId}
                  lakeSlug={lakeSlug}
                  image={image}
                  index={index}
                  total={images.length}
                  open={
                    openMenuId === image.id
                  }
                  onOpenChange={(open) =>
                    setOpenMenuId(
                      open ? image.id : null
                    )
                  }
                  onDelete={() => {
                    setOpenMenuId(null);
                    setDeleteTarget(image);
                  }}
                />
              )
            )}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="Brak zdjęć w galerii"
              description="Dodaj pierwsze aktualne zdjęcie łowiska. Będzie ono automatycznie zdjęciem głównym profilu."
              className="min-h-64"
            />
          </div>
        )}
      </Card>

      <div className="space-y-5 xl:sticky xl:top-6">
        <Card>
          <div className="px-5 py-5 sm:px-6">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-primary">
              Dodaj zdjęcie
            </p>

            <h2 className="mt-2 font-display text-xl font-extrabold tracking-[-0.025em] text-text">
              {lakeName}
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              JPG, PNG, WEBP lub AVIF. Maksymalny rozmiar pliku: 8 MB.
            </p>

            <form
              action={uploadLakeImage}
              encType="multipart/form-data"
              className="mt-5"
            >
              <input
                type="hidden"
                name="lakeId"
                value={lakeId}
              />
              <input
                type="hidden"
                name="slug"
                value={lakeSlug}
              />

              <label className="group block cursor-pointer">
                <div className="overflow-hidden rounded-card border border-dashed border-border-strong bg-surface-muted transition group-hover:border-primary-300 group-hover:bg-primary-50">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Podgląd wybranego zdjęcia"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center px-5 text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-control bg-surface text-primary shadow-sm">
                        <AddCircleIcon className="h-5 w-5" />
                      </span>

                      <p className="mt-3 text-sm font-bold text-text">
                        Wybierz zdjęcie
                      </p>

                      <p className="mt-1 text-xs leading-5 text-text-muted">
                        Kliknij, aby wybrać plik z komputera lub telefonu.
                      </p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  name="image"
                  required
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(event) =>
                    handleFile(
                      event.currentTarget
                        .files?.[0] ?? null,
                      event.currentTarget
                    )
                  }
                />
              </label>

              {selectedFile && (
                <div className="mt-3 rounded-control bg-surface-muted px-3.5 py-3">
                  <p className="truncate text-xs font-bold text-text">
                    {selectedFile.name}
                  </p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {formatFileSize(
                      selectedFile.size
                    )}
                  </p>
                </div>
              )}

              {fileError && (
                <p
                  role="alert"
                  className="mt-3 text-xs font-bold leading-5 text-danger-foreground"
                >
                  {fileError}
                </p>
              )}

              <UploadSubmitButton
                disabled={
                  !selectedFile ||
                  Boolean(fileError)
                }
              />
            </form>
          </div>
        </Card>

        <Card
          variant="subtle"
          className="px-5 py-5 sm:px-6"
        >
          <p className="text-sm font-bold text-text">
            Dobre zdjęcie główne
          </p>

          <ul className="mt-3 space-y-2 text-xs leading-5 text-text-secondary">
            <li>
              • poziomy kadr z czytelnym widokiem na wodę,
            </li>
            <li>
              • naturalne światło i aktualny wygląd łowiska,
            </li>
            <li>
              • bez dużych napisów i grafik reklamowych.
            </li>
          </ul>
        </Card>
      </div>

      {deleteTarget && (
        <DeleteImageDialog
          lakeId={lakeId}
          lakeSlug={lakeSlug}
          image={deleteTarget}
          onClose={() =>
            setDeleteTarget(null)
          }
        />
      )}
    </div>
  );
}

function LakeImageCard({
  lakeId,
  lakeSlug,
  image,
  index,
  total,
  open,
  onOpenChange,
  onDelete,
}: {
  lakeId: string;
  lakeSlug: string;
  image: OwnerLakeImageDto;
  index: number;
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <article className="relative rounded-card border border-border bg-surface shadow-card">
      <div className="relative overflow-hidden rounded-t-card bg-surface-muted">
        <img
          src={image.url}
          alt={`Zdjęcie łowiska ${index + 1}`}
          className="aspect-[4/3] w-full object-cover"
        />

        <div className="absolute left-3 top-3">
          {isFirst ? (
            <Badge variant="primary">
              Zdjęcie główne
            </Badge>
          ) : (
            <Badge variant="neutral">
              #{index + 1}
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.09em] text-text-muted">
              Dodano
            </p>
            <p className="mt-1 text-xs font-bold text-text-secondary">
              {formatImageDate(
                image.createdAt
              )}
            </p>
          </div>

          <ImageActionsMenu
            lakeId={lakeId}
            lakeSlug={lakeSlug}
            image={image}
            isFirst={isFirst}
            open={open}
            onOpenChange={onOpenChange}
            onDelete={onDelete}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <form action={reorderLakeImage}>
            <ImageActionHiddenFields
              lakeId={lakeId}
              lakeSlug={lakeSlug}
              imageId={image.id}
            />

            <ReorderButton
              direction="up"
              disabled={isFirst}
              label="Wyżej"
            />
          </form>

          <form action={reorderLakeImage}>
            <ImageActionHiddenFields
              lakeId={lakeId}
              lakeSlug={lakeSlug}
              imageId={image.id}
            />

            <ReorderButton
              direction="down"
              disabled={isLast}
              label="Niżej"
            />
          </form>
        </div>
      </div>
    </article>
  );
}

function ImageActionsMenu({
  lakeId,
  lakeSlug,
  image,
  isFirst,
  open,
  onOpenChange,
  onDelete,
}: {
  lakeId: string;
  lakeSlug: string;
  image: OwnerLakeImageDto;
  isFirst: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  const rootRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node
        )
      ) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );
    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onOpenChange]);

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          onOpenChange(!open)
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
        aria-label="Akcje zdjęcia"
      >
        <MoreIcon
          size={18}
          className="h-[18px] w-[18px]"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-control border border-border bg-surface p-1.5 shadow-float"
        >
          <a
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() =>
              onOpenChange(false)
            }
            className="flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-bold text-text-secondary transition hover:bg-surface-muted hover:text-text"
          >
            Otwórz zdjęcie
          </a>

          {!isFirst && (
            <form
              action={
                makeLakeImagePrimary
              }
            >
              <ImageActionHiddenFields
                lakeId={lakeId}
                lakeSlug={lakeSlug}
                imageId={image.id}
              />

              <PrimaryImageMenuButton />
            </form>
          )}

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={onDelete}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-danger-foreground transition hover:bg-danger-subtle"
          >
            <TrashIcon className="h-4 w-4" />
            Usuń zdjęcie
          </button>
        </div>
      )}
    </div>
  );
}

function ImageActionHiddenFields({
  lakeId,
  lakeSlug,
  imageId,
}: {
  lakeId: string;
  lakeSlug: string;
  imageId: string;
}) {
  return (
    <>
      <input
        type="hidden"
        name="lakeId"
        value={lakeId}
      />
      <input
        type="hidden"
        name="slug"
        value={lakeSlug}
      />
      <input
        type="hidden"
        name="imageId"
        value={imageId}
      />
    </>
  );
}

function ReorderButton({
  direction,
  disabled,
  label,
}: {
  direction: "up" | "down";
  disabled: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="direction"
      value={direction}
      disabled={disabled || pending}
      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-xs font-bold text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ArrowSmallRightIcon
        className={cn(
          "h-4 w-4",
          direction === "up"
            ? "-rotate-90"
            : "rotate-90"
        )}
      />
      {pending ? "Zapisywanie…" : label}
    </button>
  );
}

function PrimaryImageMenuButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className="flex min-h-10 w-full items-center rounded-xl px-3 py-2 text-left text-sm font-bold text-text-secondary transition hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
    >
      {pending
        ? "Ustawianie…"
        : "Ustaw jako główne"}
    </button>
  );
}

function UploadSubmitButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      fullWidth
      disabled={disabled}
      isLoading={pending}
      loadingLabel="Przesyłanie…"
      className="mt-4 h-12 min-h-12"
    >
      Prześlij zdjęcie
    </Button>
  );
}

function DeleteImageDialog({
  lakeId,
  lakeSlug,
  image,
  onClose,
}: {
  lakeId: string;
  lakeSlug: string;
  image: OwnerLakeImageDto;
  onClose: () => void;
}) {
  return (
    <OwnerDialog
      onClose={onClose}
      eyebrow="Usunięcie zdjęcia"
      title="Usunąć zdjęcie z galerii?"
      description="Zdjęcie zostanie usunięte z profilu oraz z magazynu plików."
      size="sm"
      footer={
        <form
          action={deleteLakeImage}
          className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
        >
          <ImageActionHiddenFields
            lakeId={lakeId}
            lakeSlug={lakeSlug}
            imageId={image.id}
          />

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 min-h-12 sm:min-w-28"
          >
            Wróć
          </Button>

          <DeleteSubmitButton />
        </form>
      }
    >
      <div className="overflow-hidden rounded-card border border-danger-border bg-danger-subtle">
        <img
          src={image.url}
          alt="Zdjęcie przeznaczone do usunięcia"
          className="aspect-[16/9] w-full object-cover"
        />

        <div className="px-4 py-4">
          <p className="text-sm font-bold text-danger-foreground">
            Tej operacji nie można cofnąć
          </p>
          <p className="mt-1.5 text-xs leading-5 text-text-secondary">
            Po usunięciu kolejność pozostałych zdjęć zostanie automatycznie uporządkowana.
          </p>
        </div>
      </div>
    </OwnerDialog>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="danger"
      isLoading={pending}
      loadingLabel="Usuwanie…"
      className="h-12 min-h-12 sm:min-w-40"
    >
      Usuń zdjęcie
    </Button>
  );
}
