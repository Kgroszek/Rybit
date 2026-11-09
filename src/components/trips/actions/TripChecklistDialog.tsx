"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { getActionErrorMessage, isAbortError, requestTripAction } from "@/components/trips/actions/api";
import { ActionCheckbox, ActionInput, ActionSelect, ActionTextarea } from "@/components/trips/actions/TripActionFields";
import { TripActionDialog } from "@/components/trips/actions/TripActionDialog";
import { TripActionTrigger } from "@/components/trips/actions/TripActionTrigger";
import type { Checklist, ChecklistItem, TripActionBaseProps, UserChecklistTemplate } from "@/components/trips/actions/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { CHECKLIST_CATEGORIES, getChecklistTemplates, getTripDurationDays, type ChecklistTemplate } from "@/lib/trips/checklist-templates";
import { cn } from "@/lib/cn";

type ChecklistResponse = { checklist?: Checklist; addedCount?: number };
type TemplatesResponse = { templates?: UserChecklistTemplate[] };
type TemplateResponse = { template?: UserChecklistTemplate };

export function TripChecklistDialog({ tripId, canEdit, label = "Otwórz checklistę", icon, className, tripStartsAt, tripEndsAt, tripType, lakeGearRequirements = [] }: TripActionBaseProps & {
  tripStartsAt?: string | Date;
  tripEndsAt?: string | Date | null;
  tripType?: string;
  lakeGearRequirements?: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"items" | "templates">("items");
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<Checklist>(null);
  const [userTemplates, setUserTemplates] = useState<UserChecklistTemplate[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Sprzęt");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("szt.");
  const [itemImportant, setItemImportant] = useState(false);
  const [itemNote, setItemNote] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const days = useMemo(() => getTripDurationDays(tripStartsAt, tripEndsAt), [tripStartsAt, tripEndsAt]);
  const generatedTemplates = useMemo(() => getChecklistTemplates(days, tripType, lakeGearRequirements), [days, tripType, lakeGearRequirements]);
  const packedCount = checklist?.items.filter((item) => item.isPacked).length ?? 0;
  const progress = checklist?.items.length ? Math.round((packedCount / checklist.items.length) * 100) : 0;

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    Promise.all([
      requestTripAction<ChecklistResponse>(`/api/trips/${tripId}/checklist`, { cache: "no-store", signal: controller.signal }),
      canEdit ? requestTripAction<TemplatesResponse>("/api/checklist-templates", { cache: "no-store", signal: controller.signal }) : Promise.resolve({ templates: [] }),
    ])
      .then(([checklistData, templateData]) => {
        setChecklist(checklistData.checklist ?? null);
        setUserTemplates(templateData.templates ?? []);
      })
      .catch((error) => {
        if (isAbortError(error)) return;
        toast.error({ title: "Nie udało się pobrać checklisty.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, tripId, canEdit, toast]);

  async function mutate(init: RequestInit, successTitle?: string) {
    setLoading(true);
    try {
      const data = await requestTripAction<ChecklistResponse>(`/api/trips/${tripId}/checklist`, init);
      setChecklist(data.checklist ?? null);
      router.refresh();
      if (successTitle) toast.success({ title: successTitle });
      return data;
    } catch (error) {
      toast.error({ title: "Nie udało się zapisać checklisty.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
      return null;
    } finally { setLoading(false); }
  }

  async function ensureChecklist() {
    await mutate({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "ensure" }) }, "Checklista została utworzona.");
  }

  async function applyTemplate(template: ChecklistTemplate) {
    const data = await mutate({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply-template", templateId: template.id, templateLabel: template.label, items: template.items }),
    });
    if (data) {
      const added = typeof data.addedCount === "number" ? data.addedCount : 0;
      toast.success({ title: added > 0 ? `Dodano ${added} pozycji.` : "Checklista zawiera już te pozycje." });
      setView("items");
    }
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const qty = Number(itemQuantity);
    if (itemName.trim().length < 2 || itemName.trim().length > 120) {
      toast.error({ title: "Sprawdź nazwę elementu.", description: "Nazwa musi mieć od 2 do 120 znaków." }); return;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
      toast.error({ title: "Sprawdź ilość.", description: "Ilość musi być liczbą od 1 do 999." }); return;
    }
    const data = await mutate({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: itemName.trim(), category: itemCategory, quantity: qty, unit: itemUnit.trim(), isImportant: itemImportant, note: itemNote.trim() }),
    });
    if (data) {
      setItemName(""); setItemQuantity("1"); setItemUnit("szt."); setItemImportant(false); setItemNote("");
    }
  }

  async function patchItem(item: ChecklistItem, patch: Record<string, unknown>) {
    await mutate({ method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id, ...patch }) });
  }

  async function deleteItem(item: ChecklistItem) {
    if (!window.confirm(`Usunąć „${item.name}” z checklisty?`)) return;
    await mutate({ method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id }) });
  }

  async function saveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checklist?.items.length) {
      toast.error({ title: "Checklista jest pusta.", description: "Dodaj co najmniej jeden element przed zapisaniem szablonu." }); return;
    }
    const name = templateName.trim();
    if (name.length < 2 || name.length > 80) {
      toast.error({ title: "Sprawdź nazwę szablonu.", description: "Nazwa musi mieć od 2 do 80 znaków." }); return;
    }
    setLoading(true);
    try {
      const data = await requestTripAction<TemplateResponse>("/api/checklist-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: templateDescription.trim(), tripType: tripType || "custom", items: checklist.items.map(toTemplateItem) }),
      });
      if (data.template) setUserTemplates((current) => [data.template as UserChecklistTemplate, ...current.filter((item) => item.id !== data.template?.id)]);
      setTemplateName(""); setTemplateDescription("");
      toast.success({ title: "Szablon został zapisany." });
    } catch (error) {
      toast.error({ title: "Nie udało się zapisać szablonu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    } finally { setLoading(false); }
  }

  async function overwriteTemplate(template: UserChecklistTemplate) {
    if (!checklist?.items.length || !window.confirm(`Nadpisać szablon „${template.name}” aktualną checklistą?`)) return;
    setLoading(true);
    try {
      const data = await requestTripAction<TemplateResponse>(`/api/checklist-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: template.name, description: template.description || "", tripType: tripType || template.tripType || "custom", items: checklist.items.map(toTemplateItem) }),
      });
      if (data.template) setUserTemplates((current) => current.map((item) => item.id === data.template?.id ? data.template as UserChecklistTemplate : item));
      toast.success({ title: "Szablon został zaktualizowany." });
    } catch (error) {
      toast.error({ title: "Nie udało się zaktualizować szablonu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    } finally { setLoading(false); }
  }

  async function deleteTemplate(template: UserChecklistTemplate) {
    if (!window.confirm(`Usunąć szablon „${template.name}”?`)) return;
    setLoading(true);
    try {
      await requestTripAction(`/api/checklist-templates/${template.id}`, { method: "DELETE" });
      setUserTemplates((current) => current.filter((item) => item.id !== template.id));
      toast.success({ title: "Szablon został usunięty." });
    } catch (error) {
      toast.error({ title: "Nie udało się usunąć szablonu.", description: getActionErrorMessage(error, "Spróbuj ponownie.") });
    } finally { setLoading(false); }
  }

  return (
    <>
      <TripActionTrigger label={label} icon={icon} className={className} onClick={() => setOpen(true)} />
      <TripActionDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Checklista wyprawy"
        description="Przygotuj listę rzeczy, użyj podpowiedzi Rybio albo zapisz własny szablon na kolejne wyjazdy."
        size="lg"
        busy={loading}
        footer={<div className="flex justify-end"><Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="h-12 min-h-12 sm:min-w-28">Zamknij</Button></div>}
      >
        <div className="space-y-6">
          {checklist && <ChecklistSummary checklist={checklist} progress={progress} packedCount={packedCount} />}
          {canEdit && (
            <div className="grid max-w-lg grid-cols-2 gap-1.5 rounded-control bg-surface-muted p-1.5" role="tablist" aria-label="Widok checklisty">
              <Tab active={view === "items"} onClick={() => setView("items")}>Elementy</Tab>
              <Tab active={view === "templates"} onClick={() => setView("templates")}>Szablony</Tab>
            </div>
          )}

          {loading && checklist === null ? <LoadingState /> : view === "templates" && canEdit ? (
            <TemplatesView
              generated={generatedTemplates}
              saved={userTemplates}
              checklist={checklist}
              loading={loading}
              templateName={templateName}
              setTemplateName={setTemplateName}
              templateDescription={templateDescription}
              setTemplateDescription={setTemplateDescription}
              onApply={applyTemplate}
              onSave={saveTemplate}
              onOverwrite={overwriteTemplate}
              onDelete={deleteTemplate}
            />
          ) : (
            <ItemsView
              checklist={checklist}
              canEdit={canEdit}
              loading={loading}
              onEnsure={ensureChecklist}
              itemName={itemName}
              setItemName={setItemName}
              itemCategory={itemCategory}
              setItemCategory={setItemCategory}
              itemQuantity={itemQuantity}
              setItemQuantity={setItemQuantity}
              itemUnit={itemUnit}
              setItemUnit={setItemUnit}
              itemImportant={itemImportant}
              setItemImportant={setItemImportant}
              itemNote={itemNote}
              setItemNote={setItemNote}
              onAdd={addItem}
              onTogglePacked={(item) => void patchItem(item, { isPacked: !item.isPacked })}
              onToggleImportant={(item) => void patchItem(item, { isImportant: !item.isImportant })}
              onDelete={(item) => void deleteItem(item)}
            />
          )}
        </div>
      </TripActionDialog>
    </>
  );
}

function ChecklistSummary({ checklist, progress, packedCount }: { checklist: NonNullable<Checklist>; progress: number; packedCount: number }) {
  return (
    <div className="rounded-card bg-surface-muted px-4 py-4 sm:px-5">
      <div className="flex items-end justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-text">Postęp przygotowania</p><span className="text-lg font-extrabold text-primary-700">{progress}%</span></div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} /></div>
        </div>
        <div className="shrink-0 text-right"><p className="text-[10px] font-black uppercase tracking-[0.08em] text-text-muted">Spakowane</p><p className="mt-1 text-sm font-extrabold text-text">{packedCount}/{checklist.items.length}</p></div>
      </div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={cn("h-11 rounded-xl px-4 text-sm font-bold transition", active ? "bg-surface text-primary-700 shadow-[0_1px_3px_rgba(13,30,51,0.08)]" : "text-text-secondary hover:text-text")}>{children}</button>;
}

function ItemsView({ checklist, canEdit, loading, onEnsure, itemName, setItemName, itemCategory, setItemCategory, itemQuantity, setItemQuantity, itemUnit, setItemUnit, itemImportant, setItemImportant, itemNote, setItemNote, onAdd, onTogglePacked, onToggleImportant, onDelete }: {
  checklist: Checklist; canEdit: boolean; loading: boolean; onEnsure: () => void;
  itemName: string; setItemName: (value: string) => void; itemCategory: string; setItemCategory: (value: string) => void;
  itemQuantity: string; setItemQuantity: (value: string) => void; itemUnit: string; setItemUnit: (value: string) => void;
  itemImportant: boolean; setItemImportant: (value: boolean) => void; itemNote: string; setItemNote: (value: string) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void; onTogglePacked: (item: ChecklistItem) => void; onToggleImportant: (item: ChecklistItem) => void; onDelete: (item: ChecklistItem) => void;
}) {
  if (!checklist) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
        <p className="font-display text-lg font-extrabold text-text">Ta wyprawa nie ma checklisty</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">Utwórz ją, aby dodawać własne elementy i korzystać z rekomendowanych szablonów Rybio.</p>
        {canEdit && <Button type="button" onClick={onEnsure} isLoading={loading} loadingLabel="Tworzenie…" className="mt-6">Utwórz checklistę</Button>}
      </div>
    );
  }

  const groups = groupChecklistItems(checklist.items);
  return (
    <div className="space-y-7">
      {groups.length ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.category} className="overflow-hidden rounded-card border border-border">
              <div className="flex items-center justify-between gap-4 bg-surface-muted px-4 py-3.5">
                <div><p className="text-sm font-bold text-text">{group.category}</p><p className="mt-0.5 text-xs text-text-muted">{group.packed}/{group.items.length} spakowane</p></div>
                <Badge variant={group.packed === group.items.length ? "success" : "neutral"}>{group.packed === group.items.length ? "Gotowe" : `${group.items.length - group.packed} pozostało`}</Badge>
              </div>
              <div className="divide-y divide-border">
                {group.items.map((item) => <ItemRow key={item.id} item={item} canEdit={canEdit} onTogglePacked={onTogglePacked} onToggleImportant={onToggleImportant} onDelete={onDelete} />)}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="rounded-control bg-surface-muted px-4 py-6 text-center"><p className="text-sm font-bold text-text">Checklista jest pusta</p><p className="mt-1.5 text-xs leading-5 text-text-muted">Dodaj własny element lub przejdź do zakładki Szablony.</p></div>}

      {canEdit && (
        <form onSubmit={onAdd} className="rounded-card border border-border bg-surface-muted p-5">
          <p className="font-display text-lg font-extrabold text-text">Dodaj własny element</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><ActionInput label="Nazwa" value={itemName} onChange={(e) => setItemName(e.target.value)} maxLength={120} placeholder="np. Zapasowe przypony" required /></div>
            <ActionSelect label="Kategoria" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>{CHECKLIST_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</ActionSelect>
            <div className="grid grid-cols-2 gap-3"><ActionInput label="Ilość" value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} type="number" min="1" max="999" step="1" required /><ActionInput label="Jednostka" value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} maxLength={20} /></div>
            <div className="sm:col-span-2"><ActionTextarea label="Notatka" value={itemNote} onChange={(e) => setItemNote(e.target.value)} maxLength={500} rows={3} className="min-h-20" placeholder="Opcjonalnie..." /></div>
            <div className="sm:col-span-2"><ActionCheckbox checked={itemImportant} onChange={setItemImportant} label="Ważny element" description="Ważne pozycje są wyraźnie wyróżnione podczas przygotowania wyprawy." /></div>
          </div>
          <div className="mt-5 flex justify-end"><Button type="submit" isLoading={loading} loadingLabel="Dodawanie…">Dodaj element</Button></div>
        </form>
      )}
    </div>
  );
}

function ItemRow({ item, canEdit, onTogglePacked, onToggleImportant, onDelete }: { item: ChecklistItem; canEdit: boolean; onTogglePacked: (item: ChecklistItem) => void; onToggleImportant: (item: ChecklistItem) => void; onDelete: (item: ChecklistItem) => void }) {
  return (
    <div className={cn("flex items-start gap-3 px-4 py-4", item.isPacked && "bg-success-subtle/55")}>
      <button type="button" role="checkbox" aria-checked={item.isPacked} disabled={!canEdit} onClick={() => onTogglePacked(item)} className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs font-black transition", item.isPacked ? "border-success bg-success text-white" : "border-border-strong bg-surface text-transparent hover:border-primary-300", !canEdit && "opacity-70")} aria-label={item.isPacked ? `Oznacz ${item.name} jako niespakowane` : `Oznacz ${item.name} jako spakowane`}>✓</button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><p className={cn("break-words text-sm font-bold", item.isPacked ? "text-success-foreground line-through" : "text-text")}>{item.name}</p>{item.isImportant && <Badge variant="warning">Ważne</Badge>}{item.source === "template" && <Badge variant="primary">Szablon</Badge>}</div>
        <p className="mt-1.5 text-xs text-text-muted">{item.quantity} {item.unit || ""} · {item.category}</p>
        {item.note && <p className="mt-2 text-xs leading-5 text-text-secondary">{item.note}</p>}
      </div>
      {canEdit && (
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => onToggleImportant(item)} className={cn("rounded-xl px-2.5 py-2 text-[11px] font-bold transition", item.isImportant ? "bg-warning-subtle text-warning-foreground" : "text-text-muted hover:bg-surface-muted hover:text-text")}>{item.isImportant ? "Ważne" : "Oznacz ważne"}</button>
          <button type="button" onClick={() => onDelete(item)} className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition hover:bg-danger-subtle hover:text-danger" aria-label={`Usuń ${item.name}`}><TrashIcon className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}

function TemplatesView({ generated, saved, checklist, loading, templateName, setTemplateName, templateDescription, setTemplateDescription, onApply, onSave, onOverwrite, onDelete }: {
  generated: ChecklistTemplate[]; saved: UserChecklistTemplate[]; checklist: Checklist; loading: boolean;
  templateName: string; setTemplateName: (value: string) => void; templateDescription: string; setTemplateDescription: (value: string) => void;
  onApply: (template: ChecklistTemplate) => void; onSave: (event: FormEvent<HTMLFormElement>) => void; onOverwrite: (template: UserChecklistTemplate) => void; onDelete: (template: UserChecklistTemplate) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold text-text">Podpowiedzi Rybio</p><p className="mt-1 text-xs leading-5 text-text-muted">Dobierane do długości wyjazdu, metody oraz wymagań łowiska.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{generated.map((template) => <TemplateCard key={template.id} template={template} loading={loading} onApply={() => onApply(template)} />)}</div>
      </div>
      <div className="border-t border-border pt-7">
        <p className="text-sm font-bold text-text">Twoje szablony</p>
        {saved.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {saved.map((template) => (
              <div key={template.id} className="rounded-control border border-border bg-surface p-4">
                <p className="text-sm font-bold text-text">{template.name}</p><p className="mt-1 text-xs leading-5 text-text-muted">{template.description || "Własny szablon checklisty"}</p><p className="mt-2 text-[11px] font-bold text-text-muted">{template.items.length} pozycji</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" disabled={loading} onClick={() => onApply({ id: template.id, label: template.name, description: template.description || "", items: template.items })}>Użyj</Button>
                  {checklist?.items.length ? <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => onOverwrite(template)}>Nadpisz</Button> : null}
                  <Button type="button" size="sm" variant="ghost" disabled={loading} onClick={() => onDelete(template)} className="text-danger hover:bg-danger-subtle hover:text-danger">Usuń</Button>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="mt-3 rounded-control bg-surface-muted px-4 py-4 text-xs leading-5 text-text-muted">Nie masz jeszcze zapisanych własnych szablonów.</p>}
      </div>
      <form onSubmit={onSave} className="border-t border-border pt-7">
        <p className="text-sm font-bold text-text">Zapisz aktualną checklistę jako szablon</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2"><ActionInput label="Nazwa szablonu" value={templateName} onChange={(e) => setTemplateName(e.target.value)} maxLength={80} placeholder="np. Moja karpiówka" required /><ActionInput label="Opis" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} maxLength={300} placeholder="Opcjonalnie..." /></div>
        <div className="mt-5 flex justify-end"><Button type="submit" variant="secondary" disabled={!checklist?.items.length} isLoading={loading} loadingLabel="Zapisywanie…">Zapisz jako szablon</Button></div>
      </form>
    </div>
  );
}

function TemplateCard({ template, loading, onApply }: { template: ChecklistTemplate; loading: boolean; onApply: () => void }) {
  return <div className="rounded-control border border-border bg-surface p-4"><p className="text-sm font-bold text-text">{template.label}</p><p className="mt-1 text-xs leading-5 text-text-muted">{template.description}</p><p className="mt-2 text-[11px] font-bold text-primary-700">{template.items.length} pozycji</p><Button type="button" size="sm" variant="secondary" onClick={onApply} disabled={loading} className="mt-4">Dodaj do checklisty</Button></div>;
}

function LoadingState() { return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-control bg-surface-muted" />)}</div>; }

function groupChecklistItems(items: ChecklistItem[]) {
  const map = new Map<string, ChecklistItem[]>();
  for (const item of items) {
    const category = item.category.trim() || "Inne";
    map.set(category, [...(map.get(category) ?? []), item]);
  }
  const priority = ["Wymagania łowiska", "Dokumenty", "Bezpieczeństwo", "Sprzęt", "Przynęty", "Jedzenie", "Odzież", "Inne"];
  return Array.from(map.entries()).map(([category, groupItems]) => ({ category, items: groupItems, packed: groupItems.filter((item) => item.isPacked).length })).sort((a, b) => {
    const ai = priority.indexOf(a.category); const bi = priority.indexOf(b.category);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.category.localeCompare(b.category, "pl");
  });
}

function toTemplateItem(item: ChecklistItem) {
  return { name: item.name, category: item.category, quantity: item.quantity, unit: item.unit || "", isImportant: item.isImportant, note: item.note || "" };
}
