"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CatchDetailsData, CatchDetailsMode } from "@/components/catches/types";
import { CatchShareDialog } from "@/components/catches/CatchShareDialog";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export function CatchDetailsActions({
  fishingCatch,
  mode,
}: {
  fishingCatch: CatchDetailsData;
  mode: CatchDetailsMode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (mode === "public") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {fishingCatch.lakeSlug ? (
          <ButtonLink href={`/lowiska-w-polsce/${fishingCatch.lakeSlug}`} fullWidth>
            Zobacz łowisko
          </ButtonLink>
        ) : (
          <ButtonLink href="/lowiska-w-polsce" fullWidth>
            Znajdź łowisko
          </ButtonLink>
        )}

        <ButtonLink href={`/wedkarze/${fishingCatch.userId}`} variant="outline" fullWidth>
          Profil wędkarza
        </ButtonLink>
      </div>
    );
  }

  async function handleDelete() {
    setIsDeleting(true);
    const toastId = toast.loading({
      title: "Usuwanie połowu...",
      description: "Usuwamy wpis i powiązane zdjęcie.",
    });

    try {
      const response = await fetch(`/api/catches/${fishingCatch.id}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(data.message || "Nie udało się usunąć połowu.");

      toast.update(toastId, {
        type: "success",
        title: "Połów został usunięty.",
        description: "Wracamy do dziennika połowów.",
        duration: 3500,
      });

      router.push("/polowy");
      router.refresh();
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć połowu.",
        description: error instanceof Error ? error.message : "Spróbuj ponownie.",
        duration: 6000,
      });
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setIsShareOpen(true)}>
          <CardsIcon className="h-4 w-4" />
          Karta połowu
        </Button>

        <ButtonLink href={`/polowy?edit=${fishingCatch.id}`} variant="secondary">
          <PencilIcon className="h-4 w-4" />
          Edytuj
        </ButtonLink>

        {fishingCatch.isPublic && !["hidden", "rejected"].includes(fishingCatch.rankingStatus) && (
          <ButtonLink href={`/polowy/publiczne/${fishingCatch.id}`} variant="outline">
            Widok publiczny
          </ButtonLink>
        )}

        <Button variant="ghost" onClick={() => setIsDeleteOpen(true)} className="text-danger hover:bg-danger-subtle hover:text-danger">
          <TrashIcon className="h-4 w-4" />
          Usuń
        </Button>
      </div>

      {isShareOpen && (
        <CatchShareDialog fishingCatch={fishingCatch} onClose={() => setIsShareOpen(false)} />
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-[2px]" onMouseDown={() => !isDeleting && setIsDeleteOpen(false)}>
          <div className="w-full max-w-md rounded-modal border border-border bg-surface p-5 shadow-2xl sm:p-6" onMouseDown={(event) => event.stopPropagation()}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-danger">Usuwanie połowu</p>
            <h2 className="mt-2 font-display text-xl font-bold text-text">Usunąć {fishingCatch.fishName}?</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">Tej operacji nie można cofnąć. Zdjęcie powiązane z połowem również zostanie usunięte.</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Anuluj</Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={isDeleting} loadingLabel="Usuwanie…">Usuń</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
