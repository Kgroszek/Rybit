"use client";

import {
  useMemo,
  useRef,
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

type LakeFishRecordInput = {
  id?: string;
  fishName: string;
  weightKg: string;
};

type LakeFishRecordFromProps = {
  id?: string;
  fishName?: string;
  weightKg?: number | string;
};

type LakeGearRequirementFromProps =
  | string
  | {
      id?: string;
      text?: string;
    };

type LakeOpeningHoursFromProps =
  | string
  | null
  | {
      isOpenAllDay?: boolean;
      text?: string | null;
    };

type LakeEditFormLake = {
  id: string;
  name: string;
  slug: string;
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

  isOpenAllDay?: boolean;
  openingHours?: LakeOpeningHoursFromProps;
  fishRecords?: LakeFishRecordFromProps[];
  gearRequirements?: LakeGearRequirementFromProps[];

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

  images: Array<{
    id: string;
    url: string;
  }>;
};

type LakeEditFormState = Omit<
  LakeEditFormLake,
  "isOpenAllDay" | "openingHours" | "fishRecords" | "gearRequirements"
> & {
  isOpenAllDay: boolean;
  openingHours: string;
  fishRecords: LakeFishRecordInput[];
  gearRequirements: string[];
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
    LakeEditFormState,
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
  { key: "toilet", label: "Toalety" },
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

function normalizeFishRecords(
  records?: LakeFishRecordFromProps[]
): LakeFishRecordInput[] {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map((record) => ({
      id: record.id,
      fishName: String(record.fishName || "").trim(),
      weightKg: String(record.weightKg ?? "").replace(".", ","),
    }))
    .filter((record) => record.fishName || record.weightKg);
}

function normalizeGearRequirements(
  requirements?: LakeGearRequirementFromProps[]
) {
  if (!Array.isArray(requirements)) {
    return [];
  }

  return requirements
    .map((requirement) =>
      typeof requirement === "string"
        ? requirement.trim()
        : String(requirement.text || "").trim()
    )
    .filter(Boolean);
}

function getInitialIsOpenAllDay(lake: LakeEditFormLake) {
  if (
    lake.openingHours &&
    typeof lake.openingHours === "object" &&
    "isOpenAllDay" in lake.openingHours
  ) {
    return Boolean(lake.openingHours.isOpenAllDay);
  }

  return Boolean(lake.isOpenAllDay);
}

function getInitialOpeningHours(lake: LakeEditFormLake) {
  if (lake.openingHours && typeof lake.openingHours === "object") {
    return lake.openingHours.text || "";
  }

  return lake.openingHours || "";
}

export function LakeEditForm({
  lake,
}: {
  lake: LakeEditFormLake;
}) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<LakeEditFormState>(() => ({
    ...lake,
    fishingMethods: normalizeFishingMethods(lake.fishingMethods),
    contactEmail:
      lake.contactEmail === "Brak danych" ? "" : lake.contactEmail,
    contactWebsite:
      lake.contactWebsite === "Brak danych" ? "" : lake.contactWebsite,
    isOpenAllDay: getInitialIsOpenAllDay(lake),
    openingHours: getInitialOpeningHours(lake),
    fishRecords: normalizeFishRecords(lake.fishRecords),
    gearRequirements: normalizeGearRequirements(lake.gearRequirements),
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageToDelete, setImageToDelete] = useState<
    LakeEditFormState["images"][number] | null
  >(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const selectedAmenities = useMemo(
    () => AMENITIES.filter((item) => Boolean(form[item.key])).length,
    [form]
  );

  function updateField<K extends keyof LakeEditFormState>(
    field: K,
    value: LakeEditFormState[K]
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

  async function handleUploadImages() {
    if (selectedImages.length === 0 || isUploadingImages) {
      return;
    }

    setIsUploadingImages(true);

    const toastId = toast.loading({
      title: "Dodawanie zdjęć…",
      description: `${selectedImages.length} plików`,
    });

    try {
      const formData = new FormData();

      for (const image of selectedImages) {
        formData.append("images", image);
      }

      const response = await fetch(`/api/admin/lake-images/${form.id}`, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
            images?: LakeEditFormState["images"];
          }
        | null;

      if (!response.ok) {
        throw new Error(
          data?.message || "Nie udało się dodać zdjęć."
        );
      }

      setForm((current) => ({
        ...current,
        images: [...(data?.images ?? []), ...current.images],
      }));

      setSelectedImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.update(toastId, {
        type: "success",
        title: "Zdjęcia zostały dodane.",
        duration: 3500,
      });
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się dodać zdjęć.",
        description:
          error instanceof Error ? error.message : undefined,
        duration: 6000,
      });
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function handleDeleteImage() {
    if (!imageToDelete) {
      return;
    }

    setIsDeletingImage(true);

    try {
      const response = await fetch(
        `/api/admin/lake-images/${imageToDelete.id}`,
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
          (currentImage) => currentImage.id !== imageToDelete.id
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateLakeForm(form);

    if (validationMessage) {
      toast.error({
        title: "Sprawdź dane łowiska.",
        description: validationMessage,
      });
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading({
      title: "Zapisywanie łowiska…",
      description: form.name,
    });

    try {
      const payload = {
        ...form,
        contactEmail:
          form.contactEmail === "Brak danych"
            ? ""
            : form.contactEmail.trim(),
        contactWebsite:
          form.contactWebsite === "Brak danych"
            ? ""
            : form.contactWebsite.trim(),
        openingHours: form.isOpenAllDay ? "" : form.openingHours.trim(),
        fishRecords: normalizeFishRecordPayload(form.fishRecords),
        gearRequirements: form.gearRequirements
          .map((requirement) => requirement.trim())
          .filter(Boolean),
      };

      const response = await fetch(`/api/admin/lakes/${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            message?: string;
            lake?: {
              slug?: string;
            };
          }
        | null;

      if (!response.ok) {
        throw new Error(data?.message || "Nie udało się zapisać zmian.");
      }

      toast.update(toastId, {
        type: "success",
        title: "Zmiany zostały zapisane.",
        description: form.name,
        duration: 3500,
      });

      router.refresh();
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        title: "Nie udało się zapisać zmian.",
        description:
          error instanceof Error ? error.message : undefined,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <AdminFormSection
          title="Podstawowe informacje"
          description="Najważniejsze dane publicznego profilu łowiska."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <AdminFormInput
              label="Nazwa łowiska"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />

            <AdminFormInput
              label="Występujące ryby"
              required
              value={form.fish}
              onChange={(event) => updateField("fish", event.target.value)}
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
            />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-extrabold text-text">
              Metody łowienia
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
          description="Dane widoczne przy łowisku i wykorzystywane na mapie."
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
          title="Charakterystyka i godziny"
          description="Parametry akwenu oraz informacje o dostępności."
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
              checked={form.isOpenAllDay}
              onChange={(checked) => updateField("isOpenAllDay", checked)}
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
                />
              </div>
            )}
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Rekordowe ryby i wymagania"
          description="Dane specjalistyczne widoczne na profilu łowiska."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <EditableLakeListHeader
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
                        {FISH_OPTIONS.map((fishName) => (
                          <option key={fishName} value={fishName}>
                            {fishName}
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
                <AdminLakeListEmpty text="Brak rekordowych ryb." />
              )}
            </EditableLakeListHeader>

            <EditableLakeListHeader
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
                <AdminLakeListEmpty text="Brak wymagań sprzętowych." />
              )}
            </EditableLakeListHeader>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Cennik i regulamin"
          description="Tekst i linki wyświetlane na publicznym profilu."
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
          description="Dane kontaktowe widoczne na publicznym profilu."
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

        <AdminFormSection
          title="Zdjęcia łowiska"
          description="Dodawaj nowe zdjęcia lub usuwaj te, które nie powinny być widoczne publicznie."
        >
          <div className="rounded-control border border-dashed border-border-strong bg-surface-muted p-4 sm:p-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) =>
                setSelectedImages(
                  Array.from(event.target.files ?? [])
                )
              }
              className="sr-only"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-text">
                  Nowe zdjęcia
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {selectedImages.length > 0
                    ? `Wybrano ${selectedImages.length} plików.`
                    : "Wybierz zdjęcia z urządzenia, a następnie dodaj je do łowiska."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Wybierz pliki
                </Button>

                <Button
                  type="button"
                  size="sm"
                  isLoading={isUploadingImages}
                  loadingLabel="Dodawanie…"
                  disabled={selectedImages.length === 0}
                  onClick={() => void handleUploadImages()}
                >
                  Dodaj zdjęcia
                </Button>
              </div>
            </div>
          </div>

          {form.images.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          ) : (
            <AdminLakeListEmpty text="To łowisko nie ma jeszcze zdjęć." />
          )}
        </AdminFormSection>

        <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 rounded-card border border-border bg-surface/95 p-3 shadow-float backdrop-blur-xl sm:flex-row sm:justify-end">
          <ButtonLink href="/admin/lowiska" variant="ghost">
            Wróć do listy
          </ButtonLink>

          <Button
            type="submit"
            isLoading={isLoading}
            loadingLabel="Zapisywanie…"
          >
            Zapisz zmiany
          </Button>
        </div>
      </form>

      <AdminDecisionDialog
        open={Boolean(imageToDelete)}
        onClose={() => setImageToDelete(null)}
        title="Usunąć zdjęcie z łowiska?"
        description="Zdjęcie zostanie trwale usunięte z publicznego profilu."
        confirmLabel="Usuń zdjęcie"
        tone="danger"
        isLoading={isDeletingImage}
        onConfirm={handleDeleteImage}
      />
    </>
  );
}

function EditableLakeListHeader({
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

function AdminLakeListEmpty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-4 rounded-control border border-dashed border-border-strong bg-surface-muted px-4 py-5 text-sm text-text-muted">
      {text}
    </div>
  );
}

function normalizeFishRecordPayload(records: LakeFishRecordInput[]) {
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

function validateLakeForm(form: LakeEditFormState) {
  if (!form.name.trim() || !form.description.trim() || !form.fish.trim()) {
    return "Nazwa, opis i ryby są wymagane.";
  }

  const latitude = Number(form.lat.replace(",", "."));
  const longitude = Number(form.lng.replace(",", "."));

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return "Szerokość geograficzna musi być liczbą od -90 do 90.";
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return "Długość geograficzna musi być liczbą od -180 do 180.";
  }

  return null;
}
