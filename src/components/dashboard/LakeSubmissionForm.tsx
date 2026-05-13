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
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactWebsite: "",
};

export function LakeSubmissionForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/lake-submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

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
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Opis łowiska
          </label>

          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            required
            rows={5}
            placeholder="Opisz łowisko, dostęp, charakter miejsca, najważniejsze informacje..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
          />

          <Input
            label="Strona internetowa"
            value={form.contactWebsite}
            onChange={(value) => updateField("contactWebsite", value)}
            placeholder="https://example.pl"
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
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
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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