"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type StepKey =
  | "basic"
  | "location"
  | "details"
  | "amenities"
  | "photos"
  | "contact";

type Step = {
  key: StepKey;
  title: string;
  shortTitle: string;
  description: string;
};

type ApiResponse = {
  message?: string;
};

const steps: Step[] = [
  {
    key: "basic",
    title: "Podstawowe informacje",
    shortTitle: "Dane",
    description: "Podaj nazwę, opis, typ łowiska oraz ryby.",
  },
  {
    key: "location",
    title: "Adres i lokalizacja",
    shortTitle: "Lokalizacja",
    description: "Uzupełnij adres oraz współrzędne łowiska.",
  },
  {
    key: "details",
    title: "Informacje o łowisku",
    shortTitle: "Opis",
    description: "Dodaj dodatkowe dane, cennik i regulamin.",
  },
  {
    key: "amenities",
    title: "Udogodnienia",
    shortTitle: "Udogodnienia",
    description: "Zaznacz elementy dostępne na łowisku.",
  },
  {
    key: "photos",
    title: "Zdjęcia łowiska",
    shortTitle: "Zdjęcia",
    description: "Dodaj zdjęcia, które pomogą ocenić zgłoszenie.",
  },
  {
    key: "contact",
    title: "Kontakt z łowiskiem",
    shortTitle: "Kontakt",
    description: "Dodaj dane kontaktowe i wyślij zgłoszenie.",
  },
];

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
const MAX_IMAGE_DIMENSION = 1600;
const COMPRESSED_IMAGE_QUALITY = 0.82;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const HEIC_EXTENSIONS = [".heic", ".heif"];

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

const STEP_FIELDS: Record<StepKey, (keyof FormState)[]> = {
  basic: ["name", "fish", "description", "ownerType", "fishingType"],
  location: ["street", "city", "postalCode", "voivodeship", "lat", "lng"],
  details: [
    "area",
    "averageDepth",
    "bottomType",
    "waterType",
    "priceListText",
    "priceListUrl",
    "rulesText",
    "rulesUrl",
  ],
  amenities: [
    "cottages",
    "campfire",
    "noKill",
    "tent",
    "parking",
    "pier",
    "toilet",
    "shop",
    "nightFishing",
    "boatRental",
    "gearRental",
    "shelter",
    "coveredSpots",
    "playground",
    "cardPayment",
  ],
  photos: [],
  contact: ["contactName", "contactPhone", "contactEmail", "contactWebsite"],
};

const REQUIRED_FIELDS: {
  key: keyof FormState;
  label: string;
  step: StepKey;
}[] = [
  { key: "name", label: "Nazwa łowiska", step: "basic" },
  { key: "fish", label: "Ryby występujące na łowisku", step: "basic" },
  { key: "description", label: "Opis łowiska", step: "basic" },
  { key: "street", label: "Ulica / miejsce", step: "location" },
  { key: "city", label: "Miejscowość", step: "location" },
  { key: "postalCode", label: "Kod pocztowy", step: "location" },
  { key: "voivodeship", label: "Województwo", step: "location" },
  { key: "lat", label: "Szerokość geograficzna", step: "location" },
  { key: "lng", label: "Długość geograficzna", step: "location" },
];

function isHeicFile(file: File) {
  const fileName = file.name.toLowerCase();

  return (
    HEIC_EXTENSIONS.some((extension) => fileName.endsWith(extension)) ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

function isAllowedImageFile(file: File) {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

function createImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Nie udało się odczytać zdjęcia."));
    };

    image.src = imageUrl;
  });
}

function getResizedDimensions(width: number, height: number) {
  if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
    return {
      width,
      height,
    };
  }

  const ratio = Math.min(
    MAX_IMAGE_DIMENSION / width,
    MAX_IMAGE_DIMENSION / height
  );

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function compressImageFile(file: File) {
  const image = await createImageFromFile(file);

  const { width, height } = getResizedDimensions(
    image.naturalWidth,
    image.naturalHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nie udało się przygotować kompresji zdjęcia.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", COMPRESSED_IMAGE_QUALITY);
  });

  if (!blob) {
    throw new Error("Nie udało się skompresować zdjęcia.");
  }

  if (blob.size >= file.size && file.size <= MAX_IMAGE_SIZE) {
    return file;
  }

  const cleanName = file.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${cleanName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function submitLakeSubmissionFormData(
  formData: FormData,
  onProgress: (progress: number) => void
) {
  return new Promise<ApiResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", "/api/lake-submissions");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };

    request.onload = () => {
      let data: ApiResponse = {};

      try {
        data = JSON.parse(request.responseText || "{}") as ApiResponse;
      } catch {
        data = {};
      }

      if (request.status >= 200 && request.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data.message || "Nie udało się wysłać zgłoszenia."));
    };

    request.onerror = () => {
      reject(new Error("Wystąpił problem z połączeniem podczas wysyłania."));
    };

    request.send(formData);
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LakeSubmissionForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progressPercentage = Math.round(
    ((currentStepIndex + 1) / steps.length) * 100
  );

  const imagePreviews = useMemo(() => {
    return images.map((image) => ({
      file: image,
      url: URL.createObjectURL(image),
    }));
  }, [images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [imagePreviews]);

  function scrollToTop() {
    window.setTimeout(() => {
      topRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

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

    if (message) {
      setMessage("");
    }
  }

  function isFieldInStep(field: keyof FormState, step: StepKey) {
    return STEP_FIELDS[step].includes(field);
  }

  function getValidationErrors(scope: "all" | StepKey = "all") {
    const nextErrors: FormErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (scope !== "all" && field.step !== scope) {
        return;
      }

      const value = form[field.key];

      if (typeof value === "string" && value.trim().length === 0) {
        nextErrors[field.key] = `Pole "${field.label}" jest wymagane.`;
      }
    });

    const shouldValidateField = (field: keyof FormState) => {
      if (scope === "all") {
        return true;
      }

      return isFieldInStep(field, scope);
    };

    const latitude = Number(form.lat.replace(",", "."));
    const longitude = Number(form.lng.replace(",", "."));

    if (
      shouldValidateField("lat") &&
      form.lat.trim() &&
      Number.isNaN(latitude)
    ) {
      nextErrors.lat = "Szerokość geograficzna musi być liczbą.";
    }

    if (
      shouldValidateField("lng") &&
      form.lng.trim() &&
      Number.isNaN(longitude)
    ) {
      nextErrors.lng = "Długość geograficzna musi być liczbą.";
    }

    if (
      shouldValidateField("contactEmail") &&
      form.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())
    ) {
      nextErrors.contactEmail = "Podaj poprawny adres e-mail.";
    }

    if (
      shouldValidateField("priceListUrl") &&
      form.priceListUrl.trim() &&
      !form.priceListUrl.startsWith("http://") &&
      !form.priceListUrl.startsWith("https://")
    ) {
      nextErrors.priceListUrl = "Link powinien zaczynać się od http:// lub https://.";
    }

    if (
      shouldValidateField("rulesUrl") &&
      form.rulesUrl.trim() &&
      !form.rulesUrl.startsWith("http://") &&
      !form.rulesUrl.startsWith("https://")
    ) {
      nextErrors.rulesUrl = "Link powinien zaczynać się od http:// lub https://.";
    }

    if (
      shouldValidateField("contactWebsite") &&
      form.contactWebsite.trim() &&
      !form.contactWebsite.startsWith("http://") &&
      !form.contactWebsite.startsWith("https://")
    ) {
      nextErrors.contactWebsite =
        "Link powinien zaczynać się od http:// lub https://.";
    }

    return nextErrors;
  }

  function validateForm(scope: "all" | StepKey = "all") {
    const nextErrors = getValidationErrors(scope);

    setErrors((current) => {
      if (scope === "all") {
        return nextErrors;
      }

      const fieldsInStep = STEP_FIELDS[scope];
      const cleanedErrors = { ...current };

      fieldsInStep.forEach((field) => {
        delete cleanedErrors[field];
      });

      return {
        ...cleanedErrors,
        ...nextErrors,
      };
    });

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

  function goToStep(index: number) {
    if (isLoading || isProcessingImages) {
      return;
    }

    if (index <= currentStepIndex) {
      setCurrentStepIndex(index);
      scrollToTop();
      return;
    }

    const isCurrentStepValid = validateForm(currentStep.key);

    if (!isCurrentStepValid) {
      setMessage("Uzupełnij wymagane pola w tym kroku.");
      scrollToFirstError();
      return;
    }

    setCurrentStepIndex(index);
    setMessage("");
    scrollToTop();
  }

  function goToNextStep() {
    const isCurrentStepValid = validateForm(currentStep.key);

    if (!isCurrentStepValid) {
      setMessage("Uzupełnij wymagane pola oznaczone na czerwono.");
      scrollToFirstError();
      return;
    }

    setCurrentStepIndex((current) => Math.min(current + 1, steps.length - 1));
    setMessage("");
    scrollToTop();
  }

  function goToPreviousStep() {
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
    setMessage("");
    scrollToTop();
  }

  async function handleImagesChange(files: FileList | null) {
    if (!files) {
      return;
    }

    setMessage("");
    setIsProcessingImages(true);

    const selectedFiles = Array.from(files);
    const availableSlots = MAX_IMAGES - images.length;

    if (availableSlots <= 0) {
      setMessage(`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć.`);
      setIsProcessingImages(false);
      return;
    }

    const filesToProcess = selectedFiles.slice(0, availableSlots);
    const skippedMessages: string[] = [];
    const compressedImages: File[] = [];

    try {
      for (const file of filesToProcess) {
        if (isHeicFile(file)) {
          skippedMessages.push(
            `${file.name} pominięto — format HEIC/HEIF nie jest obsługiwany. Zmień zdjęcie na JPG, PNG albo WEBP.`
          );
          continue;
        }

        if (!isAllowedImageFile(file)) {
          skippedMessages.push(
            `${file.name} pominięto — dozwolone są tylko JPG, PNG albo WEBP.`
          );
          continue;
        }

        try {
          const compressedImage = await compressImageFile(file);

          if (compressedImage.size > MAX_IMAGE_SIZE) {
            skippedMessages.push(
              `${file.name} pominięto — zdjęcie po kompresji nadal ma więcej niż 5 MB.`
            );
            continue;
          }

          compressedImages.push(compressedImage);
        } catch {
          skippedMessages.push(
            `${file.name} pominięto — nie udało się przetworzyć zdjęcia.`
          );
        }
      }

      setImages((current) => [...current, ...compressedImages]);

      if (selectedFiles.length > availableSlots) {
        skippedMessages.push(
          `Dodano tylko ${availableSlots} zdjęć, bo limit to ${MAX_IMAGES}.`
        );
      }

      if (skippedMessages.length > 0) {
        setMessage(skippedMessages.join(" "));
      }
    } finally {
      setIsProcessingImages(false);
    }
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      goToNextStep();
      return;
    }

    setMessage("");

    const nextErrors = getValidationErrors("all");

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      const firstInvalidStepIndex = steps.findIndex((step) => {
        return Object.keys(nextErrors).some((field) =>
          STEP_FIELDS[step.key].includes(field as keyof FormState)
        );
      });

      if (firstInvalidStepIndex >= 0) {
        setCurrentStepIndex(firstInvalidStepIndex);
      }

      setMessage("Uzupełnij wymagane pola oznaczone na czerwono.");
      scrollToFirstError();
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const submitStartedAt = performance.now();

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      await submitLakeSubmissionFormData(formData, setUploadProgress);

      const requestTime = Math.round(performance.now() - submitStartedAt);
      console.info(`[LakeSubmissionForm] Czas wysyłki: ${requestTime} ms`);

      setSuccessModalOpen(true);
      setForm(initialFormState);
      setImages([]);
      setErrors({});
      setCurrentStepIndex(0);
      formRef.current?.reset();
    } catch (error) {
      console.error("[LakeSubmissionForm] Błąd wysyłki:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Wystąpił problem podczas wysyłania formularza. Spróbuj ponownie."
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }

  function closeSuccessModal() {
    setSuccessModalOpen(false);
    router.push("/lowiska");
    router.refresh();
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div ref={topRef} />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                Krok {currentStepIndex + 1} z {steps.length}
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {currentStep.title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {currentStep.description}
              </p>
            </div>

            <div className="min-w-[180px]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Postęp
                </p>

                <p className="text-sm font-black text-blue-600">
                  {progressPercentage}%
                </p>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={isLoading || isProcessingImages}
                  className={`rounded-2xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : isCompleted
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="block text-xs font-black">
                    {index + 1}. {step.shortTitle}
                  </span>

                  <span
                    className={`mt-1 block text-[11px] font-semibold ${
                      isActive
                        ? "text-blue-100"
                        : isCompleted
                          ? "text-emerald-600"
                          : "text-slate-400"
                    }`}
                  >
                    {isCompleted ? "Uzupełniono" : "Kliknij, aby przejść"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {message && (
          <div
            className={`rounded-3xl border px-5 py-4 text-sm font-bold leading-6 ${
              Object.keys(errors).length > 0 ||
              message.includes("Nie udało") ||
              message.includes("problem")
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {message}
          </div>
        )}

        {currentStep.key === "basic" && (
          <StepCard
            title="Podstawowe informacje"
            description="Te dane będą podstawą do utworzenia karty łowiska."
          >
            <div className="grid gap-5 lg:grid-cols-2">
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
          </StepCard>
        )}

        {currentStep.key === "location" && (
          <StepCard
            title="Adres i lokalizacja"
            description="Podaj adres oraz współrzędne. Dzięki temu łowisko będzie mogło pojawić się na mapie."
          >
            <div className="grid gap-5 lg:grid-cols-2">
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
          </StepCard>
        )}

        {currentStep.key === "details" && (
          <div className="space-y-6">
            <StepCard
              title="Informacje o łowisku"
              description="Te pola nie są obowiązkowe, ale pomagają lepiej opisać miejsce."
            >
              <div className="grid gap-5 lg:grid-cols-2">
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
            </StepCard>

            <StepCard
              title="Cennik i regulamin"
              description="Możesz wkleić treść albo podać link do zewnętrznej strony."
            >
              <div className="grid gap-5 lg:grid-cols-2">
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
            </StepCard>
          </div>
        )}

        {currentStep.key === "amenities" && (
          <StepCard
            title="Udogodnienia"
            description="Zaznacz elementy, które są dostępne na łowisku."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          </StepCard>
        )}

        {currentStep.key === "photos" && (
          <StepCard
            title="Zdjęcia łowiska"
            description={`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć. Jedno zdjęcie po kompresji może mieć maksymalnie 5 MB.`}
          >
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:p-6">
              <label className="block cursor-pointer rounded-2xl bg-white px-5 py-8 text-center transition hover:bg-slate-100">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  multiple
                  disabled={isLoading || isProcessingImages}
                  onChange={(event) => {
                    void handleImagesChange(event.target.files);
                    event.target.value = "";
                  }}
                  className="hidden"
                />

                <span className="text-sm font-bold text-blue-600">
                  Kliknij, aby dodać zdjęcia
                </span>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Zdjęcia zostaną automatycznie zmniejszone przed wysłaniem.
                  Obsługiwane formaty: JPG, PNG i WEBP.
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Format HEIC/HEIF z telefonu nie jest obsługiwany — zapisz
                  zdjęcie jako JPG albo PNG.
                </p>
              </label>

              {isProcessingImages && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-700">
                    Przygotowuję i kompresuję zdjęcia...
                  </p>
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">
                      Dodane zdjęcia: {images.length}/{MAX_IMAGES}
                    </p>

                    <button
                      type="button"
                      onClick={() => setImages([])}
                      disabled={isLoading || isProcessingImages}
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
                          disabled={isLoading || isProcessingImages}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-red-500 shadow-sm transition hover:bg-white disabled:opacity-50"
                          aria-label="Usuń zdjęcie"
                        >
                          ×
                        </button>

                        <div className="p-3">
                          <p className="truncate text-xs font-semibold text-slate-600">
                            {imagePreview.file.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatFileSize(imagePreview.file.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </StepCard>
        )}

        {currentStep.key === "contact" && (
          <StepCard
            title="Kontakt z łowiskiem"
            description="Dane kontaktowe nie są obowiązkowe, ale pomagają użytkownikom znaleźć więcej informacji."
          >
            <div className="grid gap-5 lg:grid-cols-2">
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

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-800">
                Przed wysłaniem sprawdź dane
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Po wysłaniu zgłoszenie trafi do weryfikacji administratora.
                Łowisko pojawi się w serwisie dopiero po akceptacji.
              </p>
            </div>
          </StepCard>
        )}

        {isLoading && uploadProgress > 0 && (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-blue-800">
                Wysyłanie zgłoszenia
              </p>

              <p className="text-sm font-black text-blue-700">
                {uploadProgress}%
              </p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${uploadProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-blue-700">
              Nie zamykaj strony podczas wysyłania zdjęć.
            </p>
          </div>
        )}

        <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/lowiska")}
              disabled={isLoading || isProcessingImages}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Anuluj
            </button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={isLoading || isProcessingImages}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Wstecz
                </button>
              )}

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={isLoading || isProcessingImages}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Dalej
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || isProcessingImages}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessingImages
                    ? "Przygotowywanie zdjęć..."
                    : isLoading
                      ? "Wysyłanie zgłoszenia..."
                      : "Wyślij zgłoszenie"}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {successModalOpen && <SuccessModal onClose={closeSuccessModal} />}
    </>
  );
}

function StepCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader title={title} description={description} />
      <div className="mt-5">{children}</div>
    </section>
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

  return <p className="mt-2 text-sm font-semibold text-red-600">{message}</p>;
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
        {label} {required && <RequiredMark />}
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
        {label} {required && <RequiredMark />}
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
        {label} {required && <RequiredMark />}
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600">
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