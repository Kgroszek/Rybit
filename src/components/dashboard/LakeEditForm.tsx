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
};

type LakeEditFormProps = {
  lake: LakeEditFormState;
};

export function LakeEditForm({ lake }: LakeEditFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<LakeEditFormState>(lake);
  const [isLoading, setIsLoading] = useState(false);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/admin/lakes/${form.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
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