"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  name: string;
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
};

const initialFormState: FormState = {
  name: "",
  description: "",
  ownerType: "pzw",
  fishingType: "general",
  fish: "",
  lat: "",
  lng: "",
  street: "",
  city: "",
  postalCode: "",
  voivodeship: "",
  area: "",
  averageDepth: "",
  bottomType: "",
  waterType: "",

  priceListText: "",
  priceListUrl: "",
  rulesText: "",
  rulesUrl: "",

  cottages: false,
  campfire: false,
  noKill: false,
  tent: false,
  parking: false,
  pier: false,
  toilet: false,
  shop: false,
  nightFishing: false,
  boatRental: false,

  gearRental: false,
  shelter: false,
  coveredSpots: false,
  playground: false,
  cardPayment: false,

  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactWebsite: "",
};

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function LakeSubmissionForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImagesChange(files: FileList | null) {
    if (!files) {
      return;
    }

    setMessage("");

    const selectedFiles = Array.from(files);

    const validImages = selectedFiles.filter((file) => {
      return file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE;
    });

    const nextImages = [...images, ...validImages].slice(0, MAX_IMAGES);

    setImages(nextImages);

    if (selectedFiles.length !== validImages.length) {
      setMessage(
        "Niektóre pliki zostały pominięte. Zdjęcia muszą być obrazami i mieć maksymalnie 5 MB."
      );
    }

    if (images.length + validImages.length > MAX_IMAGES) {
      setMessage(`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć.`);
    }
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await fetch("/api/lake-submissions", {
      method: "POST",
      body: formData,
    });

    let data: { message?: string } = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      setMessage(data.message || "Nie udało się wysłać zgłoszenia.");
      setIsLoading(false);
      return;
    }

    setMessage(
      "Zgłoszenie zostało wysłane. Łowisko pojawi się na mapie po akceptacji administratora."
    );

    setIsLoading(false);

    setTimeout(() => {
      router.push("/lowiska");
      router.refresh();
    }, 1500);
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
            placeholder="np. Jezioro Ukiel"
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
            required
            rows={5}
            placeholder="Opisz łowisko, dostęp, charakter miejsca, najważniejsze informacje..."
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
            placeholder="np. ul. Jeziorna 12"
            required
          />

          <Input
            label="Miejscowość"
            value={form.city}
            onChange={(value) => updateField("city", value)}
            placeholder="np. Olsztyn"
            required
          />

          <Input
            label="Kod pocztowy"
            value={form.postalCode}
            onChange={(value) => updateField("postalCode", value)}
            placeholder="np. 10-900"
            required
          />

          <Input
            label="Województwo"
            value={form.voivodeship}
            onChange={(value) => updateField("voivodeship", value)}
            placeholder="np. warmińsko-mazurskie"
            required
          />

          <Input
            label="Szerokość geograficzna"
            value={form.lat}
            onChange={(value) => updateField("lat", value)}
            placeholder="np. 53.7856"
            required
          />

          <Input
            label="Długość geograficzna"
            value={form.lng}
            onChange={(value) => updateField("lng", value)}
            placeholder="np. 20.4031"
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
            placeholder="np. 7 ha"
          />

          <Input
            label="Średnia głębokość"
            value={form.averageDepth}
            onChange={(value) => updateField("averageDepth", value)}
            placeholder="np. 2,8 m"
          />

          <Input
            label="Rodzaj dna"
            value={form.bottomType}
            onChange={(value) => updateField("bottomType", value)}
            placeholder="np. muliste"
          />

          <Input
            label="Typ wody"
            value={form.waterType}
            onChange={(value) => updateField("waterType", value)}
            placeholder="np. staw / jezioro / rzeka"
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
            placeholder="np. Wędkowanie dzienne: 40 zł, nocka: 80 zł..."
            rows={5}
          />

          <Input
            label="Link do cennika"
            value={form.priceListUrl}
            onChange={(value) => updateField("priceListUrl", value)}
            placeholder="https://example.pl/cennik"
            type="url"
          />

          <Textarea
            label="Regulamin"
            value={form.rulesText}
            onChange={(value) => updateField("rulesText", value)}
            placeholder="np. Mata obowiązkowa, zakaz używania plecionki..."
            rows={5}
          />

          <Input
            label="Link do regulaminu"
            value={form.rulesUrl}
            onChange={(value) => updateField("rulesUrl", value)}
            placeholder="https://example.pl/regulamin"
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
        <h2 className="text-xl font-bold text-slate-950">Zdjęcia łowiska</h2>

        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <label className="block cursor-pointer rounded-2xl bg-white px-5 py-6 text-center transition hover:bg-slate-100">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handleImagesChange(event.target.files)}
              className="hidden"
            />

            <span className="text-sm font-bold text-blue-600">
              Kliknij, aby dodać zdjęcia
            </span>

            <p className="mt-2 text-sm text-slate-500">
              Możesz dodać maksymalnie {MAX_IMAGES} zdjęć. Jedno zdjęcie może
              mieć maksymalnie 5 MB.
            </p>
          </label>

          {images.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">
                  Dodane zdjęcia: {images.length}/{MAX_IMAGES}
                </p>

                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="text-sm font-semibold text-red-500 transition hover:text-red-600"
                >
                  Usuń wszystkie
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="h-32 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-red-500 shadow-sm transition hover:bg-white"
                      aria-label="Usuń zdjęcie"
                    >
                      ×
                    </button>

                    <div className="p-3">
                      <p className="truncate text-xs font-semibold text-slate-600">
                        {image.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Kontakt z łowiskiem</h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Input
            label="Nazwa kontaktowa"
            value={form.contactName}
            onChange={(value) => updateField("contactName", value)}
            placeholder="np. Łowisko Karp Max"
          />

          <Input
            label="Telefon"
            value={form.contactPhone}
            onChange={(value) => updateField("contactPhone", value)}
            placeholder="+48 000 000 000"
          />

          <Input
            label="E-mail"
            value={form.contactEmail}
            onChange={(value) => updateField("contactEmail", value)}
            placeholder="kontakt@example.pl"
            type="email"
          />

          <Input
            label="Strona internetowa"
            value={form.contactWebsite}
            onChange={(value) => updateField("contactWebsite", value)}
            placeholder="https://example.pl"
            type="url"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/lowiska")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Anuluj
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Wysyłanie..." : "Wyślij zgłoszenie"}
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