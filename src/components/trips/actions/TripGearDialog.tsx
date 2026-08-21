"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { getActionErrorMessage, isAbortError, requestTripAction } from "@/components/trips/actions/api";
import { ActionCheckbox, ActionInput, ActionSelect, ActionTextarea } from "@/components/trips/actions/TripActionFields";
import { TripActionDialog } from "@/components/trips/actions/TripActionDialog";
import { TripActionTrigger } from "@/components/trips/actions/TripActionTrigger";
import type { AvailableGear, TripActionBaseProps, TripGearItem } from "@/components/trips/actions/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

type GearResponse = { availableGear?: AvailableGear[]; tripItems?: TripGearItem[] };
const CATEGORIES = ["Wędki", "Kołowrotki", "Żyłki i plecionki", "Przynęty", "Haczyki i przypony", "Podbieraki", "Elektronika", "Odzież", "Akcesoria", "Inne"];

export function TripGearDialog({ tripId, canEdit, label = "Edytuj sprzęt", icon, className }: TripActionBaseProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"owned" | "custom">("owned");
  const [availableGear, setAvailableGear] = useState<AvailableGear[]>([]);
  const [tripGear, setTripGear] = useState<TripGearItem[]>([]);
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Inne");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("szt.");
  const [note, setNote] = useState("");
  const [required, setRequired] = useState(true);

  const customItems = useMemo(() => tripGear.filter((item) => !item.gearId), [tripGear]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    requestTripAction<GearResponse>(`/api/trips/${tripId}/gear`, { cache: "no-store", signal: controller.signal })
      .then((data) => {
        const available = data.availableGear ?? [];
        const items = data.tripItems ?? [];
        setAvailableGear(available);
        setTripGear(items);
        setSelectedGearIds(available.filter((gear) => items.some((item) => item.gearId === gear.id)).map((gear) => gear.id));
        setLoaded(true);
      })
      .catch((error) => {
        if (isAbortError(error)) return;
        toast.error({ title: "Nie udało się pobrać sprzętu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, tripId, toast]);

  async function saveOwned() {
    setLoading(true);
    try {
      const data = await requestTripAction<GearResponse>(`/api/trips/${tripId}/gear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-owned", gearIds: selectedGearIds }),
      });
      setTripGear(data.tripItems ?? []);
      router.refresh();
      toast.success({ title: "Sprzęt wyprawy został zapisany." });
    } catch (error) {
      toast.error({ title: "Nie udało się zapisać sprzętu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    } finally { setLoading(false); }
  }

  async function addCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const qty = Number(quantity);
    if (name.trim().length < 2 || name.trim().length > 120) {
      toast.error({ title: "Sprawdź nazwę sprzętu.", description: "Nazwa musi mieć od 2 do 120 znaków." }); return;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
      toast.error({ title: "Sprawdź ilość.", description: "Ilość musi być liczbą od 1 do 999." }); return;
    }
    setLoading(true);
    try {
      const data = await requestTripAction<GearResponse>(`/api/trips/${tripId}/gear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-custom", name: name.trim(), category, quantity: qty, unit: unit.trim() || "szt.", note: note.trim(), isRequired: required }),
      });
      setTripGear(data.tripItems ?? []);
      setName(""); setQuantity("1"); setUnit("szt."); setNote(""); setRequired(true);
      router.refresh();
      toast.success({ title: "Sprzęt został dodany do wyprawy." });
    } catch (error) {
      toast.error({ title: "Nie udało się dodać sprzętu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    } finally { setLoading(false); }
  }

  async function removeCustom(item: TripGearItem) {
    if (item.gearId || !window.confirm(`Usunąć „${item.name}” z tej wyprawy?`)) return;
    setLoading(true);
    try {
      const data = await requestTripAction<GearResponse>(`/api/trips/${tripId}/gear`, {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id }),
      });
      setTripGear(data.tripItems ?? []);
      router.refresh();
      toast.success({ title: "Sprzęt został usunięty." });
    } catch (error) {
      toast.error({ title: "Nie udało się usunąć sprzętu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    } finally { setLoading(false); }
  }

  async function togglePacked(item: TripGearItem) {
    if (!canEdit) return;
    try {
      const data = await requestTripAction<GearResponse>(`/api/trips/${tripId}/gear`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id, isPacked: !item.isPacked }),
      });
      setTripGear(data.tripItems ?? []);
      router.refresh();
    } catch (error) {
      toast.error({ title: "Nie udało się zmienić statusu sprzętu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    }
  }

  return (
    <>
      <TripActionTrigger label={label} icon={icon} className={className} onClick={() => setOpen(true)} />
      <TripActionDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Sprzęt na wyprawę"
        description="Wybierz elementy z własnego ekwipunku albo dodaj sprzęt potrzebny tylko na ten wyjazd."
        size="lg"
        busy={loading}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="h-12 min-h-12 sm:min-w-28">Zamknij</Button>
            {view === "owned" && canEdit && <Button type="button" onClick={() => void saveOwned()} isLoading={loading} loadingLabel="Zapisywanie…" className="h-12 min-h-12 sm:min-w-40">Zapisz wybór</Button>}
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid max-w-lg grid-cols-2 gap-1.5 rounded-control bg-surface-muted p-1.5" role="tablist" aria-label="Źródło sprzętu">
            <GearTab active={view === "owned"} onClick={() => setView("owned")}>Z mojego ekwipunku</GearTab>
            <GearTab active={view === "custom"} onClick={() => setView("custom")}>Tylko ta wyprawa</GearTab>
          </div>

          {loading && !loaded ? <LoadingState /> : view === "owned" ? (
            <OwnedGear availableGear={availableGear} selectedGearIds={selectedGearIds} setSelectedGearIds={setSelectedGearIds} canEdit={canEdit} />
          ) : (
            <div className="space-y-7">
              <CustomItems items={customItems} canEdit={canEdit} onDelete={removeCustom} onTogglePacked={togglePacked} />
              {canEdit && (
                <form onSubmit={addCustom} className="rounded-card border border-border bg-surface-muted p-5">
                  <p className="font-display text-lg font-extrabold text-text">Dodaj własny sprzęt</p>
                  <p className="mt-1.5 text-xs leading-5 text-text-muted">Pozycja będzie widoczna tylko w tej wyprawie i nie trafi do stałego ekwipunku.</p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2"><ActionInput label="Nazwa" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="np. Dodatkowy podbierak" required /></div>
                    <ActionSelect label="Kategoria" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</ActionSelect>
                    <div className="grid grid-cols-2 gap-3">
                      <ActionInput label="Ilość" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="1" max="999" step="1" required />
                      <ActionInput label="Jednostka" value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={20} />
                    </div>
                    <div className="sm:col-span-2"><ActionTextarea label="Notatka" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} className="min-h-20" placeholder="Opcjonalnie..." /></div>
                    <div className="sm:col-span-2"><ActionCheckbox checked={required} onChange={setRequired} label="Sprzęt wymagany" description="Wymagane pozycje wpływają na postęp przygotowania wyprawy." /></div>
                  </div>
                  <div className="mt-5 flex justify-end"><Button type="submit" isLoading={loading} loadingLabel="Dodawanie…">Dodaj do wyprawy</Button></div>
                </form>
              )}
            </div>
          )}
        </div>
      </TripActionDialog>
    </>
  );
}

function GearTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={cn("h-11 whitespace-nowrap rounded-xl px-4 text-sm font-bold transition", active ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]" : "text-text-secondary hover:text-text")}>{children}</button>;
}

function OwnedGear({ availableGear, selectedGearIds, setSelectedGearIds, canEdit }: {
  availableGear: AvailableGear[]; selectedGearIds: string[]; setSelectedGearIds: (ids: string[]) => void; canEdit: boolean;
}) {
  if (!availableGear.length) return <EmptyState title="Twój ekwipunek jest pusty" description="Dodaj sprzęt w sekcji Mój ekwipunek, aby wybierać go przy planowaniu wypraw." />;
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm font-bold text-text">Twój ekwipunek</p><p className="mt-1 text-xs leading-5 text-text-muted">Zaznacz pozycje, które chcesz zabrać na tę wyprawę.</p></div>
        <Badge variant="neutral">{selectedGearIds.length} wybranych</Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {availableGear.map((gear) => {
          const checked = selectedGearIds.includes(gear.id);
          return (
            <button key={gear.id} type="button" role="checkbox" aria-checked={checked} disabled={!canEdit}
              onClick={() => setSelectedGearIds(checked ? selectedGearIds.filter((id) => id !== gear.id) : [...selectedGearIds, gear.id])}
              className={cn("flex min-h-[94px] items-start rounded-control border p-4 text-left transition", checked ? "border-primary-300 bg-primary-50" : "border-border bg-surface hover:border-primary-200 hover:bg-surface-muted", !canEdit && "opacity-70")}
            >
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] font-black", checked ? "border-primary bg-primary text-white" : "border-border-strong bg-surface text-transparent")} aria-hidden="true">✓</span>
              <span className="ml-3.5 min-w-0">
                <span className="block truncate text-sm font-bold text-text">{gear.name}</span>
                <span className="mt-1 block text-xs text-text-muted">{[gear.brand, gear.model].filter(Boolean).join(" ") || gear.category}</span>
                <span className="mt-1 block text-[11px] font-semibold text-text-muted">Dostępne: {Math.max(gear.quantity, 1)} szt.</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomItems({ items, canEdit, onDelete, onTogglePacked }: { items: TripGearItem[]; canEdit: boolean; onDelete: (item: TripGearItem) => void; onTogglePacked: (item: TripGearItem) => void }) {
  if (!items.length) return <EmptyState title="Brak dodatkowego sprzętu" description="Dodaj pozycję tylko dla tej wyprawy, jeśli nie chcesz zapisywać jej w stałym ekwipunku." />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className={cn("rounded-control border p-4", item.isPacked ? "border-success-border bg-success-subtle" : item.isRequired ? "border-warning-border bg-warning-subtle" : "border-border bg-surface-muted")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">{item.isRequired && <Badge variant="warning">Wymagany</Badge>}{item.isPacked && <Badge variant="success">Spakowany</Badge>}</div>
              <p className="mt-2 break-words text-sm font-bold text-text">{item.name}</p>
              <p className="mt-1 text-xs text-text-muted">{item.quantity} {item.unit || "szt."} · {item.category}</p>
              {item.note && <p className="mt-2 text-xs leading-5 text-text-secondary">{item.note}</p>}
            </div>
            {canEdit && <button type="button" onClick={() => onDelete(item)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-danger-subtle hover:text-danger" aria-label={`Usuń ${item.name}`}><TrashIcon className="h-4 w-4" /></button>}
          </div>
          {canEdit && <button type="button" onClick={() => onTogglePacked(item)} className="mt-4 w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary-200 hover:text-primary-700">{item.isPacked ? "Oznacz jako niespakowany" : "Oznacz jako spakowany"}</button>}
        </div>
      ))}
    </div>
  );
}

function LoadingState() { return <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-control bg-surface-muted" />)}</div>; }
function EmptyState({ title, description }: { title: string; description: string }) { return <div className="rounded-card border border-dashed border-border bg-surface-muted px-5 py-10 text-center"><p className="font-display text-lg font-extrabold text-text">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">{description}</p></div>; }
