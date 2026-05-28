"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LakeEditFormState = {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerType: string;
  fishingType: string;
  fish: string;
  lat: string;
  lng: string;
  street: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  area: string;
  averageDepth: string;
  bottomType: string;
  waterType: string;

  priceListText: string;
  priceListUrl: string;
  rulesText: string;
  rulesUrl: string;

  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;

  gearRental: boolean;
  shelter: boolean;
  coveredSpots: boolean;
  playground: boolean;
  cardPayment: boolean;

  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;

  images: {
    id: string;
    url: string;
  }[];
};

type LakeEditFormProps = {
  lake: LakeEditFormState;
};

export function LakeEditForm({ lake }: LakeEditFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<LakeEditFormState>({
    ...lake,
    contactEmail: lake.contactEmail === "Brak danych" ? "" : lake.contactEmail,
    contactWebsite:
      lake.contactWebsite === "Brak danych" ? "" : lake.contactWebsite,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [message, setMessage] = useState("");

  function updateField<K extends keyof LakeEditFormState>(
    field: K,
    value: LakeEditFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleUploadImages() {
    if (selectedImages.length === 0) {
      setMessage("Wybierz przynajmniej jedno zdjęcie.");
      return;
    }

    setIsUploadingImages(true);
    setMessage("");

    const formData = new FormData();

    selectedImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch(`/api/admin/lake-images/${form.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Nie udało się dodać zdjęć.");
        setIsUploadingImages(false);
        return;
      }

      setForm((current) => ({
        ...current,
        images: [...data.images, ...current.images],
      }));

      setSelectedImages([]);
      setMessage("Zdjęcia zostały dodane.");
    } catch {
      setMessage("Nie udało się dodać zdjęć.");
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    const confirmed = confirm(
      "Czy na pewno chcesz usunąć to zdjęcie z łowiska?"
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/lake-images/${imageId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Nie udało się usunąć zdjęcia.");
      return;
    }

    setForm((current) => ({
      ...current,
      images: current.images.filter((currentImage) => currentImage.id !== imageId),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const payload = {
      ...form,
      contactEmail:
        form.contactEmail === "Brak danych" ? "" : form.contactEmail.trim(),
      contactWebsite:
        form.contactWebsite === "Brak danych" ? "" : form.contactWebsite.trim(),
    };

    const response = await fetch(`/api/admin/lakes/${form.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Nie udało się zapisać zmian.");
      setIsLoading(false);
      return;
    }

    setMessage("Zmiany zostały zapisane.");
    setIsLoading(false);

    setTimeout(() => {
      router.push(`/lowiska/${data.lake.slug}`);
      router.refresh();
    }, 800);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm font-semibold text-blue-700">
          {message}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Podstawowe informacje
        </h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Input
            label="Nazwa łowiska"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            required
          />

          <Input
            label="Występujące ryby"
            value={form.fish}
            onChange={(value) => updateField("fish", value)}
            placeholder="np. Karp, Szczupak, Okoń"
            required
          />

          <Select
            label="Rodzaj łowiska"
            value={form.ownerType}
            onChange={(value) => updateField("ownerType", value)}
            options={[
              { label: "PZW", value: "pzw" },
              { label: "Komercyjne", value: "commercial" },
            ]}
          />

          <Select
            label="Typ łowienia"
            value={form.fishingType}
            onChange={(value) => updateField("fishingType", value)}
            options={[
              { label: "Ogólne", value: "general" },
              { label: "Spinningowe", value: "spinning" },
              { label: "Karpiowe", value: "carp" },
            ]}
          />
        </div>

        <div className="mt-5">
          <Textarea
            label="Opis łowiska"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            rows={5}
            required
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Adres i lokalizacja</h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Input
            label="Ulica / miejsce"
            value={form.street}
            onChange={(value) => updateField("street", value)}
            required
          />

          <Input
            label="Miejscowość"
            value={form.city}
            onChange={(value) => updateField("city", value)}
            required
          />

          <Input
            label="Kod pocztowy"
            value={form.postalCode}
            onChange={(value) => updateField("postalCode", value)}
            required
          />

          <Input
            label="Województwo"
            value={form.voivodeship}
            onChange={(value) => updateField("voivodeship", value)}
            required
          />

          <Input
            label="Szerokość geograficzna"
            value={form.lat}
            onChange={(value) => updateField("lat", value)}
            required
          />

          <Input
            label="Długość geograficzna"
            value={form.lng}
            onChange={(value) => updateField("lng", value)}
            required
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Informacje o łowisku
        </h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Input
            label="Powierzchnia"
            value={form.area}
            onChange={(value) => updateField("area", value)}
          />

          <Input
            label="Średnia głębokość"
            value={form.averageDepth}
            onChange={(value) => updateField("averageDepth", value)}
          />

          <Input
            label="Rodzaj dna"
            value={form.bottomType}
            onChange={(value) => updateField("bottomType", value)}
          />

          <Input
            label="Typ wody"
            value={form.waterType}
            onChange={(value) => updateField("waterType", value)}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Cennik i regulamin
        </h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Textarea
            label="Cennik"
            value={form.priceListText}
            onChange={(value) => updateField("priceListText", value)}
            rows={5}
            placeholder="Każda pozycja w osobnej linii"
          />

          <Input
            label="Link do cennika"
            value={form.priceListUrl}
            onChange={(value) => updateField("priceListUrl", value)}
            type="url"
          />

          <Textarea
            label="Regulamin"
            value={form.rulesText}
            onChange={(value) => updateField("rulesText", value)}
            rows={5}
            placeholder="Każda zasada w osobnej linii"
          />

          <Input
            label="Link do regulaminu"
            value={form.rulesUrl}
            onChange={(value) => updateField("rulesUrl", value)}
            type="url"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Udogodnienia</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Checkbox
            label="Domki"
            checked={form.cottages}
            onChange={(value) => updateField("cottages", value)}
          />

          <Checkbox
            label="Ognisko"
            checked={form.campfire}
            onChange={(value) => updateField("campfire", value)}
          />

          <Checkbox
            label="No Kill"
            checked={form.noKill}
            onChange={(value) => updateField("noKill", value)}
          />

          <Checkbox
            label="Namiot"
            checked={form.tent}
            onChange={(value) => updateField("tent", value)}
          />

          <Checkbox
            label="Parking"
            checked={form.parking}
            onChange={(value) => updateField("parking", value)}
          />

          <Checkbox
            label="Pomost"
            checked={form.pier}
            onChange={(value) => updateField("pier", value)}
          />

          <Checkbox
            label="Toaleta"
            checked={form.toilet}
            onChange={(value) => updateField("toilet", value)}
          />

          <Checkbox
            label="Sklep"
            checked={form.shop}
            onChange={(value) => updateField("shop", value)}
          />

          <Checkbox
            label="Wędkowanie nocne"
            checked={form.nightFishing}
            onChange={(value) => updateField("nightFishing", value)}
          />

          <Checkbox
            label="Wypożyczalnia łodzi"
            checked={form.boatRental}
            onChange={(value) => updateField("boatRental", value)}
          />

          <Checkbox
            label="Wypożyczalnia sprzętu"
            checked={form.gearRental}
            onChange={(value) => updateField("gearRental", value)}
          />

          <Checkbox
            label="Altana"
            checked={form.shelter}
            onChange={(value) => updateField("shelter", value)}
          />

          <Checkbox
            label="Zadaszone stanowiska"
            checked={form.coveredSpots}
            onChange={(value) => updateField("coveredSpots", value)}
          />

          <Checkbox
            label="Plac zabaw"
            checked={form.playground}
            onChange={(value) => updateField("playground", value)}
          />

          <Checkbox
            label="Płatność kartą"
            checked={form.cardPayment}
            onChange={(value) => updateField("cardPayment", value)}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Kontakt z łowiskiem</h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Input
            label="Nazwa kontaktowa"
            value={form.contactName}
            onChange={(value) => updateField("contactName", value)}
          />

          <Input
            label="Telefon"
            value={form.contactPhone}
            onChange={(value) => updateField("contactPhone", value)}
          />

          <Input
            label="E-mail"
            value={form.contactEmail}
            onChange={(value) => updateField("contactEmail", value)}
            type="email"
          />

          <Input
            label="Strona internetowa"
            value={form.contactWebsite}
            onChange={(value) => updateField("contactWebsite", value)}
            type="url"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Zdjęcia łowiska
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Dodaj nowe zdjęcia lub usuń te, które nie powinny być widoczne na
              publicznej stronie łowiska.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {form.images.length} zdjęć
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              setSelectedImages(files);
            }}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
          />

          {selectedImages.length > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              Wybrano zdjęć: {selectedImages.length}
            </p>
          )}

          <button
            type="button"
            onClick={handleUploadImages}
            disabled={isUploadingImages || selectedImages.length === 0}
            className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploadingImages ? "Dodawanie zdjęć..." : "Dodaj zdjęcia"}
          </button>
        </div>

        {form.images.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {form.images.map((image) => (
              <div
                key={image.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
              >
                <a href={image.url} target="_blank" rel="noreferrer">
                  <img
                    src={image.url}
                    alt={form.name}
                    className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </a>

                <div className="p-3">
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Usuń zdjęcie
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            To łowisko nie ma jeszcze dodanych zdjęć.
          </p>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push(`/lowiska/${form.slug}`)}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Anuluj
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </form>
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
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        type={type}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
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
  options: {
    label: string;
    value: string;
  }[];
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600"
      />

      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}