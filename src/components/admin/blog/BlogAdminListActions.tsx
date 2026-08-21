"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  BlogEditorDialog,
} from "@/components/admin/blog/BlogEditorDialog";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { Button } from "@/components/ui/Button";

export function BlogAdminListActions({
  id,
  slug,
  publicVisible,
}: {
  id: string;
  slug: string;
  publicVisible: boolean;
}) {
  const router = useRouter();

  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [open, setOpen] =
    useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutside(
      event: MouseEvent
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      closeOnOutside
    );

    document.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeOnOutside
      );

      document.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/blog/posts/${encodeURIComponent(
            id
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | {
              message?: string;
            }
          | null;

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Nie udało się usunąć artykułu."
        );
      }

      setDeleteOpen(false);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Nie udało się usunąć artykułu."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        ref={rootRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) =>
                !current
            )
          }
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
          aria-label="Akcje artykułu"
        >
          <MoreIcon className="h-4 w-4" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-control border border-border bg-surface p-1.5 shadow-float"
          >
            {publicVisible && (
              <Link
                href={`/blog/${slug}`}
                target="_blank"
                role="menuitem"
                onClick={() =>
                  setOpen(false)
                }
                className="flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-bold text-text-secondary transition hover:bg-primary-50 hover:text-primary-700"
              >
                Otwórz artykuł ↗
              </Link>
            )}

            <Link
              href={`/admin/blog/${id}/edytuj`}
              role="menuitem"
              onClick={() =>
                setOpen(false)
              }
              className="flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-text-secondary transition hover:bg-surface-muted hover:text-text"
            >
              <PencilIcon className="h-4 w-4" />
              Edytuj
            </Link>

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setDeleteOpen(true);
              }}
              className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-danger-foreground transition hover:bg-danger-subtle"
            >
              <TrashIcon className="h-4 w-4" />
              Usuń
            </button>
          </div>
        )}
      </div>

      <BlogEditorDialog
        open={deleteOpen}
        onClose={() =>
          setDeleteOpen(false)
        }
        title="Usunąć artykuł?"
        description="Tej operacji nie można cofnąć."
        size="sm"
        busy={deleting}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() =>
                setDeleteOpen(
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
                deleting
              }
              loadingLabel="Usuwanie…"
              onClick={() =>
                void handleDelete()
              }
            >
              Usuń artykuł
            </Button>
          </div>
        }
      >
        <div className="p-5 sm:p-6">
          <div className="rounded-card border border-danger-border bg-danger-subtle p-4">
            <p className="text-sm font-extrabold text-danger-foreground">
              Artykuł zniknie z
              panelu i z publicznej
              strony.
            </p>

            {error && (
              <p className="mt-3 text-sm leading-6 text-danger-foreground">
                {error}
              </p>
            )}
          </div>
        </div>
      </BlogEditorDialog>
    </>
  );
}
