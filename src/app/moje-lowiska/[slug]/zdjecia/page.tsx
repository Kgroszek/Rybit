import {
  notFound,
  redirect,
} from "next/navigation";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OwnerLakeNav } from "@/components/owner/OwnerLakeNav";
import { OwnerLakeImagesManager } from "@/components/owner/profile/OwnerLakeImagesManager";
import { OwnerNoEditAccess } from "@/components/owner/profile/OwnerNoEditAccess";
import { OwnerProfileNotice } from "@/components/owner/profile/OwnerProfileNotice";
import { OwnerProfileTabs } from "@/components/owner/profile/OwnerProfileTabs";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getOwnerLakeImagesContext,
} from "@/lib/owner/profile-query";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OwnerLakeImagesPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    uploaded?: string | string[];
    deleted?: string | string[];
    reordered?: string | string[];
    primary?: string | string[];
    error?: string | string[];
  }>;
};

export default async function OwnerLakeImagesPage({
  params,
  searchParams,
}: OwnerLakeImagesPageProps) {
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
    await getOwnerLakeImagesContext(
      user.id,
      slug
    );

  if (!ownerLake) {
    notFound();
  }

  const lake = ownerLake.lake;

  const notice =
    getImagesNotice(query);

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
          title="Zdjęcia"
          description="Dodawaj aktualne zdjęcia, ustawiaj ich kolejność i wybieraj zdjęcie główne widoczne na publicznym profilu."
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

        {notice && (
          <OwnerProfileNotice
            variant={notice.variant}
            title={notice.title}
            description={
              notice.description
            }
          />
        )}

        {ownerLake.canEditLake ? (
          <OwnerLakeImagesManager
            lakeId={lake.id}
            lakeSlug={lake.slug}
            lakeName={lake.name}
            images={lake.images.map(
              (image) => ({
                id: image.id,
                url: image.url,
                sortOrder:
                  image.sortOrder,
                createdAt:
                  image.createdAt.toISOString(),
              })
            )}
          />
        ) : (
          <OwnerNoEditAccess
            slug={lake.slug}
            resourceLabel="zdjęć tego łowiska"
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

function getImagesNotice(
  query: NonNullable<
    OwnerLakeImagesPageProps["searchParams"]
  > extends Promise<infer T>
    ? T
    : never
) {
  if (getParam(query.uploaded) === "1") {
    return {
      variant: "success" as const,
      title:
        "Zdjęcie zostało przesłane",
      description:
        "Galeria łowiska została zaktualizowana.",
    };
  }

  if (getParam(query.deleted) === "1") {
    return {
      variant: "success" as const,
      title:
        "Zdjęcie zostało usunięte",
      description:
        "Zdjęcie zniknęło z galerii, a kolejność pozostałych została uporządkowana.",
    };
  }

  if (
    getParam(query.primary) === "1"
  ) {
    return {
      variant: "success" as const,
      title:
        "Zdjęcie główne zostało zmienione",
      description:
        "Wybrane zdjęcie jest teraz pierwszym zdjęciem publicznego profilu.",
    };
  }

  if (
    getParam(query.reordered) === "1"
  ) {
    return {
      variant: "success" as const,
      title:
        "Kolejność zdjęć została zmieniona",
      description:
        "Galeria publicznego profilu korzysta z nowej kolejności.",
    };
  }

  const error = getParam(query.error);

  if (!error) {
    return null;
  }

  return {
    variant: "danger" as const,
    title:
      "Nie udało się wykonać akcji",
    description:
      getImagesErrorMessage(error),
  };
}

function getImagesErrorMessage(
  error: string
) {
  if (error === "no-file") {
    return "Wybierz zdjęcie do przesłania.";
  }

  if (error === "file-type") {
    return "Nieobsługiwany format pliku. Dodaj zdjęcie JPG, PNG, WEBP albo AVIF.";
  }

  if (error === "file-size") {
    return "Plik jest za duży. Maksymalny rozmiar zdjęcia to 8 MB.";
  }

  if (error === "upload") {
    return "Nie udało się przesłać zdjęcia do magazynu plików.";
  }

  if (error === "database") {
    return "Plik został przesłany, ale nie udało się zapisać zdjęcia w bazie danych.";
  }

  if (error === "not-found") {
    return "Nie znaleziono wskazanego zdjęcia.";
  }

  return "Spróbuj ponownie za chwilę.";
}
