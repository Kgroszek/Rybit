import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const siteUrl = "https://rybio.pl";

type ClaimLakePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    success?: string | string[];
    owner?: string | string[];
    updated?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: ClaimLakePageProps): Promise<Metadata> {
  const { slug } = await params;

  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    select: {
      name: true,
      slug: true,
      city: true,
      voivodeship: true,
    },
  });

  if (!lake) {
    return {
      title: "Przejmij profil łowiska | Rybio",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    metadataBase: new URL(siteUrl),
    title: `Przejmij profil łowiska ${lake.name} | Rybio`,
    description: `Jesteś właścicielem łowiska ${lake.name}? Wyślij zgłoszenie i przejmij profil łowiska w Rybio, aby zarządzać opisem, zdjęciami, kontaktem, cennikiem i regulaminem.`,
    alternates: {
      canonical: `/lowiska-w-polsce/${lake.slug}/przejmij`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ClaimLakePage({
  params,
  searchParams,
}: ClaimLakePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const success = getSearchParamValue(resolvedSearchParams.success) === "1";
  const owner = getSearchParamValue(resolvedSearchParams.owner) === "1";
  const updated = getSearchParamValue(resolvedSearchParams.updated) === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      street: true,
      city: true,
      postalCode: true,
      voivodeship: true,
      contactName: true,
      contactPhone: true,
      contactEmail: true,
      contactWebsite: true,
    },
  });

  if (!lake) {
    notFound();
  }

  const existingOwner = user
    ? await prisma.lakeOwner.findFirst({
        where: {
          lakeId: lake.id,
          userId: user.id,
          isActive: true,
        },
        select: {
          id: true,
        },
      })
    : null;

  const existingClaim = user
    ? await prisma.lakeOwnerClaim.findFirst({
        where: {
          lakeId: lake.id,
          userId: user.id,
          status: {
            in: ["pending", "approved"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          claimantName: true,
          claimantPhone: true,
          claimantRole: true,
          message: true,
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader subtitle="Przejmij profil łowiska" />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-4xl">
            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="inline-flex text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              ← Wróć do profilu łowiska
            </Link>

            <p className="mt-8 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
              Dla właściciela łowiska
            </p>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Przejmij profil łowiska {lake.name}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Wyślij zgłoszenie, jeśli jesteś właścicielem, administratorem albo
              osobą odpowiedzialną za to łowisko. Po zatwierdzeniu przez Rybio
              otrzymasz możliwość zarządzania profilem łowiska.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div className="min-w-0">
          {success && (
            <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-lg font-black text-emerald-950">
                Zgłoszenie zostało wysłane
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Dziękujemy. Sprawdzimy zgłoszenie i po pozytywnej weryfikacji
                nadamy dostęp do zarządzania profilem łowiska.
              </p>
            </div>
          )}

          {updated && (
            <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-lg font-black text-blue-950">
                Zgłoszenie zostało zaktualizowane
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Masz już aktywne zgłoszenie dla tego łowiska, dlatego
                zaktualizowaliśmy jego dane zamiast tworzyć duplikat.
              </p>
            </div>
          )}

          {owner && (
            <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-lg font-black text-emerald-950">
                Masz już dostęp do tego łowiska
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Twoje konto jest już przypisane jako właściciel tego łowiska.
                W kolejnym etapie dodamy panel edycji danych i rezerwacji.
              </p>
            </div>
          )}

          {!user ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                Logowanie wymagane
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Zaloguj się, aby przejąć profil łowiska
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Zgłoszenia właścicieli muszą być przypisane do konta w Rybio.
                Dzięki temu po zatwierdzeniu będziemy mogli nadać dostęp do
                edycji właściwej osobie.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/login?redirect=/lowiska-w-polsce/${lake.slug}/przejmij`}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Zaloguj się
                </Link>

                <Link
                  href={`/register?redirect=/lowiska-w-polsce/${lake.slug}/przejmij`}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Załóż konto
                </Link>
              </div>
            </div>
          ) : existingOwner ? (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">
                Dostęp aktywny
              </p>

              <h2 className="mt-3 text-2xl font-black text-emerald-950">
                Jesteś już przypisany do tego łowiska
              </h2>

              <p className="mt-3 leading-7 text-emerald-800">
                Twoje konto ma już aktywny dostęp właścicielski do tego profilu.
                Następny krok to panel edycji łowiska i system rezerwacji.
              </p>

              <Link
                href={`/lowiska-w-polsce/${lake.slug}`}
                className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                Wróć do profilu łowiska
              </Link>
            </div>
          ) : existingClaim ? (
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                Zgłoszenie w trakcie
              </p>

              <h2 className="mt-3 text-2xl font-black text-blue-950">
                Masz już zgłoszenie dla tego łowiska
              </h2>

              <p className="mt-3 leading-7 text-blue-800">
                Twoje zgłoszenie ma obecnie status:{" "}
                <span className="font-black">
                  {getClaimStatusLabel(existingClaim.status)}
                </span>
                . Możesz zaktualizować dane zgłoszenia poniżej, jeśli chcesz
                dopisać dodatkowe informacje.
              </p>

              <ClaimForm
                lakeSlug={lake.slug}
                userEmail={user.email || ""}
                defaultName={existingClaim.claimantName || ""}
                defaultPhone={existingClaim.claimantPhone || ""}
                defaultRole={existingClaim.claimantRole || "owner"}
                defaultMessage={existingClaim.message || ""}
                submitLabel="Zaktualizuj zgłoszenie"
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
                Formularz zgłoszenia
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950">
                Potwierdź, że zarządzasz tym łowiskiem
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Uzupełnij dane kontaktowe. Zgłoszenie trafi do administracji
                Rybio i zostanie sprawdzone przed nadaniem dostępu.
              </p>

              <ClaimForm
                lakeSlug={lake.slug}
                userEmail={user.email || ""}
                defaultName={user.user_metadata?.full_name || ""}
                defaultPhone=""
                defaultRole="owner"
                defaultMessage=""
                submitLabel="Wyślij zgłoszenie"
              />
            </div>
          )}
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
              Łowisko
            </p>

            <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
              {lake.name}
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <InfoRow label="Adres" value={lake.street} />
              <InfoRow
                label="Miejscowość"
                value={`${lake.postalCode} ${lake.city}`}
              />
              <InfoRow label="Województwo" value={lake.voivodeship} />
              <InfoRow label="Kontakt" value={lake.contactName} />
              <InfoRow label="Telefon" value={lake.contactPhone} />
              <InfoRow label="E-mail" value={lake.contactEmail} />
              <InfoRow label="Strona" value={lake.contactWebsite} />
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-blue-950">
              Co zyskasz po zatwierdzeniu?
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-6 text-blue-800">
              <p>✓ możliwość edycji danych łowiska,</p>
              <p>✓ aktualizację opisu, cennika i regulaminu,</p>
              <p>✓ dodawanie i usuwanie zdjęć,</p>
              <p>✓ poprawianie kontaktu i godzin otwarcia,</p>
              <p>✓ dostęp do przyszłego panelu rezerwacji.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
            <h2 className="text-xl font-black text-amber-950">
              Dlaczego sprawdzamy zgłoszenia?
            </h2>

            <p className="mt-3 text-sm leading-6 text-amber-800">
              Dostęp do edycji profilu łowiska może otrzymać tylko właściciel
              lub osoba uprawniona. Dzięki temu dane w Rybio pozostają
              wiarygodne i bezpieczne.
            </p>
          </section>
        </aside>
      </section>

      <PublicFooter />
    </main>
  );
}

function ClaimForm({
  lakeSlug,
  userEmail,
  defaultName,
  defaultPhone,
  defaultRole,
  defaultMessage,
  submitLabel,
}: {
  lakeSlug: string;
  userEmail: string;
  defaultName: string;
  defaultPhone: string;
  defaultRole: string;
  defaultMessage: string;
  submitLabel: string;
}) {
  return (
    <form action={submitLakeOwnerClaim} className="mt-6 space-y-5">
      <input type="hidden" name="slug" value={lakeSlug} />

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          E-mail konta
        </label>

        <input
          value={userEmail}
          disabled
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500 outline-none"
        />

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Zgłoszenie zostanie przypisane do aktualnie zalogowanego konta.
        </p>
      </div>

      <div>
        <label
          htmlFor="claimantName"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Imię i nazwisko
        </label>

        <input
          id="claimantName"
          name="claimantName"
          defaultValue={defaultName}
          required
          maxLength={120}
          placeholder="np. Jan Kowalski"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>

      <div>
        <label
          htmlFor="claimantPhone"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Telefon kontaktowy
        </label>

        <input
          id="claimantPhone"
          name="claimantPhone"
          defaultValue={defaultPhone}
          required
          maxLength={40}
          placeholder="np. 500 000 000"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>

      <div>
        <label
          htmlFor="claimantRole"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Twoja rola przy łowisku
        </label>

        <select
          id="claimantRole"
          name="claimantRole"
          defaultValue={defaultRole}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        >
          <option value="owner">Właściciel</option>
          <option value="manager">Zarządca / administrator łowiska</option>
          <option value="employee">Pracownik łowiska</option>
          <option value="association">Przedstawiciel stowarzyszenia</option>
          <option value="other">Inna osoba uprawniona</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Wiadomość do administracji Rybio
        </label>

        <textarea
          id="message"
          name="message"
          defaultValue={defaultMessage}
          rows={6}
          maxLength={1200}
          placeholder="Napisz krótko, skąd możemy potwierdzić, że zarządzasz tym łowiskiem. Możesz podać stronę, Facebooka, numer telefonu lub inne informacje."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs leading-5 text-slate-500">
          Wysyłając zgłoszenie, potwierdzasz, że jesteś właścicielem lub osobą
          uprawnioną do zarządzania danym łowiskiem. Rybio może skontaktować się
          z Tobą w celu weryfikacji.
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}

async function submitLakeOwnerClaim(formData: FormData) {
  "use server";

  const slug = String(formData.get("slug") || "").trim();
  const claimantName = String(formData.get("claimantName") || "").trim();
  const claimantPhone = String(formData.get("claimantPhone") || "").trim();
  const claimantRole = String(formData.get("claimantRole") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!slug) {
    redirect("/lowiska-w-polsce");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/lowiska-w-polsce/${slug}/przejmij`);
  }

  const lake = await prisma.lake.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  if (!lake) {
    notFound();
  }

  const existingOwner = await prisma.lakeOwner.findFirst({
    where: {
      lakeId: lake.id,
      userId: user.id,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (existingOwner) {
    redirect(`/lowiska-w-polsce/${lake.slug}/przejmij?owner=1`);
  }

  const existingPendingClaim = await prisma.lakeOwnerClaim.findFirst({
    where: {
      lakeId: lake.id,
      userId: user.id,
      status: "pending",
    },
    select: {
      id: true,
    },
  });

  if (existingPendingClaim) {
    await prisma.lakeOwnerClaim.update({
      where: {
        id: existingPendingClaim.id,
      },
      data: {
        userEmail: user.email || null,
        claimantName,
        claimantPhone,
        claimantRole,
        message,
      },
    });

    revalidatePath(`/lowiska-w-polsce/${lake.slug}/przejmij`);
    redirect(`/lowiska-w-polsce/${lake.slug}/przejmij?updated=1`);
  }

  await prisma.lakeOwnerClaim.create({
    data: {
      lakeId: lake.id,
      userId: user.id,
      userEmail: user.email || null,
      claimantName,
      claimantPhone,
      claimantRole,
      message,
      status: "pending",
    },
  });

  revalidatePath(`/lowiska-w-polsce/${lake.slug}/przejmij`);
  redirect(`/lowiska-w-polsce/${lake.slug}/przejmij?success=1`);
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    return null;
  }

  return (
    <div className="border-b border-slate-100 pb-3 last:border-none last:pb-0">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-bold text-slate-800">
        {cleanValue}
      </p>
    </div>
  );
}

function getClaimStatusLabel(status: string) {
  if (status === "approved") {
    return "zatwierdzone";
  }

  if (status === "rejected") {
    return "odrzucone";
  }

  return "oczekuje na sprawdzenie";
}

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}