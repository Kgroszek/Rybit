"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/ToastProvider";

export function TripNoteActions({
  tripId,
  note,
}: {
  tripId: string;
  note: {
    id: string;
    content: string;
    type: string;
    isPinned: boolean;
  };
}) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [type, setType] = useState(note.type);
  const [loading, setLoading] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id, ...payload }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        toast.error({
          title: "Nie udało się zmienić notatki.",
          description: data.message || "Spróbuj ponownie.",
        });
        return false;
      }

      router.refresh();
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!content.trim()) return;
    const ok = await patch({ content: content.trim(), type });
    if (ok) {
      setEditing(false);
      toast.success({ title: "Notatka została zaktualizowana." });
    }
  }

  async function togglePin() {
    const ok = await patch({ isPinned: !note.isPinned });
    if (ok) {
      toast.success({ title: note.isPinned ? "Notatka została odpięta." : "Notatka została przypięta." });
    }
  }

  async function remove() {
    if (!window.confirm("Czy na pewno chcesz usunąć tę notatkę?")) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        toast.error({ title: "Nie udało się usunąć notatki.", description: data.message || "Spróbuj ponownie." });
        return;
      }
      toast.success({ title: "Notatka została usunięta." });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <details className="relative">
        <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl bg-white text-lg font-black text-slate-500 shadow-sm transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
          •••
        </summary>
        <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
          <button type="button" onClick={togglePin} disabled={loading} className="w-full rounded-xl px-3 py-2 text-left text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {note.isPinned ? "Odepnij" : "Przypnij"}
          </button>
          <button type="button" onClick={() => setEditing(true)} disabled={loading} className="w-full rounded-xl px-3 py-2 text-left text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Edytuj
          </button>
          <button type="button" onClick={remove} disabled={loading} className="w-full rounded-xl px-3 py-2 text-left text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50">
            Usuń
          </button>
        </div>
      </details>

      {editing && (
        <div className="fixed inset-0 z-[1700] flex items-center justify-center bg-slate-950/65 p-4" onMouseDown={() => setEditing(false)}>
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-slate-950">Edytuj notatkę</h3>
              <button type="button" onClick={() => setEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-black text-slate-600">×</button>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-black text-slate-700">Typ</span>
              <select value={type} onChange={(event) => setType(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none">
                <option value="general">Ogólna</option>
                <option value="plan">Plan</option>
                <option value="water">Warunki / woda</option>
                <option value="bait">Przynęty</option>
                <option value="result">Wyniki</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-black text-slate-700">Treść</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} maxLength={2000} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(false)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700">Anuluj</button>
              <button type="button" onClick={save} disabled={loading || !content.trim()} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
                {loading ? "Zapisywanie..." : "Zapisz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
