import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CardsIcon } from "@/components/icons/CardsIcon";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { UserIcon } from "@/components/icons/UserIcon";

export const dynamic = "force-dynamic";

type BookingSettingsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BookingSettingsPage({ params }: BookingSettingsPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const ownerLake = await prisma.lakeOwner.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      lake: { slug },
    },
    include: {
      lake: {
        select: {
          id: true,
          slug: true,
          name: true,
          bookingSettings: true,
        },
      },
    },
  });

  if (!ownerLake) notFound();
  if (!ownerLake.canManageReservations) redirect(`/moje-lowiska/${slug}`);

  const lake = ownerLake.lake;
  const settings = lake.bookingSettings;

  async function saveSettings(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const access = await prisma.lakeOwner.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        canManageReservations: true,
        lake: { slug },
      },
      select: {
        lakeId: true,
      },
    });

    if (!access) redirect("/moje-lowiska");

    const values = {
      isBookingEnabled: true,
      defaultStartTime: timeValue(formData.get("defaultStartTime"), "12:00"),
      defaultEndTime: timeValue(formData.get("defaultEndTime"), "10:00"),
      fullDayStartTime: timeValue(formData.get("fullDayStartTime"), "06:00"),
      fullDayEndTime: timeValue(formData.get("fullDayEndTime"), "07:00"),
      dayStartTime: timeValue(formData.get("dayStartTime"), "08:00"),
      dayEndTime: timeValue(formData.get("dayEndTime"), "16:00"),
      nightStartTime: timeValue(formData.get("nightStartTime"), "16:00"),
      nightEndTime: timeValue(formData.get("nightEndTime"), "06:00"),
      minReservationHours: optionalPositiveInt(formData.get("minReservationHours")),
      maxReservationDays: optionalPositiveInt(formData.get("maxReservationDays")),
      bookingPhone: optionalString(formData.get("bookingPhone")),
      bookingEmail: optionalString(formData.get("bookingEmail")),
      bookingRules: optionalString(formData.get("bookingRules")),
      confirmationMessage: optionalString(formData.get("confirmationMessage")),
      // Public online booking and payments are deliberately outside this version.
      isOnlineBookingEnabled: false,
      requiresOwnerConfirmation: true,
      requiresDeposit: false,
      depositAmount: null,
    };

    await prisma.lakeBookingSettings.upsert({
      where: { lakeId: access.lakeId },
      create: {
        lakeId: access.lakeId,
        ...values,
      },
      update: values,
    });

    revalidatePath(`/moje-lowiska/${slug}`);
    revalidatePath(`/moje-lowiska/${slug}/rezerwacje`);
    revalidatePath(`/moje-lowiska/${slug}/rezerwacje/ustawienia`);

    redirect(`/moje-lowiska/${slug}/rezerwacje/ustawienia?saved=1`);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <OwnerLakeNav
          slug={lake.slug}
          lakeName={lake.name}
          canEditLake={ownerLake.canEditLake}
          canManageReservations={ownerLake.canManageReservations}
          canManageSpots={ownerLake.canManageSpots}
        />

        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            Ustawienia rezerwacji
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Godziny i zasady
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Ustaw domyślne godziny, ograniczenia i informacje organizacyjne dla wewnętrznej obsługi rezerwacji przez właściciela.
          </p>
        </div>

        <form action={saveSettings} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <SettingsSection icon={<CalendarIcon className="h-5 w-5" />} title="Domyślna rezerwacja" description="Te godziny zostaną automatycznie ustawione przy dodawaniu nowej rezerwacji z kalendarza.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TimeField name="defaultStartTime" label="Przyjazd" defaultValue={settings?.defaultStartTime ?? "12:00"} />
                <TimeField name="defaultEndTime" label="Wyjazd" defaultValue={settings?.defaultEndTime ?? "10:00"} />
              </div>
            </SettingsSection>

            <SettingsSection icon={<CardsIcon className="h-5 w-5" />} title="Gotowe przedziały" description="Godziny do wykorzystania przy późniejszym szybkim wyborze: doba, dzień lub noc.">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <TimePair label="Doba" startName="fullDayStartTime" endName="fullDayEndTime" start={settings?.fullDayStartTime ?? "06:00"} end={settings?.fullDayEndTime ?? "07:00"} />
                <TimePair label="Dzień" startName="dayStartTime" endName="dayEndTime" start={settings?.dayStartTime ?? "08:00"} end={settings?.dayEndTime ?? "16:00"} />
                <TimePair label="Noc" startName="nightStartTime" endName="nightEndTime" start={settings?.nightStartTime ?? "16:00"} end={settings?.nightEndTime ?? "06:00"} />
              </div>
            </SettingsSection>

            <SettingsSection icon={<SettingsIcon className="h-5 w-5" />} title="Ograniczenia" description="Opcjonalne zasady pomagające utrzymać porządek przy tworzeniu rezerwacji.">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField name="minReservationHours" label="Minimalna liczba godzin" defaultValue={settings?.minReservationHours ?? ""} placeholder="np. 6" />
                <NumberField name="maxReservationDays" label="Maksymalna liczba dni" defaultValue={settings?.maxReservationDays ?? ""} placeholder="np. 14" />
              </div>
            </SettingsSection>

            <SettingsSection icon={<UserIcon className="h-5 w-5" />} title="Kontakt i informacje" description="Dane pomocnicze dla osób obsługujących rezerwacje.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField name="bookingPhone" label="Telefon rezerwacyjny" defaultValue={settings?.bookingPhone ?? ""} />
                <TextField name="bookingEmail" label="E-mail rezerwacyjny" defaultValue={settings?.bookingEmail ?? ""} type="email" />
              </div>
              <label className="mt-4 block">
                <FieldLabel>Zasady rezerwacji</FieldLabel>
                <textarea name="bookingRules" defaultValue={settings?.bookingRules ?? ""} rows={5} className="owner-input resize-none" placeholder="Najważniejsze zasady organizacyjne..." />
              </label>
              <label className="mt-4 block">
                <FieldLabel>Domyślna wiadomość / informacja</FieldLabel>
                <textarea name="confirmationMessage" defaultValue={settings?.confirmationMessage ?? ""} rows={4} className="owner-input resize-none" placeholder="np. Prosimy o kontakt dzień przed przyjazdem..." />
              </label>
            </SettingsSection>
          </div>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[26px] bg-slate-950 p-5 text-white shadow-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">Prosty system</p>
              <div className="mt-2 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-blue-300" />
                <h2 className="text-xl font-bold tracking-tight">Jak działa ten moduł</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                W panelu zapisujesz termin, klienta, stanowisko i status pobytu. Najważniejsze działania są dostępne bez przechodzenia przez wiele ekranów.
              </p>

              <div className="mt-5 space-y-2.5 text-xs font-medium text-slate-300">
                <p className="flex items-center gap-2"><span className="shrink-0 text-sm font-bold text-emerald-300">✓</span>Rezerwacje telefoniczne i ręczne</p>
                <p className="flex items-center gap-2"><span className="shrink-0 text-sm font-bold text-emerald-300">✓</span>Blokady całego łowiska</p>
                <p className="flex items-center gap-2"><span className="shrink-0 text-sm font-bold text-emerald-300">✓</span>Zawody i wydarzenia</p>
                <p className="flex items-center gap-2"><span className="shrink-0 text-sm font-bold text-emerald-300">✓</span>Wykrywanie konfliktów terminów</p>
                <p className="flex items-center gap-2"><span className="shrink-0 text-sm font-bold text-emerald-300">✓</span>Historia anulowanych rezerwacji</p>
              </div>

              <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
                <SettingsIcon className="h-4 w-4" />
                Zapisz ustawienia
              </button>
            </div>
          </aside>
        </form>

        <style>{`
          .owner-input {
            margin-top: .45rem;
            min-height: 2.9rem;
            width: 100%;
            border-radius: .9rem;
            border: 1px solid rgb(226 232 240);
            background: white;
            padding: .72rem .9rem;
            font-size: .875rem;
            font-weight: 650;
            color: rgb(15 23 42);
            outline: none;
          }
          .owner-input:focus {
            border-color: rgb(59 130 246);
            box-shadow: 0 0 0 3px rgb(219 234 254);
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200/80 sm:p-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold text-slate-600">{children}</span>;
}

function TimeField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input type="time" name={name} defaultValue={defaultValue} className="owner-input" />
    </label>
  );
}

function TimePair({ label, startName, endName, start, end }: { label: string; startName: string; endName: string; start: string; end: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <TimeField name={startName} label="Od" defaultValue={start} />
        <TimeField name={endName} label="Do" defaultValue={end} />
      </div>
    </div>
  );
}

function TextField({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input type={type} name={name} defaultValue={defaultValue} className="owner-input" />
    </label>
  );
}

function NumberField({ name, label, defaultValue, placeholder }: { name: string; label: string; defaultValue: string | number; placeholder: string }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input type="number" min="1" name={name} defaultValue={defaultValue} placeholder={placeholder} className="owner-input" />
    </label>
  );
}

function timeValue(value: FormDataEntryValue | null, fallback: string) {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value) ? value : fallback;
}

function optionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalPositiveInt(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}