"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { getActionErrorMessage, requestTripAction } from "@/components/trips/actions/api";
import { ActionFieldLabel, ActionTextarea } from "@/components/trips/actions/TripActionFields";
import { TripActionDialog } from "@/components/trips/actions/TripActionDialog";
import { TripActionTrigger } from "@/components/trips/actions/TripActionTrigger";
import type { TripActionBaseProps } from "@/components/trips/actions/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function TripMediaDialog({ tripId, canEdit, label = "Dodaj zdjęcia", icon, className }: TripActionBaseProps) {
  const router = useRouter();
  const toast = useToast();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const next = Array.from(selected);
    const wrongType = next.find((file) => !file.type.startsWith("image/"));
    if (wrongType) {
      toast.error({ title: "Niepoprawny plik.", description: `„${wrongType.name}” nie jest zdjęciem.` });
      return;
    }
    const tooLarge = next.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      toast.error({ title: "Zdjęcie jest za duże.", description: `„${tooLarge.name}” przekracza 5 MB.` });
      return;
    }

    const merged = [...files];
    for (const file of next) {
      const duplicate = merged.some((current) => current.name === file.name && current.size === file.size && current.lastModified === file.lastModified);
      if (!duplicate) merged.push(file);
    }
    if (merged.length > MAX_FILES) {
      toast.error({ title: "Za dużo zdjęć jednocześnie.", description: "Możesz dodać maksymalnie 10 zdjęć." });
      return;
    }
    setFiles(merged);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.length) {
      toast.error({ title: "Wybierz zdjęcia.", description: "Dodaj co najmniej jeden plik." });
      return;
    }
    if (caption.trim().length > 300) {
      toast.error({ title: "Opis jest za długi.", description: "Maksymalna długość to 300 znaków." });
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("caption", caption.trim());

    setLoading(true);
    try {
      await requestTripAction(`/api/trips/${tripId}/media`, { method: "POST", body: formData });
      const count = files.length;
      setFiles([]);
      setCaption("");
      setOpen(false);
      router.refresh();
      toast.success({ title: count === 1 ? "Zdjęcie zostało dodane." : `Dodano ${count} zdjęć.` });
    } catch (error) {
      toast.error({ title: "Nie udało się dodać zdjęć.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TripActionTrigger label={label} icon={icon} className={className} disabled={!canEdit} onClick={() => setOpen(true)} />
      <TripActionDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Dodaj zdjęcia"
        description="Dodaj do 10 zdjęć z wyprawy. Każdy plik może mieć maksymalnie 5 MB."
        busy={loading}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="h-12 min-h-12 sm:min-w-28">Anuluj</Button>
            <Button type="submit" form={formId} isLoading={loading} loadingLabel="Wysyłanie…" className="h-12 min-h-12 sm:min-w-36">Dodaj zdjęcia</Button>
          </div>
        }
      >
        <form id={formId} onSubmit={submit} className="space-y-6">
          <div className="grid" style={{ rowGap: "10px" }}>
            <ActionFieldLabel required>Zdjęcia</ActionFieldLabel>
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface-muted px-5 py-7 text-center transition hover:border-primary-300 hover:bg-primary-50">
              <span className="text-sm font-bold text-text">Wybierz zdjęcia</span>
              <span className="mt-1.5 text-xs leading-5 text-text-muted">Format obrazu · do 5 MB · maks. 10 plików</span>
              <input type="file" accept="image/*" multiple className="sr-only" data-autofocus onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
            </label>
          </div>

          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-text">Wybrane zdjęcia</p>
                <span className="text-xs font-bold text-text-muted">{files.length}/{MAX_FILES}</span>
              </div>
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-control border border-border">
                {files.map((file, index) => (
                  <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text">{file.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{formatFileSize(file.size)}</p>
                    </div>
                    <button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-danger-subtle hover:text-danger" aria-label={`Usuń ${file.name}`}>
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ActionTextarea label="Wspólny opis" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={300} rows={3} placeholder="Opcjonalny opis dla dodawanych zdjęć..." className="min-h-24" />
          <p className="text-right text-xs font-semibold text-text-muted">{caption.length}/300</p>
        </form>
      </TripActionDialog>
    </>
  );
}

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
