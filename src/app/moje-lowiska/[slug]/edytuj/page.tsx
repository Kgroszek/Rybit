import {
  notFound,
  redirect,
} from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { OwnerLakeProfileForm } from "@/components/owner/profile/OwnerLakeProfileForm";
import { OwnerNoEditAccess } from "@/components/owner/profile/OwnerNoEditAccess";
import { OwnerProfileNotice } from "@/components/owner/profile/OwnerProfileNotice";
import { OwnerProfileTabs } from "@/components/owner/profile/OwnerProfileTabs";
import {
  cleanPlaceholderValue,
} from "@/components/owner/profile/profile-utils";
import type {
  OwnerLakeProfileFormData,
} from "@/components/owner/profile/types";
import {
  ButtonLink,
} from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getOwnerLakeProfileContext,
} from "@/lib/owner/profile-query";
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

export default async function OwnerLakeEditPage({
  params,
  searchParams,
}: OwnerLakeEditPageProps) {
  const { slug } = await params;
  const query = searchParams
    ? await searchParams
    : {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake =
    await getOwnerLakeProfileContext(
      user.id,
      slug
    );

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;

  const profileData:
    OwnerLakeProfileFormData = {
      id: lake.id,
      slug: lake.slug,
      name: lake.name,
      description: lake.description,
      fish: lake.fish,
      ownerType: lake.ownerType,
      fishingType: lake.fishingType,

      street: lake.street,
      city: lake.city,
      postalCode: lake.postalCode,
      voivodeship: lake.voivodeship,
      lat: lake.lat,
      lng: lake.lng,

      area: cleanPlaceholderValue(
        lake.area
      ),
      averageDepth:
        cleanPlaceholderValue(
          lake.averageDepth
        ),
      bottomType:
        cleanPlaceholderValue(
          lake.bottomType
        ),
      waterType:
        cleanPlaceholderValue(
          lake.waterType
        ),

      priceListText:
        lake.priceListText ||
        lake.priceList
          .map((item) => item.text)
          .filter(
            (text) =>
              text !==
              "Brak dodanego cennika."
          )
          .join("\n"),
      priceListUrl:
        lake.priceListUrl || "",
      rulesText:
        lake.rulesText ||
        lake.rules
          .map((item) => item.text)
          .filter(
            (text) =>
              text !==
              "Brak dodanych zasad łowiska."
          )
          .join("\n"),
      rulesUrl:
        lake.rulesUrl || "",

      cottages: lake.cottages,
      campfire: lake.campfire,
      noKill: lake.noKill,
      tent: lake.tent,
      parking: lake.parking,
      pier: lake.pier,
      toilet: lake.toilet,
      shop: lake.shop,
      nightFishing:
        lake.nightFishing,
      boatRental: lake.boatRental,
      gearRental: lake.gearRental,
      shelter: lake.shelter,
      coveredSpots:
        lake.coveredSpots,
      playground: lake.playground,
      cardPayment: lake.cardPayment,

      contactName:
        cleanPlaceholderValue(
          lake.contactName
        ),
      contactPhone:
        cleanPlaceholderValue(
          lake.contactPhone
        ),
      contactEmail:
        cleanPlaceholderValue(
          lake.contactEmail
        ),
      contactWebsite:
        cleanPlaceholderValue(
          lake.contactWebsite
        ),

      imageCount: lake.images.length,
      fishSpeciesCount:
        lake.fishSpecies.length,
      rating: Number(
        lake.rating || 0
      ),
    };

  const saved =
    getParam(query.saved) === "1";
  const error = getParam(query.error);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <OwnerLakeNav
          slug={lake.slug}
          lakeName={lake.name}
          canEditLake={
            ownerLake.canEditLake
          }
          canManageReservations={
            ownerLake.canManageReservations
          }
          canManageSpots={
            ownerLake.canManageSpots
          }
        />

        <PageHeader
          eyebrow="Profil łowiska"
          title="Informacje"
          description="Zarządzaj danymi widocznymi na publicznym profilu łowiska. Formularz jest podzielony na krótkie, logiczne sekcje."
          actions={
            <ButtonLink
              href={`/lowiska-w-polsce/${lake.slug}`}
              variant="outline"
            >
              Profil publiczny
            </ButtonLink>
          }
        />

        <OwnerProfileTabs
          slug={lake.slug}
        />

        {saved && (
          <OwnerProfileNotice
            variant="success"
            title="Zmiany zostały zapisane"
            description="Publiczny profil łowiska został zaktualizowany."
          />
        )}

        {error && (
          <OwnerProfileNotice
            variant="danger"
            title="Nie udało się zapisać zmian"
            description={getProfileErrorMessage(
              error
            )}
          />
        )}

        {ownerLake.canEditLake ? (
          <OwnerLakeProfileForm
            lake={profileData}
          />
        ) : (
          <OwnerNoEditAccess
            slug={lake.slug}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function getParam(
  value: string | string[] | undefined
) {
  return Array.isArray(value)
    ? value[0] || ""
    : value || "";
}

function getProfileErrorMessage(
  error: string
) {
  if (error === "required") {
    return "Uzupełnij nazwę, opis, ryby oraz podstawowe dane adresowe.";
  }

  if (error === "length") {
    return "Jedno z pól przekracza dozwoloną długość.";
  }

  if (error === "coords") {
    return "Współrzędne muszą być poprawnymi liczbami.";
  }

  if (error === "coords-range") {
    return "Szerokość geograficzna musi mieścić się w zakresie -90–90, a długość -180–180.";
  }

  if (error === "email") {
    return "Sprawdź format adresu e-mail.";
  }

  return "Spróbuj ponownie za chwilę.";
}
