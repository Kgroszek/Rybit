"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/ui/ToastProvider";

type PackedToggleProps = {
  tripId: string;
  itemId: string;
  isPacked: boolean;
  canEdit: boolean;
};

async function readResponse(response: Response) {
  try {
    return (await response.json()) as { message?: string };
  } catch {
    return {};
  }
}

export function TripChecklistPackedToggle({
  tripId,
  itemId,
  isPacked,
  canEdit,
}: PackedToggleProps) {
  const router = useRouter();
  const toast = useToast();
  const [checked, setChecked] = useState(isPacked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!canEdit || loading) return;

    const nextValue = !checked;
    setChecked(nextValue);
    setLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isPacked: nextValue }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setChecked(!nextValue);
        toast.error({
          title: "Nie udało się zmienić checklisty.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      router.refresh();
    } catch {
      setChecked(!nextValue);
      toast.error({
        title: "Nie udało się zmienić checklisty.",
        description: "Wystąpił problem z połączeniem.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!canEdit || loading}
      aria-pressed={checked}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${
          checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent"
        }`}
      >
        ✓
      </span>
      {loading ? "Zapisywanie..." : checked ? "Spakowane" : "Do spakowania"}
    </button>
  );
}

export function TripGearPackedToggle({
  tripId,
  itemId,
  isPacked,
  canEdit,
}: PackedToggleProps) {
  const router = useRouter();
  const toast = useToast();
  const [checked, setChecked] = useState(isPacked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!canEdit || loading) return;

    const nextValue = !checked;
    setChecked(nextValue);
    setLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/gear`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isPacked: nextValue }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setChecked(!nextValue);
        toast.error({
          title: "Nie udało się zmienić sprzętu.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      router.refresh();
    } catch {
      setChecked(!nextValue);
      toast.error({
        title: "Nie udało się zmienić sprzętu.",
        description: "Wystąpił problem z połączeniem.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!canEdit || loading}
      aria-pressed={checked}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border text-[11px] ${
          checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent"
        }`}
      >
        ✓
      </span>
      {loading ? "Zapisywanie..." : checked ? "Spakowany" : "Do spakowania"}
    </button>
  );
}

type DeleteResource = "notes" | "costs" | "media";

type TripDeleteButtonProps = {
  tripId: string;
  resource: DeleteResource;
  entityId: string;
  label?: string;
  confirmText?: string;
  className?: string;
};

const bodyKeyByResource: Record<DeleteResource, string> = {
  notes: "noteId",
  costs: "costId",
  media: "mediaId",
};

const titleByResource: Record<DeleteResource, string> = {
  notes: "notatki",
  costs: "kosztu",
  media: "zdjęcia",
};

export function TripDeleteButton({
  tripId,
  resource,
  entityId,
  label = "Usuń",
  confirmText,
  className = "",
}: TripDeleteButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;

    const confirmed = window.confirm(
      confirmText || `Czy na pewno chcesz usunąć ${titleByResource[resource]}?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/${resource}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKeyByResource[resource]]: entityId }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        toast.error({
          title: "Nie udało się usunąć elementu.",
          description: data.message || "Spróbuj ponownie.",
        });
        return;
      }

      toast.success({
        title: "Usunięto.",
        description: data.message || "Element został usunięty.",
      });

      router.refresh();
    } catch {
      toast.error({
        title: "Nie udało się usunąć elementu.",
        description: "Wystąpił problem z połączeniem.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? "Usuwanie..." : label}
    </button>
  );
}
