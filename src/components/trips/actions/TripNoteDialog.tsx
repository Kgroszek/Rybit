"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getActionErrorMessage, requestTripAction } from "@/components/trips/actions/api";
import { ActionCheckbox, ActionSelect, ActionTextarea } from "@/components/trips/actions/TripActionFields";
import { TripActionDialog } from "@/components/trips/actions/TripActionDialog";
import { TripActionTrigger } from "@/components/trips/actions/TripActionTrigger";
import type { TripActionBaseProps } from "@/components/trips/actions/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

const NOTE_TYPES = [
  { value: "general", label: "Ogólna" },
  { value: "plan", label: "Plan" },
  { value: "water", label: "Warunki / woda" },
  { value: "bait", label: "Przynęty" },
  { value: "result", label: "Wyniki" },
];

export function TripNoteDialog({ tripId, canEdit, label = "Dodaj notatkę", icon, className }: TripActionBaseProps) {
  const router = useRouter();
  const toast = useToast();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [pinned, setPinned] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = content.trim();
    if (value.length < 2 || value.length > 3000) {
      toast.error({ title: "Sprawdź treść notatki.", description: "Notatka musi mieć od 2 do 3000 znaków." });
      return;
    }

    setLoading(true);
    try {
      await requestTripAction(`/api/trips/${tripId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value, type, isPinned: pinned }),
      });
      setContent("");
      setType("general");
      setPinned(false);
      setOpen(false);
      router.refresh();
      toast.success({ title: "Notatka została dodana." });
    } catch (error) {
      toast.error({
        title: "Nie udało się dodać notatki.",
        description: getActionErrorMessage(error, "Spróbuj ponownie."),
      });
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
        title="Dodaj notatkę"
        description="Zapisz ustalenie, obserwację albo informację ważną dla uczestników wyprawy."
        busy={loading}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="h-12 min-h-12 sm:min-w-28">Anuluj</Button>
            <Button type="submit" form={formId} isLoading={loading} loadingLabel="Dodawanie…" className="h-12 min-h-12 sm:min-w-36">Dodaj notatkę</Button>
          </div>
        }
      >
        <form id={formId} onSubmit={submit} className="space-y-6">
          <ActionSelect label="Typ notatki" value={type} onChange={(event) => setType(event.target.value)}>
            {NOTE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </ActionSelect>
          <ActionTextarea
            label="Treść"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={3000}
            placeholder="np. Zanęcić punkt o 5:30, sprawdzić wiatr przed wyjazdem..."
            required
            data-autofocus
          />
          <p className="text-right text-xs font-semibold text-text-muted">{content.length}/3000</p>
          <ActionCheckbox
            checked={pinned}
            onChange={setPinned}
            label="Przypnij notatkę"
            description="Przypięte notatki są widoczne na początku listy."
          />
        </form>
      </TripActionDialog>
    </>
  );
}
