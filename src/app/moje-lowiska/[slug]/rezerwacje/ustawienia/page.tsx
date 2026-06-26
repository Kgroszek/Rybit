import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BookingSettingsPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    updated?: string | string[];
    error?: string | string[];
  }>;
};

const defaultBookingSettings = {
  isBookingEnabled: false,
  isOnlineBookingEnabled: false,
  requiresOwnerConfirmation: true,

  defaultStartTime: "12:00",
  defaultEndTime: "10:00",

  fullDayStartTime: "06:00",
  fullDayEndTime: "07:00",

  dayStartTime: "08:00",
  dayEndTime: "16:00",

  nightStartTime: "16:00",
  nightEndTime: "06:00",

  minReservationHours: null as number | null,
  maxReservationDays: null as number | null,

  requiresDeposit: false,
  depositAmount: null as number | null,

  bookingPhone: null as string | null,
  bookingEmail: null as string | null,

  bookingRules: null as string | null,
  confirmationMessage: null as string | null,
};

export default async function BookingSettingsPage({
  params,
  searchParams,
}: BookingSettingsPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const updated = getSearchParamValue(resolvedSearchParams.updated) === "1";
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
          bookingSettings: true,
        },
      },
    },
  });

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;
  const settings = lake.bookingSettings || defaultBookingSettings;

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Panel właściciela
            </p>

            <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Ustawienia rezerwacji
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Ustaw godziny doby, dnia i nocy dla tego łowiska. Później na
              stronie rezerwacji właściciel będzie mógł jednym kliknięciem
              wybrać odpowiedni zakres.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-auto">
            <Link
              href={`/moje-lowiska/${lake.slug}/rezerwacje`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
            >
              Rezerwacje
            </Link>

            <Link
              href={`/moje-lowiska/${lake.slug}/stanowiska`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Stanowiska
            </Link>

            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Podgląd
            </Link>
          </div>
        </div>

        {updated && (
          <Alert
            variant="success"
            title="Ustawienia zostały zapisane"
            description="Nowe godziny będą używane przy szybkim wyborze terminu rezerwacji."
          />
        )}

        {error && (
          <Alert
            variant="danger"
            title="Nie udało się zapisać ustawień"
            description={getErrorMessage(error)}
          />
        )}

        {!ownerLake.canManageReservations ? (
          <NoAccessCard lakeSlug={lake.slug} />
        ) : (
          <form action={updateBookingSettings} className="grid gap-6">
            <input type="hidden" name="lakeId" value={lake.id} />
            <input type="hidden" name="slug" value={lake.slug} />

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                Status rezerwacji
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Dostępność systemu
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Te opcje przygotowują łowisko pod obecny panel właściciela oraz
                przyszłe publiczne rezerwacje online.
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <CheckboxCard
                  name="isBookingEnabled"
                  defaultChecked={settings.isBookingEnabled}
                  title="Włącz rezerwacje"
                  description="Rezerwacje są aktywne dla tego łowiska w panelu właściciela."
                />

                <CheckboxCard
                  name="isOnlineBookingEnabled"
                  defaultChecked={settings.isOnlineBookingEnabled}
                  title="Rezerwacje online"
                  description="Przygotowane pod późniejszą publiczną rezerwację przez wędkarzy."
                />

                <CheckboxCard
                  name="requiresOwnerConfirmation"
                  defaultChecked={settings.requiresOwnerConfirmation}
                  title="Wymagaj potwierdzenia"
                  description="Publiczne rezerwacje będą wymagały akceptacji właściciela."
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                Szybkie zakresy
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Doba, dzień i noc
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Jeśli godzina zakończenia jest wcześniejsza niż godzina
                rozpoczęcia, system potraktuje zakończenie jako następny dzień.
                Przykład: noc 16:00–06:00.
              </p>

              <div className="mt-6 grid gap-5">
                <TimeRangeCard
                  title="Doba"
                  description="Przykład: od 06:00 do 07:00 następnego dnia."
                  startName="fullDayStartTime"
                  endName="fullDayEndTime"
                  startDefaultValue={settings.fullDayStartTime}
                  endDefaultValue={settings.fullDayEndTime}
                />

                <TimeRangeCard
                  title="Dzień"
                  description="Przykład: od 08:00 do 16:00 tego samego dnia."
                  startName="dayStartTime"
                  endName="dayEndTime"
                  startDefaultValue={settings.dayStartTime}
                  endDefaultValue={settings.dayEndTime}
                />

                <TimeRangeCard
                  title="Noc"
                  description="Przykład: od 16:00 do 06:00 następnego dnia."
                  startName="nightStartTime"
                  endName="nightEndTime"
                  startDefaultValue={settings.nightStartTime}
                  endDefaultValue={settings.nightEndTime}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                Domyślny zakres
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Zakres domyślny
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ten zakres może być używany jako domyślny startowy termin na
                stronie rezerwacji.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Domyślna godzina od">
                  <input
                    name="defaultStartTime"
                    type="time"
                    required
                    defaultValue={settings.defaultStartTime}
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Domyślna godzina do">
                  <input
                    name="defaultEndTime"
                    type="time"
                    required
                    defaultValue={settings.defaultEndTime}
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                Ograniczenia i płatności
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Zasady rezerwacji
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Minimalny czas rezerwacji w godzinach">
                  <input
                    name="minReservationHours"
                    type="number"
                    min="1"
                    max="9999"
                    defaultValue={settings.minReservationHours ?? ""}
                    placeholder="np. 12"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Maksymalna liczba dni rezerwacji">
                  <input
                    name="maxReservationDays"
                    type="number"
                    min="1"
                    max="365"
                    defaultValue={settings.maxReservationDays ?? ""}
                    placeholder="np. 14"
                    className={inputClassName}
                  />
                </FormField>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_240px]">
                <CheckboxCard
                  name="requiresDeposit"
                  defaultChecked={settings.requiresDeposit}
                  title="Wymagaj zaliczki"
                  description="Przydatne później przy publicznych rezerwacjach online."
                />

                <FormField label="Kwota zaliczki">
                  <input
                    name="depositAmount"
                    type="text"
                    inputMode="decimal"
                    defaultValue={formatNumberInput(settings.depositAmount)}
                    placeholder="np. 50"
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                Kontakt i komunikaty
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Informacje dla rezerwujących
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Telefon do rezerwacji">
                  <input
                    name="bookingPhone"
                    type="tel"
                    defaultValue={settings.bookingPhone || ""}
                    placeholder="np. 600 000 000"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="E-mail do rezerwacji">
                  <input
                    name="bookingEmail"
                    type="email"
                    defaultValue={settings.bookingEmail || ""}
                    placeholder="np. rezerwacje@lowisko.pl"
                    className={inputClassName}
                  />
                </FormField>
              </div>

              <div className="mt-5 grid gap-4">
                <FormField label="Regulamin / zasady rezerwacji">
                  <textarea
                    name="bookingRules"
                    rows={5}
                    defaultValue={settings.bookingRules || ""}
                    placeholder="Np. rezerwacja ważna po wpłacie zaliczki, przyjazd od godziny..."
                    className={textareaClassName}
                  />
                </FormField>

                <FormField label="Wiadomość po rezerwacji">
                  <textarea
                    name="confirmationMessage"
                    rows={5}
                    defaultValue={settings.confirmationMessage || ""}
                    placeholder="Np. Dziękujemy za rezerwację. W razie pytań prosimy o kontakt..."
                    className={textareaClassName}
                  />
                </FormField>
              </div>
            </section>

            <div className="sticky bottom-24 z-10 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur lg:bottom-6">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <p className="text-sm leading-6 text-slate-500">
                  Po zapisaniu ustawień wróć do rezerwacji i użyj szybkich
                  przycisków: doba, dzień, noc.
                </p>

                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Zapisz ustawienia
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

async function updateBookingSettings(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");

  if (!lakeId || !slug) {
    redirect("/moje-lowiska");
  }

  const defaultStartTime = getTimeValue(formData, "defaultStartTime");
  const defaultEndTime = getTimeValue(formData, "defaultEndTime");

  const fullDayStartTime = getTimeValue(formData, "fullDayStartTime");
  const fullDayEndTime = getTimeValue(formData, "fullDayEndTime");

  const dayStartTime = getTimeValue(formData, "dayStartTime");
  const dayEndTime = getTimeValue(formData, "dayEndTime");

  const nightStartTime = getTimeValue(formData, "nightStartTime");
  const nightEndTime = getTimeValue(formData, "nightEndTime");

  const allTimesAreValid = [
    defaultStartTime,
    defaultEndTime,
    fullDayStartTime,
    fullDayEndTime,
    dayStartTime,
    dayEndTime,
    nightStartTime,
    nightEndTime,
  ].every(Boolean);

  if (!allTimesAreValid) {
    redirect(`/moje-lowiska/${slug}/rezerwacje/ustawienia?error=time`);
  }

  const ownerLake = await getOwnerLakeWithReservationPermission(lakeId);

  await prisma.lakeBookingSettings.upsert({
    where: {
      lakeId: ownerLake.lake.id,
    },
    create: {
      lakeId: ownerLake.lake.id,

      isBookingEnabled: formData.get("isBookingEnabled") === "on",
      isOnlineBookingEnabled: formData.get("isOnlineBookingEnabled") === "on",
      requiresOwnerConfirmation:
        formData.get("requiresOwnerConfirmation") === "on",

      defaultStartTime: defaultStartTime!,
      defaultEndTime: defaultEndTime!,

      fullDayStartTime: fullDayStartTime!,
      fullDayEndTime: fullDayEndTime!,

      dayStartTime: dayStartTime!,
      dayEndTime: dayEndTime!,

      nightStartTime: nightStartTime!,
      nightEndTime: nightEndTime!,

      minReservationHours: getOptionalPositiveInt(
        formData,
        "minReservationHours"
      ),
      maxReservationDays: getOptionalPositiveInt(
        formData,
        "maxReservationDays"
      ),

      requiresDeposit: formData.get("requiresDeposit") === "on",
      depositAmount: getOptionalPrice(formData, "depositAmount"),

      bookingPhone: getOptionalString(formData, "bookingPhone"),
      bookingEmail: getOptionalString(formData, "bookingEmail"),

      bookingRules: getOptionalString(formData, "bookingRules"),
      confirmationMessage: getOptionalString(formData, "confirmationMessage"),
    },
    update: {
      isBookingEnabled: formData.get("isBookingEnabled") === "on",
      isOnlineBookingEnabled: formData.get("isOnlineBookingEnabled") === "on",
      requiresOwnerConfirmation:
        formData.get("requiresOwnerConfirmation") === "on",

      defaultStartTime: defaultStartTime!,
      defaultEndTime: defaultEndTime!,

      fullDayStartTime: fullDayStartTime!,
      fullDayEndTime: fullDayEndTime!,

      dayStartTime: dayStartTime!,
      dayEndTime: dayEndTime!,

      nightStartTime: nightStartTime!,
      nightEndTime: nightEndTime!,

      minReservationHours: getOptionalPositiveInt(
        formData,
        "minReservationHours"
      ),
      maxReservationDays: getOptionalPositiveInt(
        formData,
        "maxReservationDays"
      ),

      requiresDeposit: formData.get("requiresDeposit") === "on",
      depositAmount: getOptionalPrice(formData, "depositAmount"),

      bookingPhone: getOptionalString(formData, "bookingPhone"),
      bookingEmail: getOptionalString(formData, "bookingEmail"),

      bookingRules: getOptionalString(formData, "bookingRules"),
      confirmationMessage: getOptionalString(formData, "confirmationMessage"),
    },
  });

  revalidatePath("/moje-lowiska");
  revalidatePath(`/moje-lowiska/${ownerLake.lake.slug}/rezerwacje`);
  revalidatePath(`/moje-lowiska/${ownerLake.lake.slug}/rezerwacje/ustawienia`);
  revalidatePath(`/lowiska-w-polsce/${ownerLake.lake.slug}`);

  redirect(
    `/moje-lowiska/${ownerLake.lake.slug}/rezerwacje/ustawienia?updated=1`
  );
}

async function getOwnerLakeWithReservationPermission(lakeId: string) {
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
      canManageReservations: true,
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

  return ownerLake;
}

function NoAccessCard({ lakeSlug }: { lakeSlug: string }) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
        Brak uprawnień
      </p>

      <h2 className="mt-3 text-2xl font-black text-amber-950">
        Nie możesz zmieniać ustawień rezerwacji tego łowiska
      </h2>

      <p className="mt-3 text-sm leading-6 text-amber-800">
        Twoje konto jest przypisane do tego łowiska, ale nie ma aktywnego
        uprawnienia do zarządzania rezerwacjami.
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

function Alert({
  variant,
  title,
  description,
}: {
  variant: "success" | "danger";
  title: string;
  description: string;
}) {
  const classes =
    variant === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
      : "border-red-100 bg-red-50 text-red-800";

  const titleClass =
    variant === "success" ? "text-emerald-950" : "text-red-950";

  return (
    <div className={`mb-6 rounded-3xl border p-5 ${classes}`}>
      <p className={`text-lg font-black ${titleClass}`}>{title}</p>
      <p className="mt-2 text-sm leading-6">{description}</p>
    </div>
  );
}

function CheckboxCard({
  name,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />

      <span>
        <span className="block text-sm font-black text-slate-800">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function TimeRangeCard({
  title,
  description,
  startName,
  endName,
  startDefaultValue,
  endDefaultValue,
}: {
  title: string;
  description: string;
  startName: string;
  endName: string;
  startDefaultValue: string;
  endDefaultValue: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px] lg:items-end">
        <div>
          <h3 className="text-xl font-black text-slate-950">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <FormField label="Od">
          <input
            name={startName}
            type="time"
            required
            defaultValue={startDefaultValue}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Do">
          <input
            name={endName}
            type="time"
            required
            defaultValue={endDefaultValue}
            className={inputClassName}
          />
        </FormField>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClassName =
  "block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

const textareaClassName =
  "block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value.length > 0 ? value : null;
}

function getTimeValue(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!isValidTime(value)) {
    return null;
  }

  return value;
}

function isValidTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return false;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function getOptionalPositiveInt(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
}

function getOptionalPrice(formData: FormData, key: string) {
  const rawValue = getString(formData, key)
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!rawValue) {
    return null;
  }

  const value = Number.parseFloat(rawValue);

  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}

function formatNumberInput(value: number | null) {
  if (value === null) {
    return "";
  }

  return String(value).replace(".", ",");
}

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function getErrorMessage(error: string) {
  if (error === "time") {
    return "Podaj poprawne godziny w formacie HH:MM.";
  }

  return "Spróbuj ponownie za chwilę.";
}