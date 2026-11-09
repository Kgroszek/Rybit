"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  AdminDecisionDialog,
} from "@/components/admin/moderation/AdminDecisionDialog";
import {
  AdminFormInput,
  AdminFormSection,
  AdminFormSelect,
  AdminFormTextarea,
  AdminToggleCard,
} from "@/components/admin/shared/AdminFormFields";
import {
  AddCircleIcon,
} from "@/components/icons/AddCircleIcon";
import {
  TrashIcon,
} from "@/components/icons/TrashIcon";
import {
  Button,
  ButtonLink,
} from "@/components/ui/Button";
import {
  useToast,
} from "@/components/ui/ToastProvider";
import {
  FISHING_METHOD_OPTIONS,
  normalizeFishingMethods,
  type FishingMethod,
} from "@/lib/fishing-methods";

type SubmissionImage = {
  id: string;
  url: string;
};

type SubmissionFishRecord = {
  id?: string;
  fishName: string;
  weightKg: string;
};

type SubmissionEditFormState = {
  id: string;
  name: string;
  description: string;
  ownerType: string;
  fishingType: string;
  fishingMethods: FishingMethod[];
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

  isOpenAllDay: boolean;
  openingHours: string;

  cottages: boolean;
  campfire: boolean;
  noKill: boolean;
  tent: boolean;
  parking: boolean;
  pier: boolean;
  toilet: boolean;
  sanitaryFacilities: boolean;
  shop: boolean;
  nightFishing: boolean;
  boatRental: boolean;
  camperCaravan: boolean;
  electricityHookup: boolean;
  gearRental: boolean;
  shelter: boolean;
  coveredSpots: boolean;
  playground: boolean;
  cardPayment: boolean;

  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;

  fishRecords: SubmissionFishRecord[];
  gearRequirements: string[];

  images: SubmissionImage[];
};

type AdminLakeSubmissionEditFormProps = {
  submission: Omit<
    SubmissionEditFormState,
    "fishingMethods" | "fishRecords" | "gearRequirements"
  > & {
    fishingMethods: string[];
    fishRecords: Array<{
      id?: string;
      fishName: string;
      weightKg: number | string;
    }>;
    gearRequirements: Array<{
      id?: string;
      text: string;
    }>;
  };
};

const FISH_OPTIONS = [
  "Karp",
  "Amur",
  "Szczupak",
  "Sandacz",
  "Sum",
  "Okoń",
  "Lin",
  "Leszcz",
  "Płoć",
  "Karaś",
  "Karaś pospolity",
  "Jesiotr",
  "Tołpyga",
  "Węgorz",
  "Jaź",
  "Kleń",
  "Wzdręga",
] as const;

const AMENITIES: Array<{
  key: keyof Pick<
    SubmissionEditFormState,
    | "cottages"
    | "campfire"
    | "noKill"
    | "tent"
    | "parking"
    | "pier"
    | "toilet"
    | "sanitaryFacilities"
    | "shop"
    | "nightFishing"
    | "boatRental"
    | "camperCaravan"
    | "electricityHookup"
    | "gearRental"
    | "shelter"
    | "coveredSpots"
    | "playground"
    | "cardPayment"
  >;
  label: string;
}> = [
  { key: "parking", label: "Parking" },
  { key: "pier", label: "Pomost" },
  { key: "toilet", label: "Toaleta" },
  { key: "sanitaryFacilities", label: "Sanitariaty" },
  { key: "cottages", label: "Domki" },
  { key: "tent", label: "Namiot" },
  { key: "camperCaravan", label: "Kamper / przyczepa" },
  { key: "electricityHookup", label: "Przyłącze z prądem" },
  { key: "nightFishing", label: "Wędkowanie nocne" },
  { key: "boatRental", label: "Wypożyczalnia łodzi" },
  { key: "gearRental", label: "Wypożyczalnia sprzętu" },
  { key: "shop", label: "Sklep" },
  { key: "campfire", label: "Ognisko" },
  { key: "shelter", label: "Altana" },
  { key: "coveredSpots", label: "Zadaszone stanowiska" },
  { key: "playground", label: "Plac zabaw" },
  { key: "cardPayment", label: "Płatność kartą" },
  { key: "noKill", label: "No Kill" },
];

export function AdminLakeSubmissionEditForm({
  submission,
}: AdminLakeSubmissionEditFormProps) {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<SubmissionEditFormState>(() => ({
    ...submission,
    fishingMethods: normalizeFishingMethods(submission.fishingMethods),
    fishRecords: submission.fishRecords.map((record) => ({
      id: record.id,
      fishName: record.fishName,
      weightKg: String(record.weightKg).replace(".", ","),
    })),
    gearRequirements: submission.gearRequirements
      .map((item) => item.text.trim())
      .filter(Boolean),
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [imageToDelete, setImageToDelete] =
    useState<SubmissionImage | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const selectedAmenities = useMemo(
    () =>
      AMENITIES.filter((item) => Boolean(form[item.key])).length,
    [form]
  );

  function updateField<K extends keyof SubmissionEditFormState>(
    field: K,
    value: SubmissionEditFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "isOpenAllDay" && value === true
        ? {
            openingHours: "",
          }
        : {}),
    }));
  }

  function toggleFishingMethod(method: FishingMethod, checked: boolean) {
    updateField(
      "fishingMethods",
      checked
        ? Array.from(new Set([...form.fishingMethods, method]))
        : form.fishingMethods.filter((item) => item !== method)
    );
  }

  function addFishRecord() {
    if (form.fishRecords.length >= 30) {
      return;
    }

    updateField("fishRecords", [
      ...form.fishRecords,
      {
        fishName: FISH_OPTIONS[0],
        weightKg: "",
      },
    ]);
  }

  function updateFishRecord(
    index: number,
    field: "fishName" | "weightKg",
    value: string
  ) {
    updateField(
      "fishRecords",
      form.fishRecords.map((record, recordIndex) =>
        recordIndex === index
          ? {
              ...record,
              [field]: value,
            }
          : record
      )
    );
  }

  function removeFishRecord(index: number) {
    updateField(
      "fishRecords",
      form.fishRecords.filter(
        (_record, recordIndex) => recordIndex !== index
      )
    );
  }

  function addGearRequirement() {
    if (form.gearRequirements.length >= 30) {
      return;
    }

    updateField("gearRequirements", [...form.gearRequirements, ""]);
  }

  function updateGearRequirement(index: number, value: string) {
    updateField(
      "gearRequirements",
      form.gearRequirements.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  }

  function removeGearRequirement(index: number) {
    updateField(
      "gearRequirements",
      form.gearRequirements.filter(
        (_item, itemIndex) => itemIndex !== index
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateForm(form);

    if (validationMessage) {
      toast.error({
        title: "Sprawdź dane formularza.",
        description: validationMessage,
      });
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading({
      title: "Zapisywanie zgłoszenia…",
      description: "Aktualizujemy dane przesłane przez użytkownika.",
    });

    try {
      const response = await fetch(
        `/api/admin/lake-submissions/${form.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            fishRecords: normalizeFishRecords(form.fishRecords),
            gearRequirements: form.gearRequirements
              .map((requirement) => requirement.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          data?.message || "Nie udało się zapisać zgłoszenia."
        );
      }

      toast.update(toastId, {
        type: "success",
        title: "Zgłoszenie zostało zapisane.",
        description: form.name,
        duration: 3500,
      });

      router.push("/admin/zgloszenia-lowisk");
      router.refresh();
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się zapisać zgłoszenia.",
        description:
          error instanceof Error ? error.message : undefined,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteImage() {
    if (!imageToDelete) {
      return;
    }

    setIsDeletingImage(true);

    try {
      const response = await fetch(
        `/api/admin/lake-submission-images/${imageToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          data?.message || "Nie udało się usunąć zdjęcia."
        );
      }

      setForm((current) => ({
        ...current,
        images: current.images.filter(
          (image) => image.id !== imageToDelete.id
        ),
      }));

      toast.success("Zdjęcie zostało usunięte.");
      setImageToDelete(null);
    } catch (error) {
      toast.error({
        title: "Nie udało się usunąć zdjęcia.",
        description:
          error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsDeletingImage(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <AdminFormSection
          title="Podstawowe informacje"
          description="Najważniejsze dane, które po akceptacji trafią do publicznego profilu łowiska."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminFormInput
              label="Nazwa łowiska"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              maxLength={160}
            />

            <AdminFormInput
              label="Występujące ryby"
              required
              value={form.fish}
              onChange={(event) => updateField("fish", event.target.value)}
              placeholder="np. Karp, Szczupak, Okoń"
            />

            <AdminFormSelect
              label="Rodzaj łowiska"
              value={form.ownerType}
              onChange={(event) =>
                updateField("ownerType", event.target.value)
              }
            >
              <option value="pzw">PZW</option>
              <option value="commercial">Komercyjne</option>
            </AdminFormSelect>

            <AdminFormSelect
              label="Typ łowienia"
              value={form.fishingType}
              onChange={(event) =>
                updateField("fishingType", event.target.value)
              }
            >
              <option value="general">Ogólne</option>
              <option value="spinning">Spinningowe</option>
              <option value="carp">Karpiowe</option>
            </AdminFormSelect>
          </div>

          <div className="mt-5">
            <AdminFormTextarea
              label="Opis łowiska"
              required
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={6}
              maxLength={5000}
            />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-extrabold text-text">
              Metody łowienia
            </p>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Zaznacz wszystkie metody, które mają zostać zapisane przy łowisku.
            </p>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {FISHING_METHOD_OPTIONS.map((method) => (
                <AdminToggleCard
                  key={method.value}
                  label={method.label}
                  checked={form.fishingMethods.includes(method.value)}
                  onChange={(checked) =>
                    toggleFishingMethod(method.value, checked)
                  }
                />
              ))}
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Adres i lokalizacja"
          description="Dane adresowe oraz współrzędne używane na mapie Rybio."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminFormInput
              label="Ulica / miejsce"
              required
              value={form.street}
              onChange={(event) =>
                updateField("street", event.target.value)
              }
            />

            <AdminFormInput
              label="Miejscowość"
              required
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
            />

            <AdminFormInput
              label="Kod pocztowy"
              required
              value={form.postalCode}
              onChange={(event) =>
                updateField("postalCode", event.target.value)
              }
            />

            <AdminFormInput
              label="Województwo"
              required
              value={form.voivodeship}
              onChange={(event) =>
                updateField("voivodeship", event.target.value)
              }
            />

            <AdminFormInput
              label="Szerokość geograficzna"
              required
              inputMode="decimal"
              value={form.lat}
              onChange={(event) => updateField("lat", event.target.value)}
            />

            <AdminFormInput
              label="Długość geograficzna"
              required
              inputMode="decimal"
              value={form.lng}
              onChange={(event) => updateField("lng", event.target.value)}
            />
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Informacje o łowisku"
          description="Charakterystyka akwenu oraz dostępność."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminFormInput
              label="Powierzchnia"
              value={form.area}
              onChange={(event) => updateField("area", event.target.value)}
            />

            <AdminFormInput
              label="Średnia głębokość"
              value={form.averageDepth}
              onChange={(event) =>
                updateField("averageDepth", event.target.value)
              }
            />

            <AdminFormInput
              label="Rodzaj dna"
              value={form.bottomType}
              onChange={(event) =>
                updateField("bottomType", event.target.value)
              }
            />

            <AdminFormInput
              label="Typ wody"
              value={form.waterType}
              onChange={(event) =>
                updateField("waterType", event.target.value)
              }
            />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <AdminToggleCard
              label="Otwarte całodobowo"
              description="Jeśli aktywne, tekst godzin otwarcia zostanie wyczyszczony."
              checked={form.isOpenAllDay}
              onChange={(checked) =>
                updateField("isOpenAllDay", checked)
              }
            />

            {!form.isOpenAllDay && (
              <div className="mt-4">
                <AdminFormTextarea
                  label="Godziny otwarcia"
                  value={form.openingHours}
                  onChange={(event) =>
                    updateField("openingHours", event.target.value)
                  }
                  rows={4}
                  placeholder="np. Pon.–Pt. 7:00–20:00"
                />
              </div>
            )}
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Rekordowe ryby i wymagania"
          description="Dodatkowe dane, które po akceptacji zostaną przeniesione do profilu łowiska."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <EditableListHeader
              title="Rekordowe ryby"
              count={form.fishRecords.length}
              max={30}
              buttonLabel="Dodaj rekord"
              disabled={form.fishRecords.length >= 30}
              onAdd={addFishRecord}
            >
              {form.fishRecords.length > 0 ? (
                <div className="grid gap-3">
                  {form.fishRecords.map((record, index) => (
                    <div
                      key={record.id ?? index}
                      className="grid gap-3 rounded-control border border-border bg-surface-muted p-4 lg:grid-cols-[minmax(0,1fr)_150px_auto]"
                    >
                      <AdminFormSelect
                        label="Ryba"
                        value={record.fishName}
                        onChange={(event) =>
                          updateFishRecord(
                            index,
                            "fishName",
                            event.target.value
                          )
                        }
                      >
                        {FISH_OPTIONS.map((fish) => (
                          <option key={fish} value={fish}>
                            {fish}
                          </option>
                        ))}
                      </AdminFormSelect>

                      <AdminFormInput
                        label="Waga kg"
                        inputMode="decimal"
                        value={record.weightKg}
                        onChange={(event) =>
                          updateFishRecord(
                            index,
                            "weightKg",
                            event.target.value
                          )
                        }
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                          onClick={() => removeFishRecord(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          Usuń
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AdminListEmpty text="Brak rekordowych ryb." />
              )}
            </EditableListHeader>

            <EditableListHeader
              title="Wymagania sprzętowe"
              count={form.gearRequirements.length}
              max={30}
              buttonLabel="Dodaj wymaganie"
              disabled={form.gearRequirements.length >= 30}
              onAdd={addGearRequirement}
            >
              {form.gearRequirements.length > 0 ? (
                <div className="grid gap-3">
                  {form.gearRequirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-control border border-border bg-surface-muted p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <AdminFormInput
                        label="Wymaganie"
                        value={requirement}
                        onChange={(event) =>
                          updateGearRequirement(index, event.target.value)
                        }
                        maxLength={240}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                          onClick={() => removeGearRequirement(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          Usuń
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AdminListEmpty text="Brak wymagań sprzętowych." />
              )}
            </EditableListHeader>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Cennik i regulamin"
          description="Treść może być wpisana bezpośrednio lub uzupełniona linkiem."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="grid gap-4">
              <AdminFormTextarea
                label="Cennik"
                value={form.priceListText}
                onChange={(event) =>
                  updateField("priceListText", event.target.value)
                }
                rows={5}
              />

              <AdminFormInput
                label="Link do cennika"
                type="url"
                value={form.priceListUrl}
                onChange={(event) =>
                  updateField("priceListUrl", event.target.value)
                }
              />
            </div>

            <div className="grid gap-4">
              <AdminFormTextarea
                label="Regulamin"
                value={form.rulesText}
                onChange={(event) =>
                  updateField("rulesText", event.target.value)
                }
                rows={5}
              />

              <AdminFormInput
                label="Link do regulaminu"
                type="url"
                value={form.rulesUrl}
                onChange={(event) =>
                  updateField("rulesUrl", event.target.value)
                }
              />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Udogodnienia"
          description={`${selectedAmenities} zaznaczonych elementów.`}
        >
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {AMENITIES.map((amenity) => (
              <AdminToggleCard
                key={amenity.key}
                label={amenity.label}
                checked={Boolean(form[amenity.key])}
                onChange={(checked) =>
                  updateField(amenity.key, checked)
                }
              />
            ))}
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Kontakt z łowiskiem"
          description="Dane kontaktowe są opcjonalne, ale pomagają w weryfikacji zgłoszenia."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminFormInput
              label="Nazwa kontaktowa"
              value={form.contactName}
              onChange={(event) =>
                updateField("contactName", event.target.value)
              }
            />

            <AdminFormInput
              label="Telefon"
              value={form.contactPhone}
              onChange={(event) =>
                updateField("contactPhone", event.target.value)
              }
            />

            <AdminFormInput
              label="E-mail"
              type="email"
              value={form.contactEmail}
              onChange={(event) =>
                updateField("contactEmail", event.target.value)
              }
            />

            <AdminFormInput
              label="Strona internetowa"
              type="url"
              value={form.contactWebsite}
              onChange={(event) =>
                updateField("contactWebsite", event.target.value)
              }
            />
          </div>
        </AdminFormSection>

        {form.images.length > 0 && (
          <AdminFormSection
            title="Zdjęcia ze zgłoszenia"
            description="Usunięcie zdjęcia jest trwałe i usuwa plik ze zgłoszenia."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {form.images.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-card border border-border bg-surface-muted"
                >
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden"
                  >
                    <img
                      src={image.url}
                      alt={form.name}
                      className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </a>

                  <div className="p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      fullWidth
                      className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                      onClick={() => setImageToDelete(image)}
                    >
                      <TrashIcon className="h-4 w-4" />
                      Usuń zdjęcie
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </AdminFormSection>
        )}

        <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 rounded-card border border-border bg-surface/95 p-3 shadow-float backdrop-blur-xl sm:flex-row sm:justify-end">
          <ButtonLink
            href="/admin/zgloszenia-lowisk"
            variant="ghost"
          >
            Anuluj
          </ButtonLink>

          <Button
            type="submit"
            isLoading={isLoading}
            loadingLabel="Zapisywanie…"
          >
            Zapisz zgłoszenie
          </Button>
        </div>
      </form>

      <AdminDecisionDialog
        open={Boolean(imageToDelete)}
        onClose={() => setImageToDelete(null)}
        title="Usunąć zdjęcie ze zgłoszenia?"
        description="Plik zostanie trwale usunięty i nie będzie przeniesiony do łowiska po akceptacji."
        confirmLabel="Usuń zdjęcie"
        tone="danger"
        isLoading={isDeletingImage}
        onConfirm={deleteImage}
      />
    </>
  );
}

function EditableListHeader({
  title,
  count,
  max,
  buttonLabel,
  disabled,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  max: number;
  buttonLabel: string;
  disabled: boolean;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-text">
            {title}
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            {count}/{max}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onAdd}
        >
          <AddCircleIcon className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function AdminListEmpty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-control border border-dashed border-border-strong bg-surface-muted px-4 py-5 text-sm text-text-muted">
      {text}
    </div>
  );
}

function normalizeFishRecords(
  records: SubmissionFishRecord[]
) {
  return records
    .map((record) => ({
      fishName: record.fishName.trim(),
      weightKg: Number(record.weightKg.replace(",", ".")),
    }))
    .filter(
      (record) =>
        record.fishName &&
        Number.isFinite(record.weightKg) &&
        record.weightKg > 0
    );
}

function validateForm(form: SubmissionEditFormState) {
  if (
    !form.name.trim() ||
    !form.description.trim() ||
    !form.fish.trim()
  ) {
    return "Nazwa, opis i ryby są wymagane.";
  }

  if (
    !form.street.trim() ||
    !form.city.trim() ||
    !form.postalCode.trim() ||
    !form.voivodeship.trim()
  ) {
    return "Uzupełnij pełne dane adresowe.";
  }

  const lat = Number(form.lat.replace(",", "."));
  const lng = Number(form.lng.replace(",", "."));

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return "Szerokość geograficzna musi być liczbą od -90 do 90.";
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return "Długość geograficzna musi być liczbą od -180 do 180.";
  }

  const incompleteRecord = form.fishRecords.some((record) => {
    const fishName = record.fishName.trim();
    const weight = record.weightKg.trim();

    return Boolean(fishName) !== Boolean(weight);
  });

  if (incompleteRecord) {
    return "Uzupełnij gatunek i wagę każdej rekordowej ryby albo usuń niekompletny wiersz.";
  }

  return null;
}
