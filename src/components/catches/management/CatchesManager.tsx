"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import type {
  CatchFieldChange,
  CatchFilterState,
  CatchFormMode,
  CatchFormState,
  CatchViewMode,
  FishingCatch,
  LakeOption,
  TripOption,
} from "@/components/catches/types";
import { INITIAL_CATCH_FILTERS } from "@/components/catches/constants";
import {
  compressCatchImage,
  createCatchFormStateForEdit,
  createCatchFormStateForTrip,
  getActiveTrip,
  getCatchStats,
  getMethodFromTripType,
  matchesCatchFilters,
} from "@/components/catches/utils";
import { CatchCard } from "@/components/catches/cards/CatchCard";
import { CatchListRow } from "@/components/catches/cards/CatchListRow";
import { CatchFormDrawer } from "@/components/catches/forms/CatchFormDrawer";
import { CatchDeleteDialog } from "@/components/catches/management/CatchDeleteDialog";
import { CatchesHeader } from "@/components/catches/management/CatchesHeader";
import { CatchesStats } from "@/components/catches/management/CatchesStats";
import { CatchesToolbar } from "@/components/catches/management/CatchesToolbar";
import { CatchShareDialog } from "@/components/catches/CatchShareDialog";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { FishIcon } from "@/components/icons/FishIcon";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/ToastProvider";

export function CatchesManager({
  initialCatches,
  lakes,
  trips,
  initialTripId = null,
  initialCreateOpen = false,
  initialEditCatchId = null,
}: {
  initialCatches: FishingCatch[];
  lakes: LakeOption[];
  trips: TripOption[];
  initialTripId?: string | null;
  initialCreateOpen?: boolean;
  initialEditCatchId?: string | null;
}) {
  const toast = useToast();
  const initialTrip = trips.find((trip) => trip.id === initialTripId) ?? null;
  const activeTrip = useMemo(() => getActiveTrip(trips), [trips]);
  const initialEditCatch = initialCatches.find((item) => item.id === initialEditCatchId) ?? null;
  const shouldOpenInitially = Boolean(initialEditCatch || initialTrip || initialCreateOpen);
  const initialFormMode: CatchFormMode = initialEditCatch ? "full" : "quick";
  const initialPreferredTrip = initialTrip ?? (initialCreateOpen ? activeTrip : null);

  const [catches, setCatches] = useState<FishingCatch[]>(initialCatches);
  const [form, setForm] = useState<CatchFormState>(() =>
    initialEditCatch
      ? createCatchFormStateForEdit(initialEditCatch)
      : createCatchFormStateForTrip(initialPreferredTrip, shouldOpenInitially)
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(shouldOpenInitially);
  const [formMode, setFormMode] = useState<CatchFormMode>(initialFormMode);
  const [editingCatchId, setEditingCatchId] = useState<string | null>(initialEditCatch?.id ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState<CatchFilterState>(INITIAL_CATCH_FILTERS);
  const [viewMode, setViewMode] = useState<CatchViewMode>("grid");
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);
  const [shareCatch, setShareCatch] = useState<FishingCatch | null>(null);
  const [deleteCatch, setDeleteCatch] = useState<FishingCatch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("rybio-catches-view-mode");
    if (saved === "list" || saved === "grid") setViewMode(saved);
  }, []);

  const editingCatch = editingCatchId
    ? catches.find((item) => item.id === editingCatchId) ?? null
    : null;

  const filteredCatches = useMemo(
    () => catches.filter((item) => matchesCatchFilters(item, filters)),
    [catches, filters]
  );
  const stats = useMemo(() => getCatchStats(catches), [catches]);

  const updateField: CatchFieldChange = (field, value) => {
    if (field === "tripId") {
      const nextTripId = String(value ?? "");
      const selectedTrip = trips.find((trip) => trip.id === nextTripId) ?? null;
      const tripMethod = getMethodFromTripType(selectedTrip?.tripType);

      setForm((current) => ({
        ...current,
        tripId: nextTripId,
        lakeId: selectedTrip?.lakeId ?? current.lakeId,
        method: tripMethod ?? current.method,
      }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeForm = useCallback(() => {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingCatchId(null);
    setSelectedImage(null);
    setFormMode("quick");
    setForm(createCatchFormStateForTrip(activeTrip, false));
  }, [activeTrip, isSaving]);

  function openCreateForm() {
    setEditingCatchId(null);
    setSelectedImage(null);
    setFormMode("quick");
    setForm(createCatchFormStateForTrip(activeTrip, true));
    setIsFormOpen(true);
  }

  function openEditForm(item: FishingCatch) {
    setEditingCatchId(item.id);
    setSelectedImage(null);
    setFormMode("full");
    setForm(createCatchFormStateForEdit(item));
    setIsFormOpen(true);
  }

  function handleViewModeChange(next: CatchViewMode) {
    setViewMode(next);
    window.localStorage.setItem("rybio-catches-view-mode", next);
  }

  function validateForm(finalFishName: string) {
    if (!finalFishName) {
      toast.error({ title: "Wybierz gatunek ryby.", description: "Wybierz gatunek z listy albo wpisz własny." });
      return false;
    }

    if (!form.caughtAt) {
      toast.error({ title: "Wybierz datę połowu.", description: "Data i godzina połowu są wymagane." });
      return false;
    }

    if (!form.isPublic) return true;

    const hasImage = Boolean(selectedImage || editingCatch?.imageUrl || editingCatch?.imagePath);

    if (!form.lakeId) {
      toast.error({ title: "Wybierz łowisko z bazy.", description: "Publiczny połów musi być przypisany do łowiska." });
      return false;
    }

    if (!hasImage) {
      toast.error({ title: "Dodaj zdjęcie ryby.", description: "Zdjęcie jest wymagane dla publicznego połowu." });
      return false;
    }

    if (!form.weight && !form.length) {
      toast.error({ title: "Podaj wagę lub długość.", description: "Ranking wymaga co najmniej jednego pomiaru." });
      return false;
    }

    return true;
  }

  async function uploadCatchImage(catchId: string, image: File) {
    const compressed = await compressCatchImage(image);
    const formData = new FormData();
    formData.append("image", compressed);

    const response = await fetch(`/api/catches/${catchId}/image`, {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as FishingCatch & { message?: string };

    if (!response.ok) {
      throw new Error(data.message || "Nie udało się dodać zdjęcia.");
    }

    return data;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalFishName = form.fishName === "other" ? form.customFishName.trim() : form.fishName;
    if (!validateForm(finalFishName)) return;

    setIsSaving(true);
    const toastId = toast.loading({
      title: editingCatch ? "Zapisywanie zmian..." : "Dodawanie połowu...",
      description: selectedImage ? "Przygotowujemy dane i zdjęcie połowu." : "Przygotowujemy dane połowu.",
    });

    try {
      if (!editingCatch) {
        const formData = new FormData();
        formData.append("fishName", finalFishName);
        formData.append("weight", form.weight);
        formData.append("length", form.length);
        formData.append("method", form.method);
        formData.append("bait", form.bait);
        formData.append("caughtAt", form.caughtAt);
        formData.append("lakeId", form.lakeId);
        formData.append("tripId", form.tripId);
        formData.append("note", form.note);
        formData.append("isPublic", String(form.isPublic));

        if (selectedImage) {
          formData.append("image", await compressCatchImage(selectedImage));
        }

        const response = await fetch("/api/catches", { method: "POST", body: formData });
        const data = (await response.json()) as FishingCatch & { message?: string };

        if (!response.ok) throw new Error(data.message || "Nie udało się zapisać połowu.");

        setCatches((current) => [data, ...current]);
        setShareCatch(data);
        setIsFormOpen(false);
        setEditingCatchId(null);
        setSelectedImage(null);
        setForm(createCatchFormStateForTrip(activeTrip, false));
        setFormMode("quick");

        toast.update(toastId, {
          type: "success",
          title: "Połów został dodany.",
          description: form.isPublic ? "Połów trafił do weryfikacji rankingu łowiska." : "Połów został zapisany w Twoim dzienniku.",
          duration: 4500,
        });
        return;
      }

      let imageSnapshot: FishingCatch | null = null;
      const mustUploadBeforeUpdate = Boolean(
        selectedImage && form.isPublic && !editingCatch.imagePath && !editingCatch.imageUrl
      );

      if (selectedImage && mustUploadBeforeUpdate) {
        imageSnapshot = await uploadCatchImage(editingCatch.id, selectedImage);
      }

      const response = await fetch(`/api/catches/${editingCatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fishName: finalFishName }),
      });
      const data = (await response.json()) as FishingCatch & { message?: string };

      if (!response.ok) throw new Error(data.message || "Nie udało się zapisać zmian.");

      let savedCatch: FishingCatch = imageSnapshot
        ? { ...data, imagePath: imageSnapshot.imagePath, imageUrl: imageSnapshot.imageUrl }
        : data;

      if (selectedImage && !mustUploadBeforeUpdate) {
        savedCatch = await uploadCatchImage(editingCatch.id, selectedImage);
      }

      setCatches((current) => current.map((item) => (item.id === editingCatch.id ? savedCatch : item)));
      setIsFormOpen(false);
      setEditingCatchId(null);
      setSelectedImage(null);
      setForm(createCatchFormStateForTrip(activeTrip, false));
      setFormMode("quick");

      toast.update(toastId, {
        type: "success",
        title: "Połów został zaktualizowany.",
        description: form.isPublic ? "Zmiany zapisano. Połów może wymagać ponownej weryfikacji." : "Zmiany zapisano w dzienniku.",
        duration: 4500,
      });
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        title: editingCatch ? "Nie udało się zapisać zmian." : "Nie udało się dodać połowu.",
        description: error instanceof Error ? error.message : "Spróbuj ponownie za chwilę.",
        duration: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteCatch) return;

    setIsDeleting(true);
    const toastId = toast.loading({ title: "Usuwanie połowu...", description: "Usuwamy wpis z dziennika." });

    try {
      const response = await fetch(`/api/catches/${deleteCatch.id}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) throw new Error(data.message || "Nie udało się usunąć połowu.");

      setCatches((current) => current.filter((item) => item.id !== deleteCatch.id));
      if (editingCatchId === deleteCatch.id) closeForm();
      setDeleteCatch(null);

      toast.update(toastId, {
        type: "success",
        title: "Połów został usunięty.",
        description: "Wpis nie jest już widoczny w dzienniku.",
        duration: 4500,
      });
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć połowu.",
        description: error instanceof Error ? error.message : "Spróbuj ponownie.",
        duration: 6000,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="w-full max-w-full pb-28 md:pb-0">
      <CatchesHeader onAddCatch={openCreateForm} />

      <div className="mt-6">
        <CatchesStats {...stats} />
      </div>

      <div className="mt-6">
        <CatchesToolbar
          catches={catches}
          filters={filters}
          lakes={lakes}
          trips={trips}
          viewMode={viewMode}
          onFiltersChange={setFilters}
          onViewModeChange={handleViewModeChange}
          onClearFilters={() => setFilters(INITIAL_CATCH_FILTERS)}
        />
      </div>

      <div className="mt-5">
        {filteredCatches.length === 0 ? (
          <EmptyState
            icon={<FishIcon className="h-6 w-6 -scale-x-100" />}
            title={catches.length === 0 ? "Dodaj pierwszy połów" : "Brak połowów dla tych filtrów"}
            description={
              catches.length === 0
                ? "Zacznij budować dziennik, statystyki gatunków i własne rekordy."
                : "Zmień wyszukiwanie lub wyczyść filtry, aby zobaczyć więcej wpisów."
            }
            action={
              catches.length === 0 ? (
                <Button onClick={openCreateForm}>Dodaj połów</Button>
              ) : (
                <Button variant="outline" onClick={() => setFilters(INITIAL_CATCH_FILTERS)}>Wyczyść filtry</Button>
              )
            }
          />
        ) : viewMode === "grid" ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredCatches.map((item) => (
              <CatchCard
                key={item.id}
                item={item}
                onPreviewImage={() => item.imageUrl && setPreviewImage({ url: item.imageUrl, alt: `Zdjęcie połowu: ${item.fishName}` })}
                onShare={() => setShareCatch(item)}
                onEdit={() => openEditForm(item)}
                onDelete={() => setDeleteCatch(item)}
              />
            ))}
          </section>
        ) : (
          <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
            <div className="divide-y divide-border">
              {filteredCatches.map((item) => (
                <CatchListRow
                  key={item.id}
                  item={item}
                  onPreviewImage={() => item.imageUrl && setPreviewImage({ url: item.imageUrl, alt: `Zdjęcie połowu: ${item.fishName}` })}
                  onShare={() => setShareCatch(item)}
                  onEdit={() => openEditForm(item)}
                  onDelete={() => setDeleteCatch(item)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <CatchFormDrawer
        isOpen={isFormOpen}
        mode={formMode}
        form={form}
        editingCatch={editingCatch}
        selectedImage={selectedImage}
        lakes={lakes}
        trips={trips}
        autoTripId={(initialTrip ?? activeTrip)?.id ?? null}
        isLoading={isSaving}
        onSubmit={handleSubmit}
        onClose={closeForm}
        onSwitchToFull={() => setFormMode("full")}
        onFieldChange={updateField}
        onImageChange={setSelectedImage}
      />

      <CatchDeleteDialog fishingCatch={deleteCatch} isDeleting={isDeleting} onCancel={() => !isDeleting && setDeleteCatch(null)} onConfirm={confirmDelete} />

      {shareCatch && <CatchShareDialog fishingCatch={shareCatch} onClose={() => setShareCatch(null)} />}

      {previewImage && (
        <div className="fixed inset-0 z-[1350] flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-[2px]" onMouseDown={() => setPreviewImage(null)}>
          <div className="relative max-h-[92dvh] w-full max-w-6xl overflow-hidden rounded-modal bg-surface p-2 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setPreviewImage(null)} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 text-text-secondary shadow-card" aria-label="Zamknij podgląd">
              <CloseIcon className="h-5 w-5" />
            </button>
            <img src={previewImage.url} alt={previewImage.alt} className="max-h-[88dvh] w-full rounded-[20px] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
