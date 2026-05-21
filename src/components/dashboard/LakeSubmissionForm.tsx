"use client";

import { useMemo, useRef, useState } from "react";
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

type FormErrors = Partial<Record<keyof FormState, string>>;

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

const VOIVODESHIPS = [
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie",
];

const REQUIRED_FIELDS: {
  key: keyof FormState;
  label: string;
}[] = [
  { key: "name", label: "Nazwa łowiska" },
  { key: "fish", label: "Ryby występujące na łowisku" },
  { key: "description", label: "Opis łowiska" },
  { key: "street", label: "Ulica / miejsce" },
  { key: "city", label: "Miejscowość" },
  { key: "postalCode", label: "Kod pocztowy" },
  { key: "voivodeship", label: "Województwo" },
  { key: "lat", label: "Szerokość geograficzna" },
  { key: "lng", label: "Długość geograficzna" },
];

export function LakeSubmissionForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const imagePreviews = useMemo(() => {
    return images.map((image) => ({
      file: image,
      url: URL.createObjectURL(image),
    }));
  }, [images]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      const value = form[field.key];

      if (typeof value === "string" && value.trim().length === 0) {
        nextErrors[field.key] = `Pole "${field.label}" jest wymagane.`;
      }
    });

    const latitude = Number(form.lat.replace(",", "."));
    const longitude = Number(form.lng.replace(",", "."));

    if (form.lat.trim() && Number.isNaN(latitude)) {
      nextErrors.lat = "Szerokość geograficzna musi być liczbą.";
    }

    if (form.lng.trim() && Number.isNaN(longitude)) {
      nextErrors.lng = "Długość geograficzna musi być liczbą.";
    }

    if (
      form.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())
    ) {
      nextErrors.contactEmail = "Podaj poprawny adres e-mail.";
    }

    if (
      form.priceListUrl.trim() &&
      !form.priceListUrl.startsWith("http://") &&
      !form.priceListUrl.startsWith("https://")
    ) {
      nextErrors.priceListUrl = "Link powinien zaczynać się od http:// lub https://.";
    }

    if (
      form.rulesUrl.trim() &&
      !form.rulesUrl.startsWith("http://") &&
      !form.rulesUrl.startsWith("https://")
    ) {
      nextErrors.rulesUrl = "Link powinien zaczynać się od http:// lub https://.";
    }

    if (
      form.contactWebsite.trim() &&
      !form.contactWebsite.startsWith("http://") &&
      !form.contactWebsite.startsWith("https://")
    ) {
      nextErrors.contactWebsite =
        "Link powinien zaczynać się od http:// lub https://.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function scrollToFirstError() {
    window.setTimeout(() => {
      const firstError = document.querySelector("[data-field-error='true']");

      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 50);
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

    setMessage("");

    const isValid = validateForm();

    if (!isValid) {
      setMessage("Uzupełnij wymagane pola oznaczone na czerwono.");
      scrollToFirstError();
      return;
    }

    setIsLoading(true);

    const submitStartedAt = performance.now();

    try {
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

      const requestTime = Math.round(performance.now() - submitStartedAt);
      console.info(`[LakeSubmissionForm] Czas wysyłki: ${requestTime} ms`);

      let data: { message?: string } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMessage(data.message || "Nie udało się wysłać zgłoszenia.");
        return;
      }

      setSuccessModalOpen(true);
      setForm(initialFormState);
      setImages([]);
      setErrors({});
      formRef.current?.reset();
    } catch (error) {
      console.error("[LakeSubmissionForm] Błąd wysyłki:", error);
      setMessage(
        "Wystąpił problem podczas wysyłania formularza. Spróbuj ponownie."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function closeSuccessModal() {
    setSuccessModalOpen(false);
    router.push("/lowiska");
    router.refresh();
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
        {message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              Object.keys(errors).length > 0
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {message}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Podstawowe informacje"
            description="Podaj najważniejsze dane, które pozwolą zweryfikować łowisko."
          />

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Input
              label="Nazwa łowiska"
              value={form.name}
              onChange={(value) => updateField("name", value)}
              placeholder="np. Jezioro Ukiel"
              required
              error={errors.name}
            />

            <Input
              label="Ryby występujące na łowisku"
              value={form.fish}
              onChange={(value) => updateField("fish", value)}
              placeholder="np. Karp, Szczupak, Okoń"
              required
              error={errors.fish}
            />

            <Select
              label="Typ łowiska"
              value={form.ownerType}
              onChange={(value) => updateField("ownerType", value)}
              options={[
                { label: "PZW", value: "pzw" },
                { label: "Komercyjne", value: "commercial" },
              ]}
            />

            <Select
              label="Rodzaj łowienia"
              value={form.fishingType}
              onChange={(value) => updateField("fishingType", value)}
              options={[
                { label: "Ogólne", value: "general" },
                { label: "Spinningowe", value: "spinning" },
                { label: "Karpiowe", value: "carp" },
              ]}
            />

            <div className="lg:col-span-2">
              <Textarea
                label="Opis łowiska"
                value={form.description}
                onChange={(value) => updateField("description", value)}
                required
                rows={5}
                placeholder="Opisz łowisko, dostęp, charakter miejsca, najważniejsze informacje..."
                error={errors.description}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Adres i lokalizacja"
            description="Wybierz województwo z listy i podaj dokładną lokalizację łowiska."
          />

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Input
              label="Ulica / miejsce"
              value={form.street}
              onChange={(value) => updateField("street", value)}
              placeholder="np. ul. Jeziorna 12"
              required
              error={errors.street}
            />

            <Input
              label="Miejscowość"
              value={form.city}
              onChange={(value) => updateField("city", value)}
              placeholder="np. Olsztyn"
              required
              error={errors.city}
            />

            <Input
              label="Kod pocztowy"
              value={form.postalCode}
              onChange={(value) => updateField("postalCode", value)}
              placeholder="np. 10-900"
              required
              error={errors.postalCode}
            />

            <Select
              label="Województwo"
              value={form.voivodeship}
              onChange={(value) => updateField("voivodeship", value)}
              required
              placeholder="Wybierz województwo"
              error={errors.voivodeship}
              options={VOIVODESHIPS.map((voivodeship) => ({
                label: voivodeship,
                value: voivodeship,
              }))}
            />

            <Input
              label="Szerokość geograficzna"
              value={form.lat}
              onChange={(value) => updateField("lat", value)}
              placeholder="np. 53.7856"
              required
              error={errors.lat}
            />

            <Input
              label="Długość geograficzna"
              value={form.lng}
              onChange={(value) => updateField("lng", value)}
              placeholder="np. 20.4031"
              required
              error={errors.lng}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Informacje o łowisku"
            description="Te pola nie są obowiązkowe, ale pomagają lepiej opisać miejsce."
          />

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
          <SectionHeader
            title="Cennik i regulamin"
            description="Możesz wkleić treść albo podać link do zewnętrznej strony."
          />

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
              error={errors.priceListUrl}
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
              error={errors.rulesUrl}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Udogodnienia"
            description="Zaznacz elementy dostępne na łowisku."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Checkbox label="Domki" checked={form.cottages} onChange={(value) => updateField("cottages", value)} />
            <Checkbox label="Ognisko" checked={form.campfire} onChange={(value) => updateField("campfire", value)} />
            <Checkbox label="No Kill" checked={form.noKill} onChange={(value) => updateField("noKill", value)} />
            <Checkbox label="Namiot" checked={form.tent} onChange={(value) => updateField("tent", value)} />
            <Checkbox label="Parking" checked={form.parking} onChange={(value) => updateField("parking", value)} />
            <Checkbox label="Pomost" checked={form.pier} onChange={(value) => updateField("pier", value)} />
            <Checkbox label="Toaleta" checked={form.toilet} onChange={(value) => updateField("toilet", value)} />
            <Checkbox label="Sklep" checked={form.shop} onChange={(value) => updateField("shop", value)} />
            <Checkbox label="Wędkowanie nocne" checked={form.nightFishing} onChange={(value) => updateField("nightFishing", value)} />
            <Checkbox label="Wypożyczalnia łodzi" checked={form.boatRental} onChange={(value) => updateField("boatRental", value)} />
            <Checkbox label="Wypożyczalnia sprzętu" checked={form.gearRental} onChange={(value) => updateField("gearRental", value)} />
            <Checkbox label="Altana" checked={form.shelter} onChange={(value) => updateField("shelter", value)} />
            <Checkbox label="Zadaszone stanowiska" checked={form.coveredSpots} onChange={(value) => updateField("coveredSpots", value)} />
            <Checkbox label="Plac zabaw" checked={form.playground} onChange={(value) => updateField("playground", value)} />
            <Checkbox label="Płatność kartą" checked={form.cardPayment} onChange={(value) => updateField("cardPayment", value)} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title="Zdjęcia łowiska"
            description={`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć. Jedno zdjęcie może mieć maksymalnie 5 MB.`}
          />

          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <label className="block cursor-pointer rounded-2xl bg-white px-5 py-6 text-center transition hover:bg-slate-100">
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isLoading}
                onChange={(event) => handleImagesChange(event.target.files)}
                className="hidden"
              />

              <span className="text-sm font-bold text-blue-600">
                Kliknij, aby dodać zdjęcia
              </span>

              <p className="mt-2 text-sm text-slate-500">
                Przy większej liczbie zdjęć wysyłka może potrwać dłużej.
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
                    disabled={isLoading}
                    className="text-sm font-semibold text-red-500 transition hover:text-red-600 disabled:opacity-50"
                  >
                    Usuń wszystkie
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {imagePreviews.map((imagePreview, index) => (
                    <div
                      key={`${imagePreview.file.name}-${index}`}
                      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <img
                        src={imagePreview.url}
                        alt={imagePreview.file.name}
                        className="h-32 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isLoading}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-red-500 shadow-sm transition hover:bg-white disabled:opacity-50"
                        aria-label="Usuń zdjęcie"
                      >
                        ×
                      </button>

                      <div className="p-3">
                        <p className="truncate text-xs font-semibold text-slate-600">
                          {imagePreview.file.name}
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
          <SectionHeader
            title="Kontakt z łowiskiem"
            description="Dane kontaktowe nie są obowiązkowe, ale pomagają użytkownikom znaleźć więcej informacji."
          />

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
              error={errors.contactEmail}
            />

            <Input
              label="Strona internetowa"
              value={form.contactWebsite}
              onChange={(value) => updateField("contactWebsite", value)}
              placeholder="https://example.pl"
              type="url"
              error={errors.contactWebsite}
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/lowiska")}
            disabled={isLoading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anuluj
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Wysyłanie zgłoszenia..." : "Wyślij zgłoszenie"}
          </button>
        </div>
      </form>

      {successModalOpen && <SuccessModal onClose={closeSuccessModal} />}
    </>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>

      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
  );
}

function RequiredMark() {
  return <span className="ml-1 text-red-500">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-semibold text-red-600">{message}</p>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?: string;
}) {
  return (
    <div data-field-error={Boolean(error)}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <RequiredMark />}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        placeholder={placeholder}
        type={type}
        className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
      />

      <FieldError message={error} />
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
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
}) {
  return (
    <div data-field-error={Boolean(error)}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <RequiredMark />}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
      />

      <FieldError message={error} />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
  }[];
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div data-field-error={Boolean(error)}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <RequiredMark />}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none transition focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-50"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
        }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <FieldError message={error} />
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
        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
      />

      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
          ✓
        </div>

        <h2 className="mt-5 text-center text-xl font-bold text-slate-950">
          Zgłoszenie zostało wysłane
        </h2>

        <p className="mt-3 text-center text-sm leading-6 text-slate-500">
          Dziękujemy za dodanie łowiska. Zgłoszenie trafiło do weryfikacji
          administratora. Łowisko pojawi się na mapie po akceptacji.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Rozumiem
        </button>
      </div>
    </div>
  );
}