"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { CatchShareDialog } from "@/components/catches/CatchShareDialog";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { BoltIcon } from "@/components/icons/BoltIcon";
import { FormIcon } from "@/components/icons/FormIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { PencilIcon } from "@/components/icons/PencilIcon";


type FishingCatch = {
  id: string;
  userId: string;
  fishName: string;
  weight: number | null;
  length: number | null;
  method: string;
  bait: string | null;
  caughtAt: string;
  lakeId: string | null;
  lakeName: string | null;
  tripId: string | null;
  tripTitle: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  note: string | null;
  isPublic: boolean;
  rankingStatus: string;
  catchScore?: number | null;
  catchScoreTier?: string | null;
  catchScoreSource?: string | null;
  catchScoreVersion?: number | null;
  createdAt: string;
  updatedAt: string;
};

type LakeOption = {
  id: string;
  name: string;
  city: string;
  voivodeship: string;
};

type TripOption = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  lakeId: string | null;
  tripType: string;
  status: string;
};

type CatchesPageProps = {
  initialCatches: FishingCatch[];
  lakes: LakeOption[];
  trips: TripOption[];
  initialTripId?: string | null;
  initialCreateOpen?: boolean;
};

type CatchFormState = {
  fishName: string;
  customFishName: string;
  weight: string;
  length: string;
  method: string;
  bait: string;
  caughtAt: string;
  lakeId: string;
  tripId: string;
  note: string;
  isPublic: boolean;
};

type ViewMode = "grid" | "list";
type CatchFormMode = "quick" | "full";

const initialFormState: CatchFormState = {
  fishName: "",
  customFishName: "",
  weight: "",
  length: "",
  method: "spinning",
  bait: "",
  caughtAt: "",
  lakeId: "",
  tripId: "",
  note: "",
  isPublic: false,
};

const fishSpecies = [
  { label: "Amur biały", value: "Amur biały" },
  { label: "Boleń", value: "Boleń" },
  { label: "Brzana", value: "Brzana" },
  { label: "Certa", value: "Certa" },
  { label: "Ciernik", value: "Ciernik" },
  { label: "Cierniczek", value: "Cierniczek" },
  { label: "Czebaczek amurski", value: "Czebaczek amurski" },
  { label: "Głowacica", value: "Głowacica" },
  { label: "Jaź", value: "Jaź" },
  { label: "Jazgarz", value: "Jazgarz" },
  { label: "Jelec", value: "Jelec" },
  { label: "Jesiotr", value: "Jesiotr" },
  { label: "Karaś pospolity", value: "Karaś pospolity" },
  { label: "Karaś srebrzysty", value: "Karaś srebrzysty" },
  { label: "Karp", value: "Karp" },
  { label: "Kiełb", value: "Kiełb" },
  { label: "Kleń", value: "Kleń" },
  { label: "Koza", value: "Koza" },
  { label: "Krąp", value: "Krąp" },
  { label: "Leszcz", value: "Leszcz" },
  { label: "Lin", value: "Lin" },
  { label: "Lipień", value: "Lipień" },
  { label: "Łosoś atlantycki", value: "Łosoś atlantycki" },
  { label: "Miętus", value: "Miętus" },
  { label: "Okoń", value: "Okoń" },
  { label: "Piekielnica", value: "Piekielnica" },
  { label: "Piskorz", value: "Piskorz" },
  { label: "Płoć", value: "Płoć" },
  { label: "Pstrąg potokowy", value: "Pstrąg potokowy" },
  { label: "Pstrąg tęczowy", value: "Pstrąg tęczowy" },
  { label: "Pstrąg źródlany", value: "Pstrąg źródlany" },
  { label: "Różanka", value: "Różanka" },
  { label: "Sandacz", value: "Sandacz" },
  { label: "Sieja", value: "Sieja" },
  { label: "Sielawa", value: "Sielawa" },
  { label: "Słonecznica", value: "Słonecznica" },
  { label: "Strzebla potokowa", value: "Strzebla potokowa" },
  { label: "Sum", value: "Sum" },
  { label: "Sumik karłowaty", value: "Sumik karłowaty" },
  { label: "Szczupak", value: "Szczupak" },
  { label: "Śliz", value: "Śliz" },
  { label: "Świnka", value: "Świnka" },
  { label: "Tołpyga biała", value: "Tołpyga biała" },
  { label: "Tołpyga pstra", value: "Tołpyga pstra" },
  { label: "Troć wędrowna", value: "Troć wędrowna" },
  { label: "Ukleja", value: "Ukleja" },
  { label: "Węgorz europejski", value: "Węgorz europejski" },
  { label: "Wzdręga", value: "Wzdręga" },
  { label: "Inny gatunek", value: "other" },
];

const methods = [
  { label: "Spinning", value: "spinning" },
  { label: "Feeder", value: "feeder" },
  { label: "Method feeder", value: "method_feeder" },
  { label: "Karpiówka", value: "carp" },
  { label: "Spławik", value: "float" },
  { label: "Muchówka", value: "fly" },
  { label: "Inna", value: "other" },
];

export function CatchesPage({
  initialCatches,
  lakes,
  trips,
  initialTripId = null,
  initialCreateOpen = false,
}: CatchesPageProps) {
  const toast = useToast();

  const initialTrip = trips.find((trip) => trip.id === initialTripId) ?? null;
  const initialTripExists = Boolean(initialTrip);

  const activeTrip = useMemo(() => {
    const now = Date.now();

    return (
      trips.find((trip) => {
        if (trip.status === "cancelled" || trip.status === "canceled") {
          return false;
        }

        const startsAt = new Date(trip.startsAt).getTime();

        if (!Number.isFinite(startsAt)) {
          return false;
        }

        const endsAt = trip.endsAt
          ? new Date(trip.endsAt).getTime()
          : startsAt + 24 * 60 * 60 * 1000;

        return startsAt <= now && now <= endsAt;
      }) ?? null
    );
  }, [trips]);

  const initialFormWithTrip: CatchFormState = {
    ...initialFormState,
    caughtAt: initialTripExists
      ? toDateTimeLocalValue(new Date().toISOString())
      : "",
    tripId: initialTrip?.id ?? "",
    lakeId: initialTrip?.lakeId ?? "",
    method:
      getMethodFromTripType(initialTrip?.tripType) ?? initialFormState.method,
  };

  const [catches, setCatches] = useState<FishingCatch[]>(initialCatches);
  const [form, setForm] = useState<CatchFormState>(initialFormWithTrip);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(
  initialTripExists || initialCreateOpen
  );
  const [formMode, setFormMode] = useState<CatchFormMode>(
    initialTripExists ? "quick" : "full"
  );
  const [editingCatchId, setEditingCatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [areMobileFiltersOpen, setAreMobileFiltersOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") {
      return "grid";
    }

    const savedViewMode = localStorage.getItem("rybit-catches-view-mode");

    return savedViewMode === "list" ? "list" : "grid";
  });

  const [previewImage, setPreviewImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  const [shareCatch, setShareCatch] = useState<FishingCatch | null>(null);

  const activeFiltersCount =
    Number(Boolean(search.trim())) + Number(methodFilter !== "all");

  function updateField<K extends keyof CatchFormState>(
    field: K,
    value: CatchFormState[K]
  ) {
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

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleViewModeChange(nextViewMode: ViewMode) {
    setViewMode(nextViewMode);
    localStorage.setItem("rybit-catches-view-mode", nextViewMode);
  }

  function openCreateForm(mode: CatchFormMode = "full") {
    const preferredTrip =
      initialTrip ?? (mode === "quick" ? activeTrip : null);

    setEditingCatchId(null);
    setSelectedImage(null);
    setForm({
      ...initialFormState,
      caughtAt:
        mode === "quick"
          ? toDateTimeLocalValue(new Date().toISOString())
          : "",
      tripId: preferredTrip?.id ?? "",
      lakeId: preferredTrip?.lakeId ?? "",
      method:
        getMethodFromTripType(preferredTrip?.tripType) ??
        initialFormState.method,
    });
    setFormMode(mode);
    setIsFormOpen(true);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);
  }

  function handleStartEdit(item: FishingCatch) {
    const isKnownFish = fishSpecies.some(
      (species) => species.value === item.fishName
    );

    setEditingCatchId(item.id);
    setSelectedImage(null);
    setFormMode("full");

    setForm({
      fishName: isKnownFish ? item.fishName : "other",
      customFishName: isKnownFish ? "" : item.fishName,
      weight: item.weight !== null ? String(item.weight) : "",
      length: item.length !== null ? String(item.length) : "",
      method: item.method,
      bait: item.bait || "",
      caughtAt: toDateTimeLocalValue(item.caughtAt),
      lakeId: item.lakeId || "",
      tripId: item.tripId || "",
      note: item.note || "",
      isPublic: Boolean(item.isPublic),
    });

    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancelForm() {
    if (isLoading) {
      return;
    }

    setEditingCatchId(null);
    setSelectedImage(null);
    setForm(initialFormWithTrip);
    setFormMode("full");
    setIsFormOpen(false);
  }

  function clearFilters() {
    setSearch("");
    setMethodFilter("all");
    setAreMobileFiltersOpen(false);
  }

  const filteredCatches = useMemo(() => {
    return catches.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.fishName.toLowerCase().includes(searchValue) ||
        item.lakeName?.toLowerCase().includes(searchValue) ||
        item.tripTitle?.toLowerCase().includes(searchValue) ||
        item.bait?.toLowerCase().includes(searchValue) ||
        item.note?.toLowerCase().includes(searchValue);

      const matchesMethod =
        methodFilter === "all" || item.method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [catches, search, methodFilter]);

  const totalCatches = catches.length;

  const biggestWeight = catches.reduce((max, item) => {
    return Math.max(max, item.weight || 0);
  }, 0);

  const biggestLength = catches.reduce((max, item) => {
    return Math.max(max, item.length || 0);
  }, 0);

  const uniqueSpecies = new Set(catches.map((item) => item.fishName)).size;

  async function uploadCatchImage(catchId: string, image: File) {
    const compressedImage = await compressImage(image);

    const formData = new FormData();
    formData.append("image", compressedImage);

    const response = await fetch(`/api/catches/${catchId}/image`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as FishingCatch & {
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.message || "Nie udało się dodać zdjęcia.");
    }

    return data as FishingCatch;
  }

  function validateRankingRules(finalFishName: string) {
    if (!finalFishName) {
      toast.error({
        title: "Wybierz gatunek ryby.",
        description: "Wybierz gatunek z listy albo wpisz własny.",
      });

      return false;
    }

    if (!form.caughtAt) {
      toast.error({
        title: "Wybierz datę połowu.",
        description: "Data i godzina połowu są wymagane.",
      });

      return false;
    }

    if (!form.isPublic) {
      return true;
    }

    const currentEditedCatch = editingCatchId
      ? catches.find((item) => item.id === editingCatchId)
      : null;

    const hasExistingImage = Boolean(currentEditedCatch?.imageUrl);
    const hasImage = Boolean(selectedImage) || hasExistingImage;

    if (!form.lakeId) {
      toast.error({
        title: "Wybierz łowisko z bazy.",
        description:
          "Aby połów trafił do rankingu łowiska, musisz przypisać go do łowiska.",
      });

      return false;
    }

    if (!hasImage) {
      toast.error({
        title: "Dodaj zdjęcie ryby.",
        description:
          "Aby połów trafił do rankingu łowiska, zdjęcie jest wymagane.",
      });

      return false;
    }

    if (!form.weight && !form.length) {
      toast.error({
        title: "Podaj wagę lub długość.",
        description:
          "Aby połów trafił do rankingu łowiska, wpisz wagę lub długość ryby.",
      });

      return false;
    }

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalFishName =
      form.fishName === "other" ? form.customFishName.trim() : form.fishName;

    if (!validateRankingRules(finalFishName)) {
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading({
      title: editingCatchId ? "Zapisywanie zmian..." : "Dodawanie połowu...",
      description: selectedImage
        ? "Przygotowujemy dane i zdjęcie połowu."
        : "Przygotowujemy dane połowu.",
    });

    if (!editingCatchId) {
      try {
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
          const compressedImage = await compressImage(selectedImage);
          formData.append("image", compressedImage);
        }

        const response = await fetch("/api/catches", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json()) as FishingCatch & {
          message?: string;
        };

        if (!response.ok) {
          const errorMessage = data.message || "Nie udało się zapisać połowu.";

          toast.update(toastId, {
            type: "error",
            title: "Nie udało się dodać połowu.",
            description: errorMessage,
            duration: 6000,
          });

          setIsLoading(false);
          return;
        }

        const savedCatch = data as FishingCatch;

        setCatches((current) => [savedCatch, ...current]);
        setShareCatch(savedCatch);
        setForm(initialFormWithTrip);
        setSelectedImage(null);
        setEditingCatchId(null);
        setIsFormOpen(false);
        setIsLoading(false);

        toast.update(toastId, {
          type: "success",
          title: "Połów został dodany.",
          description: form.isPublic
            ? "Połów trafił do weryfikacji rankingu łowiska."
            : "Połów został zapisany w Twoim dzienniku.",
          duration: 4500,
        });

        return;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Nie udało się zapisać połowu.";

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się dodać połowu.",
          description: errorMessage,
          duration: 6000,
        });

        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/catches/${editingCatchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          fishName: finalFishName,
        }),
      });

      const data = (await response.json()) as FishingCatch & {
        message?: string;
      };

      if (!response.ok) {
        const errorMessage = data.message || "Nie udało się zapisać połowu.";

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się zapisać zmian.",
          description: errorMessage,
          duration: 6000,
        });

        setIsLoading(false);
        return;
      }

      let savedCatch = data as FishingCatch;

      if (selectedImage) {
        try {
          savedCatch = await uploadCatchImage(savedCatch.id, selectedImage);
        } catch (error) {
          toast.error({
            title: "Zdjęcie nie zostało zapisane.",
            description:
              error instanceof Error
                ? error.message
                : "Połów został zapisany, ale nie udało się dodać zdjęcia.",
            duration: 6000,
          });
        }
      }

      setCatches((current) =>
        current.map((item) => (item.id === editingCatchId ? savedCatch : item))
      );

      setForm(initialFormWithTrip);
      setSelectedImage(null);
      setEditingCatchId(null);
      setIsFormOpen(false);
      setIsLoading(false);

      toast.update(toastId, {
        type: "success",
        title: "Połów został zaktualizowany.",
        description: form.isPublic
          ? "Zmiany zostały zapisane. Połów może wymagać ponownej weryfikacji."
          : "Zmiany zostały zapisane w Twoim dzienniku.",
        duration: 4500,
      });

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Nie udało się zapisać połowu.";

      toast.update(toastId, {
        type: "error",
        title: "Nie udało się zapisać zmian.",
        description: errorMessage,
        duration: 6000,
      });

      setIsLoading(false);
    }
  }

  async function handleDeleteCatch(id: string) {
    const confirmed = confirm("Czy na pewno chcesz usunąć ten połów?");

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading({
      title: "Usuwanie połowu...",
      description: "Trwa usuwanie wpisu z dziennika.",
    });

    try {
      const response = await fetch(`/api/catches/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          message?: string;
        };

        toast.update(toastId, {
          type: "error",
          title: "Nie udało się usunąć połowu.",
          description: data.message || "Spróbuj ponownie za chwilę.",
          duration: 6000,
        });

        return;
      }

      setCatches((current) => current.filter((item) => item.id !== id));

      if (editingCatchId === id) {
        handleCancelForm();
      }

      toast.update(toastId, {
        type: "success",
        title: "Połów został usunięty.",
        description: "Wpis zniknął z Twojego dziennika połowów.",
        duration: 4500,
      });

    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się usunąć połowu.",
        description: "Wystąpił problem z połączeniem. Spróbuj ponownie.",
        duration: 6000,
      });
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-28 md:pb-0">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Moje połowy
          </h1>

          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500 sm:text-sm sm:leading-6">
            Zapisuj złowione ryby, metody, przynęty, łowiska i notatki z wypraw.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => openCreateForm("quick")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 sm:text-sm"
          >
            <BoltIcon className="h-4 w-4 shrink-0" />
            <span>Szybki połów</span>
          </button>

          <button
            type="button"
            onClick={() => openCreateForm("full")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:text-sm"
          >
            <FormIcon className="h-4 w-4 shrink-0" />
            <span>Pełny formularz</span>
          </button>
        </div>
      </div>

      <section className="mb-6 flex w-full max-w-full gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 xl:grid-cols-4">
        <StatCard label="Wszystkie połowy" value={String(totalCatches)} />
        <StatCard label="Gatunki" value={String(uniqueSpecies)} />
        <StatCard
          label="Największa waga"
          value={biggestWeight > 0 ? `${biggestWeight.toFixed(2)} kg` : "Brak"}
        />
        <StatCard
          label="Największa długość"
          value={biggestLength > 0 ? `${biggestLength.toFixed(0)} cm` : "Brak"}
        />
      </section>

      {isFormOpen && (
        <>
          <section className="mb-6 hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:block">
            {formMode === "quick" && !editingCatchId ? (
              <QuickCatchForm
                form={form}
                selectedImage={selectedImage}
                lakes={lakes}
                trips={trips}
                autoTripId={(initialTrip ?? activeTrip)?.id ?? null}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={handleCancelForm}
                onSwitchToFull={() => setFormMode("full")}
                onFieldChange={updateField}
                onImageChange={setSelectedImage}
              />
            ) : (
              <CatchForm
                form={form}
                editingCatchId={editingCatchId}
                selectedImage={selectedImage}
                catches={catches}
                lakes={lakes}
                trips={trips}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={handleCancelForm}
                onFieldChange={updateField}
                onImageChange={setSelectedImage}
              />
            )}
          </section>

          <div
            className="fixed inset-0 z-[1200] flex items-end bg-slate-950/60 p-0 md:hidden"
            onClick={handleCancelForm}
          >
            <div
              className="max-h-[88vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    Dziennik połowów
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                    {editingCatchId
                      ? "Edytuj połów"
                      : formMode === "quick"
                        ? "Szybki połów"
                        : "Dodaj połów"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCancelForm}
                  disabled={isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Zamknij formularz"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[calc(88vh-73px)] overflow-y-auto px-5 py-5">
                {formMode === "quick" && !editingCatchId ? (
                  <QuickCatchForm
                    form={form}
                    selectedImage={selectedImage}
                    lakes={lakes}
                    trips={trips}
                    autoTripId={(initialTrip ?? activeTrip)?.id ?? null}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleCancelForm}
                    onSwitchToFull={() => setFormMode("full")}
                    onFieldChange={updateField}
                    onImageChange={setSelectedImage}
                    isMobile
                  />
                ) : (
                  <CatchForm
                    form={form}
                    editingCatchId={editingCatchId}
                    selectedImage={selectedImage}
                    catches={catches}
                    lakes={lakes}
                    trips={trips}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleCancelForm}
                    onFieldChange={updateField}
                    onImageChange={setSelectedImage}
                    isMobile
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj po gatunku, łowisku, wyprawie..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
          />

          <div className="flex gap-3 xl:hidden">
            <button
              type="button"
              onClick={() => setAreMobileFiltersOpen((current) => !current)}
              className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              {areMobileFiltersOpen ? "Ukryj filtry" : "Filtry"}

              {activeFiltersCount > 0 && (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-blue-600 transition hover:bg-slate-50"
            >
              Wyczyść
            </button>
          </div>

          <div
            className={`grid gap-3 xl:grid ${
              areMobileFiltersOpen ? "grid" : "hidden xl:grid"
            }`}
          >
            <select
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500"
            >
              <option value="all">Wszystkie metody</option>
              {methods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden h-12 rounded-2xl bg-slate-100 p-1 xl:flex">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={`rounded-xl px-4 text-sm font-bold transition ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Kafelki
            </button>

            <button
              type="button"
              onClick={() => handleViewModeChange("list")}
              className={`rounded-xl px-4 text-sm font-bold transition ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </section>

      {filteredCatches.length > 0 ? (
        viewMode === "grid" ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {filteredCatches.map((item) => (
              <CatchCard
                key={item.id}
                item={item}
                onPreviewImage={() =>
                  item.imageUrl &&
                  setPreviewImage({
                    url: item.imageUrl,
                    alt: `Zdjęcie połowu: ${item.fishName}`,
                  })
                }
                onShare={() => setShareCatch(item)}
                onEdit={() => handleStartEdit(item)}
                onDelete={() => handleDeleteCatch(item.id)}
              />
            ))}
          </section>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredCatches.map((item) => (
                <CatchListItem
                  key={item.id}
                  item={item}
                  onPreviewImage={() =>
                    item.imageUrl &&
                    setPreviewImage({
                      url: item.imageUrl,
                      alt: `Zdjęcie połowu: ${item.fishName}`,
                    })
                  }
                  onShare={() => setShareCatch(item)}
                  onEdit={() => handleStartEdit(item)}
                  onDelete={() => handleDeleteCatch(item.id)}
                />
              ))}
            </div>
          </section>
        )
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            🎣
          </div>

          <p className="mt-5 text-xl font-extrabold text-slate-950">
            Brak połowów do wyświetlenia
          </p>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Dodaj pierwszy połów, żeby budować swój dziennik, statystyki i
            rekordy gatunków.
          </p>

          <button
            type="button"
            onClick={() => openCreateForm("quick")}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            + Dodaj pierwszy połów
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:ml-3 sm:w-auto"
            >
              Wyczyść filtry
            </button>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => openCreateForm("quick")}
        className="fixed bottom-24 right-4 z-[900] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl font-light leading-none text-white shadow-xl transition hover:bg-blue-700 md:hidden"
        aria-label="Dodaj połów"
      >
        +
      </button>

      {shareCatch && (
        <CatchShareDialog
          fishingCatch={shareCatch}
          onClose={() => setShareCatch(null)}
        />
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Zamknij podgląd zdjęcia"
            >
              ×
            </button>

            <img
              src={previewImage.url}
              alt={previewImage.alt}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}


function QuickCatchForm({
  form,
  selectedImage,
  lakes,
  trips,
  autoTripId,
  isLoading,
  onSubmit,
  onCancel,
  onSwitchToFull,
  onFieldChange,
  onImageChange,
  isMobile = false,
}: {
  form: CatchFormState;
  selectedImage: File | null;
  lakes: LakeOption[];
  trips: TripOption[];
  autoTripId: string | null;
  isLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onSwitchToFull: () => void;
  onFieldChange: <K extends keyof CatchFormState>(
    field: K,
    value: CatchFormState[K]
  ) => void;
  onImageChange: (file: File | null) => void;
  isMobile?: boolean;
}) {
  const selectedTrip =
    trips.find((trip) => trip.id === form.tripId) ?? null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isMobile && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                Szybki zapis
              </span>
            </div>

            <h2 className="mt-3 text-xl font-extrabold text-slate-950">
              ⚡ Szybki połów
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Zapisz najważniejsze dane. Data i godzina zostały ustawione
              automatycznie na moment rozpoczęcia wpisu.
            </p>
          </div>

          <button
            type="button"
            onClick={onSwitchToFull}
            disabled={isLoading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <FormIcon className="h-4 w-4 shrink-0" />
            <span>Pełny formularz</span>
          </button>
        </div>
      )}

      {isMobile && (
        <button
          type="button"
          onClick={onSwitchToFull}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <FormIcon className="h-4 w-4 shrink-0" />
          <span>Potrzebujesz więcej pól? Otwórz pełny formularz</span>
        </button>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
          Data połowu
        </p>
        <p className="mt-1 text-sm font-bold text-blue-950">
          {form.caughtAt
            ? formatDateTime(new Date(form.caughtAt).toISOString())
            : "Teraz"}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Select
          label="Gatunek ryby"
          value={form.fishName}
          onChange={(value) => onFieldChange("fishName", value)}
          options={[
            { label: "Wybierz gatunek", value: "" },
            ...fishSpecies,
          ]}
        />

        <Select
          label="Metoda"
          value={form.method}
          onChange={(value) => onFieldChange("method", value)}
          options={methods}
        />

        {form.fishName === "other" && (
          <div className="lg:col-span-2">
            <Input
              label="Wpisz gatunek"
              value={form.customFishName}
              onChange={(value) => onFieldChange("customFishName", value)}
              placeholder="np. inny gatunek"
              required
            />
          </div>
        )}

        <Input
          label="Waga w kg"
          value={form.weight}
          onChange={(value) => onFieldChange("weight", value)}
          placeholder="np. 3.25"
          type="number"
        />

        <Input
          label="Długość w cm"
          value={form.length}
          onChange={(value) => onFieldChange("length", value)}
          placeholder="np. 72"
          type="number"
        />
      </div>

      {selectedTrip && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-bold text-blue-900">
            {selectedTrip.id === autoTripId
              ? "✓ Automatycznie przypisano trwającą wyprawę"
              : "✓ Połów przypisany do wyprawy"}
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-700">
            {selectedTrip.title}
            {selectedTrip.lakeId
              ? " • łowisko oraz metoda zostały uzupełnione z wyprawy"
              : " • metoda została uzupełniona z wyprawy"}
          </p>
        </div>
      )}

      <LakeSearchSelect
        lakes={lakes}
        value={form.lakeId}
        onChange={(value) => onFieldChange("lakeId", value)}
      />

      {trips.length > 0 && (
        <Select
          label="Wyprawa (opcjonalnie)"
          value={form.tripId}
          onChange={(value) => onFieldChange("tripId", value)}
          options={[
            { label: "Bez przypisanej wyprawy", value: "" },
            ...trips.map((trip) => ({
              label: `${trip.title} — ${formatShortDate(trip.startsAt)}`,
              value: trip.id,
            })),
          ]}
        />
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Zdjęcie połowu (opcjonalnie)
        </label>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            onImageChange(file);
          }}
          className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />

        {selectedImage && (
          <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            Wybrane zdjęcie: {selectedImage.name}
          </p>
        )}
      </div>

      <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
        Szybki połów zapisuje wpis prywatnie. Ranking, przynętę, notatkę i
        dokładną datę możesz uzupełnić później przez „Edytuj”.
      </p>

      <div
        className={`flex gap-3 ${
          isMobile
            ? "sticky bottom-0 -mx-5 border-t border-slate-100 bg-white px-5 py-4"
            : "justify-end"
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          Anuluj
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          {isLoading ? "Zapisywanie..." : "Zapisz szybki połów"}
        </button>
      </div>
    </form>
  );
}

function CatchForm({
  form,
  editingCatchId,
  selectedImage,
  catches,
  lakes,
  trips,
  isLoading,
  onSubmit,
  onCancel,
  onFieldChange,
  onImageChange,
  isMobile = false,
}: {
  form: CatchFormState;
  editingCatchId: string | null;
  selectedImage: File | null;
  catches: FishingCatch[];
  lakes: LakeOption[];
  trips: TripOption[];
  isLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onFieldChange: <K extends keyof CatchFormState>(
    field: K,
    value: CatchFormState[K]
  ) => void;
  onImageChange: (file: File | null) => void;
  isMobile?: boolean;
}) {
  const currentEditedCatch = editingCatchId
    ? catches.find((item) => item.id === editingCatchId)
    : null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isMobile && (
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">
            {editingCatchId ? "Edytuj połów" : "Dodaj połów"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Uzupełnij dane połowu. Zdjęcie, łowisko oraz waga lub długość są
            wymagane tylko wtedy, gdy chcesz pokazać połów w rankingu.
          </p>
        </div>
      )}

      <FormGroup title="Podstawowe" description="Gatunek, metoda i data połowu.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Select
            label="Gatunek ryby"
            value={form.fishName}
            onChange={(value) => onFieldChange("fishName", value)}
            options={[
              { label: "Wybierz gatunek", value: "" },
              ...fishSpecies,
            ]}
          />

          {form.fishName === "other" && (
            <Input
              label="Wpisz gatunek"
              value={form.customFishName}
              onChange={(value) => onFieldChange("customFishName", value)}
              placeholder="np. inny gatunek"
              required
            />
          )}

          <Select
            label="Metoda"
            value={form.method}
            onChange={(value) => onFieldChange("method", value)}
            options={methods}
          />

          <Input
            label="Data i godzina połowu"
            value={form.caughtAt}
            onChange={(value) => onFieldChange("caughtAt", value)}
            type="datetime-local"
            required
          />
        </div>
      </FormGroup>

      <FormGroup title="Wynik" description="Waga, długość i przynęta.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Waga w kg"
            value={form.weight}
            onChange={(value) => onFieldChange("weight", value)}
            placeholder="np. 3.25"
            type="number"
          />

          <Input
            label="Długość w cm"
            value={form.length}
            onChange={(value) => onFieldChange("length", value)}
            placeholder="np. 72"
            type="number"
          />

          <Input
            label="Przynęta"
            value={form.bait}
            onChange={(value) => onFieldChange("bait", value)}
            placeholder="np. guma 10 cm / pellet 2 mm"
          />
        </div>
      </FormGroup>

      <FormGroup title="Miejsce" description="Przypisz łowisko lub wyprawę.">
        <div className="grid gap-5 lg:grid-cols-2">
          <LakeSearchSelect
            lakes={lakes}
            value={form.lakeId}
            onChange={(value) => onFieldChange("lakeId", value)}
          />

          <Select
            label="Wyprawa"
            value={form.tripId}
            onChange={(value) => onFieldChange("tripId", value)}
            options={[
              { label: "Bez przypisanej wyprawy", value: "" },
              ...trips.map((trip) => ({
                label: `${trip.title} — ${formatShortDate(trip.startsAt)}`,
                value: trip.id,
              })),
            ]}
          />
        </div>
      </FormGroup>

      <FormGroup
        title="Zdjęcie i ranking"
        description="Dodaj zdjęcie i zdecyduj, czy połów ma trafić do rankingu."
      >
        <label
          className={`mb-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
            form.isPublic
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(event) =>
              onFieldChange("isPublic", event.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
          />

          <span>
            <span
              className={`block text-sm font-bold ${
                form.isPublic ? "text-emerald-700" : "text-slate-700"
              }`}
            >
              Pokaż ten połów w rankingu łowiska
            </span>

            <span className="mt-1 block text-sm leading-6 text-slate-500">
              Do rankingu trafią tylko połowy z wybranym łowiskiem, zdjęciem
              oraz podaną wagą lub długością.
            </span>
          </span>
        </label>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Zdjęcie połowu
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              onImageChange(file);
            }}
            className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />

          <p className="mt-2 text-xs text-slate-500">
            Zdjęcie zostanie automatycznie zmniejszone i zapisane jako WebP.
          </p>

          {selectedImage && (
            <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              Wybrane zdjęcie: {selectedImage.name}
            </p>
          )}

          {editingCatchId && currentEditedCatch?.imageUrl && !selectedImage && (
            <div className="mt-3 overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={currentEditedCatch.imageUrl}
                alt="Aktualne zdjęcie połowu"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </div>
      </FormGroup>

      <FormGroup title="Notatka" description="Dodaj własne informacje o połowie.">
        <textarea
          value={form.note}
          onChange={(event) => onFieldChange("note", event.target.value)}
          rows={4}
          placeholder="np. Branie przy trzcinach, około 6:20 rano."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </FormGroup>

      <div
        className={`flex gap-3 ${
          isMobile
            ? "sticky bottom-0 -mx-5 border-t border-slate-100 bg-white px-5 py-4"
            : "justify-end"
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          Anuluj
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          {isLoading
            ? "Zapisywanie..."
            : editingCatchId
              ? "Zapisz zmiany"
              : "Dodaj połów"}
        </button>
      </div>
    </form>
  );
}

function CatchCard({
  item,
  onPreviewImage,
  onShare,
  onEdit,
  onDelete,
}: {
  item: FishingCatch;
  onPreviewImage: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {item.imageUrl && (
        <button
          type="button"
          onClick={onPreviewImage}
          className="mb-4 block w-full overflow-hidden rounded-2xl bg-slate-100 text-left"
        >
          <img
            src={item.imageUrl}
            alt={`Zdjęcie połowu: ${item.fishName}`}
            className="h-44 w-full object-cover transition duration-300 hover:scale-105 sm:h-40"
          />
        </button>
      )}

      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {getMethodLabel(item.method)}
          </p>

          <h2 className="mt-2 break-words text-xl font-bold text-slate-950">
            {item.fishName}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {formatDateTime(item.caughtAt)}
          </p>
        </div>

        
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {item.isPublic && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Ranking
          </span>
        )}

        {item.rankingStatus === "approved" && item.isPublic && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Zatwierdzony
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoTile
          label="Waga"
          value={item.weight ? `${item.weight.toFixed(2)} kg` : "Brak"}
        />

        <InfoTile
          label="Długość"
          value={item.length ? `${item.length.toFixed(0)} cm` : "Brak"}
        />

        <InfoTile label="Przynęta" value={item.bait || "Brak"} />

        <InfoTile label="Łowisko" value={item.lakeName || "Nie przypisano"} />

        <InfoTile label="Wyprawa" value={item.tripTitle || "Nie przypisano"} />
      </div>

      {item.note && (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {item.note}
        </p>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <button
          type="button"
          onClick={onShare}
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:py-2.5"
        >
          <CardsIcon className="h-4 w-4 shrink-0" />
          <span>Karta</span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 sm:py-2.5"
        >
          <PencilIcon className="h-4 w-4 shrink-0" />
          <span>Edytuj</span>
        </button>

        <div className="group relative shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
            aria-label="Usuń połów"
          >
            <TrashIcon className="h-5 w-5" />
          </button>

          <div
            className="
              pointer-events-none absolute bottom-full left-1/2 z-30 mb-2
              -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950
              px-2.5 py-1.5 text-[11px] font-semibold text-white
              opacity-0 shadow-lg transition group-hover:opacity-100
            "
          >
            Usuń
            <span
              className="
                absolute left-1/2 top-full -translate-x-1/2
                border-4 border-transparent border-t-slate-950
              "
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function CatchListItem({
  item,
  onPreviewImage,
  onShare,
  onEdit,
  onDelete,
}: {
  item: FishingCatch;
  onPreviewImage: () => void;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="grid gap-4 p-4 transition hover:bg-slate-50 xl:grid-cols-[90px_1fr_auto]">
      <div>
        {item.imageUrl ? (
          <button
            type="button"
            onClick={onPreviewImage}
            className="block h-20 w-20 overflow-hidden rounded-2xl bg-slate-100"
          >
            <img
              src={item.imageUrl}
              alt={`Zdjęcie połowu: ${item.fishName}`}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
          </button>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-xl">
            🎣
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {getMethodLabel(item.method)}
          </span>

          {item.lakeName && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {item.lakeName}
            </span>
          )}

          {item.tripTitle && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {item.tripTitle}
            </span>
          )}

          {item.isPublic && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ranking łowiska
            </span>
          )}
        </div>

        <h2 className="mt-2 text-xl font-bold text-slate-950">
          {item.fishName}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {formatDateTime(item.caughtAt)}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
          <span>
            Waga: {item.weight ? `${item.weight.toFixed(2)} kg` : "Brak"}
          </span>

          <span>
            Długość: {item.length ? `${item.length.toFixed(0)} cm` : "Brak"}
          </span>

          <span>Przynęta: {item.bait || "Brak"}</span>
        </div>

        {item.note && (
          <p className="mt-3 text-sm leading-6 text-slate-500">{item.note}</p>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-end gap-2">
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <CardsIcon className="h-4 w-4 shrink-0" />
          <span>Karta</span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          <PencilIcon className="h-4 w-4 shrink-0" />
          <span>Edytuj</span>
        </button>

        <div className="group relative shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
            aria-label="Usuń połów"
          >
            <TrashIcon className="h-4 w-4" />
          </button>

          <div
            className="
              pointer-events-none absolute bottom-full left-1/2 z-30 mb-2
              -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950
              px-2.5 py-1.5 text-[11px] font-semibold text-white
              opacity-0 shadow-lg transition group-hover:opacity-100
            "
          >
            Usuń
            <span
              className="
                absolute left-1/2 top-full -translate-x-1/2
                border-4 border-transparent border-t-slate-950
              "
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function FormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[170px] max-w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-0 md:p-5">
      <p className="break-words text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
        {value}
      </p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? 0 : undefined}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}


function LakeSearchSelect({
  lakes,
  value,
  onChange,
}: {
  lakes: LakeOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedLake = lakes.find((lake) => lake.id === value) ?? null;
  const [query, setQuery] = useState(
    selectedLake ? formatLakeSearchLabel(selectedLake) : ""
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const currentLake = lakes.find((lake) => lake.id === value) ?? null;
    setQuery(currentLake ? formatLakeSearchLabel(currentLake) : "");
  }, [value, lakes]);

  const filteredLakes = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return lakes.slice(0, 12);
    }

    return lakes
      .filter((lake) => {
        const searchableText = normalizeSearchText(
          `${lake.name} ${lake.city} ${lake.voivodeship}`
        );

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [lakes, query]);

  function handleInputChange(nextValue: string) {
    setQuery(nextValue);
    setIsOpen(true);

    if (value) {
      onChange("");
    }
  }

  function handleSelect(lake: LakeOption) {
    onChange(lake.id);
    setQuery(formatLakeSearchLabel(lake));
    setIsOpen(false);
  }

  function handleClear() {
    onChange("");
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Łowisko
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
          ⌕
        </span>

        <input
          type="text"
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="Wpisz nazwę łowiska, miasto lub województwo..."
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white py-0 pl-11 pr-12 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />

        {(query || value) && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-lg font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Wyczyść wybrane łowisko"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[76px] z-[1500] max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-500 transition hover:bg-slate-50"
          >
            Bez przypisanego łowiska
          </button>

          <div className="my-2 border-t border-slate-100" />

          {filteredLakes.length > 0 ? (
            <div className="space-y-1">
              {filteredLakes.map((lake) => {
                const isSelected = lake.id === value;

                return (
                  <button
                    key={lake.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(lake)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition ${
                      isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-bold ${
                          isSelected ? "text-blue-700" : "text-slate-900"
                        }`}
                      >
                        {lake.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {lake.city}, woj. {lake.voivodeship}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        Wybrane
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-bold text-slate-700">
                Nie znaleziono łowiska
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Spróbuj wpisać krótszą nazwę albo nazwę miejscowości.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedLake && (
        <p className="mt-2 text-xs font-semibold text-blue-600">
          Wybrano: {selectedLake.name} • {selectedLake.city}
        </p>
      )}
    </div>
  );
}

function formatLakeSearchLabel(lake: LakeOption) {
  return `${lake.name} — ${lake.city}`;
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

async function compressImage(file: File): Promise<File> {
  const maxWidth = 1600;
  const maxHeight = 1600;
  const quality = 0.75;

  const imageBitmap = await createImageBitmap(file);

  let width = imageBitmap.width;
  let height = imageBitmap.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);

    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nie udało się przygotować kompresji zdjęcia.");
  }

  context.drawImage(imageBitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Nie udało się skompresować zdjęcia."));
          return;
        }

        resolve(result);
      },
      "image/webp",
      quality
    );
  });

  const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${fileNameWithoutExtension}.webp`, {
    type: "image/webp",
  });
}

function getMethodFromTripType(tripType?: string | null) {
  if (!tripType) {
    return null;
  }

  const normalized = tripType.trim().toLowerCase();

  const aliases: Record<string, string> = {
    spinning: "spinning",
    feeder: "feeder",
    method_feeder: "method_feeder",
    "method feeder": "method_feeder",
    method: "method_feeder",
    carp: "carp",
    karpiowa: "carp",
    karpiowka: "carp",
    "karpiówka": "carp",
    float: "float",
    splawik: "float",
    "spławik": "float",
    fly: "fly",
    muchowka: "fly",
    "muchówka": "fly",
  };

  return aliases[normalized] ?? null;
}

function getMethodLabel(value: string) {
  return methods.find((item) => item.value === value)?.label || value;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}

function toDateTimeLocalValue(date: string) {
  const parsedDate = new Date(date);

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}