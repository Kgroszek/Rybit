"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getActionErrorMessage, requestTripAction } from "@/components/trips/actions/api";
import { ActionInput, ActionSelect, ActionTextarea } from "@/components/trips/actions/TripActionFields";
import { TripActionDialog } from "@/components/trips/actions/TripActionDialog";
import { TripActionTrigger } from "@/components/trips/actions/TripActionTrigger";
import type { TripActionBaseProps, TripParticipant } from "@/components/trips/actions/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

const COST_CATEGORIES = [
  { value: "fuel", label: "Paliwo" },
  { value: "fishing", label: "Opłaty za łowisko" },
  { value: "food", label: "Jedzenie" },
  { value: "accommodation", label: "Nocleg" },
  { value: "bait", label: "Przynęty i zanęty" },
  { value: "equipment", label: "Sprzęt" },
  { value: "other", label: "Pozostałe" },
];

export function TripCostDialog({ tripId, canEdit, participants = [], label = "Dodaj koszt", icon, className }: TripActionBaseProps & { participants?: TripParticipant[] }) {
  const router = useRouter();
  const toast = useToast();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [costLabel, setCostLabel] = useState("");
  const [category, setCategory] = useState("fuel");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paidByUserId, setPaidByUserId] = useState("");

  useEffect(() => {
    if (!paidByUserId && participants.length > 0) setPaidByUserId(participants[0].id);
  }, [paidByUserId, participants]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = costLabel.trim();
    const numericAmount = Number(amount.replace(",", "."));

    if (name.length < 2 || name.length > 120) {
      toast.error({ title: "Sprawdź nazwę kosztu.", description: "Nazwa musi mieć od 2 do 120 znaków." });
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > 1_000_000) {
      toast.error({ title: "Sprawdź kwotę.", description: "Kwota musi być większa od 0." });
      return;
    }
    if (note.trim().length > 500) {
      toast.error({ title: "Notatka jest za długa.", description: "Maksymalna długość to 500 znaków." });
      return;
    }

    setLoading(true);
    try {
      await requestTripAction(`/api/trips/${tripId}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: name,
          category,
          amount: numericAmount,
          note: note.trim(),
          paidByUserId: paidByUserId || undefined,
        }),
      });
      setCostLabel("");
      setCategory("fuel");
      setAmount("");
      setNote("");
      setOpen(false);
      router.refresh();
      toast.success({ title: "Koszt został dodany." });
    } catch (error) {
      toast.error({ title: "Nie udało się dodać kosztu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
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
        title="Dodaj koszt"
        description="Zapisz wydatek i przypisz osobę, która za niego zapłaciła."
        busy={loading}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="h-12 min-h-12 sm:min-w-28">Anuluj</Button>
            <Button type="submit" form={formId} isLoading={loading} loadingLabel="Dodawanie…" className="h-12 min-h-12 sm:min-w-36">Dodaj koszt</Button>
          </div>
        }
      >
        <form id={formId} onSubmit={submit} className="space-y-6">
          <ActionInput label="Nazwa kosztu" value={costLabel} onChange={(event) => setCostLabel(event.target.value)} maxLength={120} placeholder="np. Paliwo" required data-autofocus />
          <div className="grid gap-6 sm:grid-cols-2">
            <ActionSelect label="Kategoria" value={category} onChange={(event) => setCategory(event.target.value)}>
              {COST_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </ActionSelect>
            <ActionInput label="Kwota (PLN)" value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0.01" max="1000000" step="0.01" inputMode="decimal" required />
          </div>
          {participants.length > 0 && (
            <ActionSelect label="Kto zapłacił?" value={paidByUserId || participants[0]?.id || ""} onChange={(event) => setPaidByUserId(event.target.value)}>
              {participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}
            </ActionSelect>
          )}
          <ActionTextarea label="Notatka" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Opcjonalne szczegóły kosztu..." />
          <div className="rounded-control border border-primary-200 bg-primary-50 px-4 py-4">
            <p className="text-sm font-bold text-primary-800">Automatyczne rozliczenie</p>
            <p className="mt-1.5 text-xs leading-5 text-text-secondary">Rybio podzieli łączny budżet pomiędzy zarejestrowanych uczestników i pokaże proponowane zwroty.</p>
          </div>
        </form>
      </TripActionDialog>
    </>
  );
}
