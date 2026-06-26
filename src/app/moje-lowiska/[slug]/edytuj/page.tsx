import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OwnerLakeEditPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    saved?: string | string[];
    error?: string | string[];
  }>;
};

const amenityFields = [
  { name: "cottages", label: "Domki" },
  { name: "campfire", label: "Ognisko" },
  { name: "noKill", label: "No Kill" },
  { name: "tent", label: "Namiot" },
  { name: "parking", label: "Parking" },
  { name: "pier", label: "Pomost" },
  { name: "toilet", label: "Toaleta" },
  { name: "shop", label: "Sklep" },
  { name: "nightFishing", label: "Wędkowanie nocne" },
  { name: "boatRental", label: "Wypożyczalnia łodzi" },
  { name: "gearRental", label: "Wypożyczalnia sprzętu" },
  { name: "shelter", label: "Altana" },
  { name: "coveredSpots", label: "Zadaszone stanowiska" },
  { name: "playground", label: "Plac zabaw" },
  { name: "cardPayment", label: "Płatność kartą" },
] as const;

export default async function OwnerLakeEditPage({
  params,
  searchParams,
}: OwnerLakeEditPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const isSaved = getSearchParamValue(resolvedSearchParams.saved) === "1";
  const error = getSearchParamValue(resolvedSearchParams.error);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      lake: {
        slug,
      },
    },
    include: {
      lake: {
        include: {
          fishSpecies: {
            orderBy: {
              name: "asc",
            },
          },
          priceList: {
            orderBy: {
              id: "asc",
            },
          },
          rules: {
            orderBy: {
              id: "asc",
            },
          },
          images: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              url: true,
            },
          },
        },
      },
    },
  });

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Panel właściciela
            </p>

            <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Edycja łowiska
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Edytujesz podstawowe informacje widoczne na publicznym profilu
              łowiska. Zmiany zapisują się od razu po kliknięciu przycisku.
            </p>
          </div>

         <div className="grid gap-3 sm:grid-cols-3 lg:w-auto">
            <Link
              href="/moje-lowiska"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Moje łowiska
            </Link>

            <Link
              href={`/moje-lowiska/${lake.slug}/zdjecia`}
              className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-100"
            >
              Zdjęcia
            </Link>

            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
            >
              Podgląd
            </Link>
          </div>
        </div>

        {isSaved && (
          <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-lg font-black text-emerald-950">
              Zmiany zostały zapisane
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Publiczny profil łowiska został zaktualizowany.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-red-100 bg-red-50 p-5">
            <p className="text-lg font-black text-red-950">
              Nie udało się zapisać zmian
            </p>

            <p className="mt-2 text-sm leading-6 text-red-800">
              {getErrorMessage(error)}
            </p>
          </div>
        )}

        {!ownerLake.canEditLake ? (
          <NoEditAccessCard lakeSlug={lake.slug} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <form action={updateOwnerLake} className="min-w-0 space-y-6">
              <input type="hidden" name="lakeId" value={lake.id} />
              <input type="hidden" name="slug" value={lake.slug} />

              <FormSection
                title="Podstawowe informacje"
                description="Nazwa, opis i typ łowiska."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Input
                    label="Nazwa łowiska"
                    name="name"
                    defaultValue={lake.name}
                    required
                  />

                  <Input
                    label="Ryby"
                    name="fish"
                    defaultValue={lake.fish}
                    placeholder="np. Karp, Amur, Szczupak"
                    required
                  />

                  <Select
                    label="Rodzaj łowiska"
                    name="ownerType"
                    defaultValue={lake.ownerType}
                    options={[
                      { label: "PZW", value: "pzw" },
                      { label: "Komercyjne", value: "commercial" },
                    ]}
                  />

                  <Select
                    label="Typ wędkowania"
                    name="fishingType"
                    defaultValue={lake.fishingType}
                    options={[
                      { label: "Ogólne", value: "general" },
                      { label: "Spinningowe", value: "spinning" },
                      { label: "Karpiowe", value: "carp" },
                    ]}
                  />

                  <div className="lg:col-span-2">
                    <Textarea
                      label="Opis łowiska"
                      name="description"
                      defaultValue={lake.description}
                      rows={7}
                      required
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Adres i lokalizacja"
                description="Dane adresowe oraz współrzędne używane na mapie."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Input
                    label="Ulica / miejsce"
                    name="street"
                    defaultValue={lake.street}
                    required
                  />

                  <Input
                    label="Miejscowość"
                    name="city"
                    defaultValue={lake.city}
                    required
                  />

                  <Input
                    label="Kod pocztowy"
                    name="postalCode"
                    defaultValue={lake.postalCode}
                    required
                  />

                  <Input
                    label="Województwo"
                    name="voivodeship"
                    defaultValue={lake.voivodeship}
                    required
                  />

                  <Input
                    label="Szerokość geograficzna"
                    name="lat"
                    defaultValue={String(lake.lat)}
                    required
                  />

                  <Input
                    label="Długość geograficzna"
                    name="lng"
                    defaultValue={String(lake.lng)}
                    required
                  />
                </div>
              </FormSection>

              <FormSection
                title="Informacje o akwenie"
                description="Dodatkowe dane przydatne dla wędkarzy."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Input
                    label="Powierzchnia"
                    name="area"
                    defaultValue={cleanDefaultValue(lake.area)}
                    placeholder="np. 4 ha"
                  />

                  <Input
                    label="Średnia głębokość"
                    name="averageDepth"
                    defaultValue={cleanDefaultValue(lake.averageDepth)}
                    placeholder="np. 2,5 m"
                  />

                  <Input
                    label="Rodzaj dna"
                    name="bottomType"
                    defaultValue={cleanDefaultValue(lake.bottomType)}
                    placeholder="np. muliste, piaszczyste"
                  />

                  <Input
                    label="Typ wody"
                    name="waterType"
                    defaultValue={cleanDefaultValue(lake.waterType)}
                    placeholder="np. staw, jezioro, żwirownia"
                  />
                </div>
              </FormSection>

              <FormSection
                title="Cennik i regulamin"
                description="Każdą pozycję cennika lub zasadę wpisz w osobnej linii."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Textarea
                    label="Cennik"
                    name="priceListText"
                    defaultValue={
                      lake.priceListText ||
                      lake.priceList.map((item) => item.text).join("\n")
                    }
                    rows={7}
                    placeholder="np. Zezwolenie dzienne – 50 zł"
                  />

                  <Textarea
                    label="Regulamin"
                    name="rulesText"
                    defaultValue={
                      lake.rulesText ||
                      lake.rules.map((item) => item.text).join("\n")
                    }
                    rows={7}
                    placeholder="np. Obowiązuje mata karpiowa"
                  />

                  <Input
                    label="Link do cennika"
                    name="priceListUrl"
                    defaultValue={lake.priceListUrl || ""}
                    placeholder="https://..."
                  />

                  <Input
                    label="Link do regulaminu"
                    name="rulesUrl"
                    defaultValue={lake.rulesUrl || ""}
                    placeholder="https://..."
                  />
                </div>
              </FormSection>

              <FormSection
                title="Udogodnienia"
                description="Zaznacz elementy dostępne na łowisku."
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {amenityFields.map((field) => (
                    <Checkbox
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      defaultChecked={Boolean(lake[field.name])}
                    />
                  ))}
                </div>
              </FormSection>

              <FormSection
                title="Kontakt z łowiskiem"
                description="Dane widoczne na publicznym profilu łowiska."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Input
                    label="Nazwa kontaktowa"
                    name="contactName"
                    defaultValue={cleanDefaultValue(lake.contactName)}
                    placeholder="np. Łowisko Rybio"
                  />

                  <Input
                    label="Telefon"
                    name="contactPhone"
                    defaultValue={cleanDefaultValue(lake.contactPhone)}
                    placeholder="np. 500 000 000"
                  />

                  <Input
                    label="E-mail"
                    name="contactEmail"
                    defaultValue={cleanDefaultValue(lake.contactEmail)}
                    placeholder="kontakt@..."
                  />

                  <Input
                    label="Strona internetowa"
                    name="contactWebsite"
                    defaultValue={cleanDefaultValue(lake.contactWebsite)}
                    placeholder="https://..."
                  />
                </div>
              </FormSection>

              <div className="sticky bottom-24 z-10 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur lg:bottom-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/moje-lowiska"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Anuluj
                  </Link>

                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    Zapisz zmiany
                  </button>
                </div>
              </div>
            </form>

            <aside className="min-w-0 space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                  Edytowane łowisko
                </p>

                <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
                  {lake.name}
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {lake.city}, woj. {lake.voivodeship}
                </p>

                <div className="mt-5 grid gap-3">
                  <InfoBox label="Slug" value={lake.slug} />
                  <InfoBox label="Zdjęcia" value={`${lake.images.length}`} />
                  <InfoBox
                    label="Gatunki ryb"
                    value={`${lake.fishSpecies.length}`}
                  />
                  <InfoBox
                    label="Ocena"
                    value={`★ ${Number(lake.rating || 0).toFixed(1)}`}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <h2 className="text-xl font-black text-blue-950">
                  Co można teraz edytować?
                </h2>

                <div className="mt-4 space-y-3 text-sm leading-6 text-blue-800">
                  <p>✓ opis i dane podstawowe,</p>
                  <p>✓ adres i lokalizację,</p>
                  <p>✓ cennik i regulamin,</p>
                  <p>✓ udogodnienia,</p>
                  <p>✓ dane kontaktowe.</p>
                </div>
              </section>

              <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <h2 className="text-xl font-black text-amber-950">
                  Zdjęcia dodamy osobno
                </h2>

                <p className="mt-3 text-sm leading-6 text-amber-800">
                  Na tym etapie edytujemy dane tekstowe. Zarządzanie zdjęciami
                  zrobimy jako osobną zakładkę, żeby formularz był wygodny na
                  telefonie.
                </p>
              </section>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

async function updateOwnerLake(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");

  if (!lakeId || !slug) {
    redirect("/moje-lowiska");
  }

  const returnPath = `/moje-lowiska/${slug}/edytuj`;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      lakeId,
      userId: user.id,
      isActive: true,
      canEditLake: true,
    },
    include: {
      lake: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  if (!ownerLake) {
    redirect("/moje-lowiska");
  }

  const name = getString(formData, "name");
  const description = getString(formData, "description");
  const fish = getString(formData, "fish");
  const lat = Number(getString(formData, "lat").replace(",", "."));
  const lng = Number(getString(formData, "lng").replace(",", "."));

  if (!name || !description || !fish) {
    redirect(`${returnPath}?error=required`);
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    redirect(`${returnPath}?error=coords`);
  }

  const priceListText = getString(formData, "priceListText");
  const rulesText = getString(formData, "rulesText");
  const priceListItems = splitLines(priceListText);
  const rulesItems = splitLines(rulesText);
  const fishItems = splitFishNames(fish);

  await prisma.lake.update({
    where: {
      id: ownerLake.lake.id,
    },
    data: {
      name,
      description,
      ownerType: getString(formData, "ownerType") || "pzw",
      fishingType: getString(formData, "fishingType") || "general",
      fish,
      lat,
      lng,
      street: getString(formData, "street"),
      city: getString(formData, "city"),
      postalCode: getString(formData, "postalCode"),
      voivodeship: getString(formData, "voivodeship"),

      area: getString(formData, "area") || "Brak danych",
      averageDepth: getString(formData, "averageDepth") || "Brak danych",
      bottomType: getString(formData, "bottomType") || "Brak danych",
      waterType: getString(formData, "waterType") || "Brak danych",

      priceListText: priceListText || null,
      priceListUrl: getString(formData, "priceListUrl") || null,
      rulesText: rulesText || null,
      rulesUrl: getString(formData, "rulesUrl") || null,

      cottages: getCheckbox(formData, "cottages"),
      campfire: getCheckbox(formData, "campfire"),
      noKill: getCheckbox(formData, "noKill"),
      tent: getCheckbox(formData, "tent"),
      parking: getCheckbox(formData, "parking"),
      pier: getCheckbox(formData, "pier"),
      toilet: getCheckbox(formData, "toilet"),
      shop: getCheckbox(formData, "shop"),
      nightFishing: getCheckbox(formData, "nightFishing"),
      boatRental: getCheckbox(formData, "boatRental"),
      gearRental: getCheckbox(formData, "gearRental"),
      shelter: getCheckbox(formData, "shelter"),
      coveredSpots: getCheckbox(formData, "coveredSpots"),
      playground: getCheckbox(formData, "playground"),
      cardPayment: getCheckbox(formData, "cardPayment"),

      contactName: getString(formData, "contactName") || "Brak danych",
      contactPhone: getString(formData, "contactPhone") || "Brak danych",
      contactEmail: getString(formData, "contactEmail") || "Brak danych",
      contactWebsite: getString(formData, "contactWebsite") || "Brak danych",

      fishSpecies: {
        deleteMany: {},
        create: fishItems.map((fishName) => ({
          name: fishName,
        })),
      },

      priceList: {
        deleteMany: {},
        create:
          priceListItems.length > 0
            ? priceListItems.map((text) => ({
                text,
              }))
            : [
                {
                  text: "Brak dodanego cennika.",
                },
              ],
      },

      rules: {
        deleteMany: {},
        create:
          rulesItems.length > 0
            ? rulesItems.map((text) => ({
                text,
              }))
            : [
                {
                  text: "Brak dodanych zasad łowiska.",
                },
              ],
      },
    },
  });

  revalidatePath("/moje-lowiska");
  revalidatePath(`/moje-lowiska/${ownerLake.lake.slug}/edytuj`);
  revalidatePath(`/lowiska-w-polsce/${ownerLake.lake.slug}`);
  revalidatePath("/lowiska-w-polsce");

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/edytuj?saved=1`);
}

function NoEditAccessCard({ lakeSlug }: { lakeSlug: string }) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
        Brak uprawnień edycji
      </p>

      <h2 className="mt-3 text-2xl font-black text-amber-950">
        Nie możesz edytować tego łowiska
      </h2>

      <p className="mt-3 text-sm leading-6 text-amber-800">
        Twoje konto jest przypisane do tego łowiska, ale nie ma aktywnego
        uprawnienia do edycji danych. Skontaktuj się z administracją Rybio.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/moje-lowiska"
          className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-amber-800 transition hover:bg-amber-100"
        >
          Wróć do moich łowisk
        </Link>

        <Link
          href={`/lowiska-w-polsce/${lakeSlug}`}
          className="rounded-2xl bg-amber-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-amber-700"
        >
          Podgląd publiczny
        </Link>
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function Input({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-slate-300 text-blue-600"
      />

      <span className="text-sm font-bold text-slate-700">{label}</span>
    </label>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value || "Brak"}
      </p>
    </div>
  );
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitFishNames(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanDefaultValue(value: string | null) {
  const cleanValue = String(value || "").trim();

  if (
    !cleanValue ||
    cleanValue.toLowerCase() === "brak" ||
    cleanValue.toLowerCase() === "brak danych"
  ) {
    return "";
  }

  return cleanValue;
}

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function getErrorMessage(error: string) {
  if (error === "required") {
    return "Nazwa, opis oraz lista ryb są wymagane.";
  }

  if (error === "coords") {
    return "Współrzędne muszą być poprawnymi liczbami.";
  }

  return "Spróbuj ponownie za chwilę.";
}