import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const LAKE_IMAGES_BUCKET = "lake-images";
const MAX_IMAGE_SIZE_IN_BYTES = 8 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

type OwnerLakeImagesPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    uploaded?: string | string[];
    deleted?: string | string[];
    reordered?: string | string[];
    error?: string | string[];
  }>;
};

export default async function OwnerLakeImagesPage({
  params,
  searchParams,
}: OwnerLakeImagesPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const uploaded = getSearchParamValue(resolvedSearchParams.uploaded) === "1";
  const deleted = getSearchParamValue(resolvedSearchParams.deleted) === "1";
  const reordered =
    getSearchParamValue(resolvedSearchParams.reordered) === "1";
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
          images: {
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
            select: {
              id: true,
              url: true,
              imagePath: true,
              sortOrder: true,
              createdAt: true,
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
              Zdjęcia łowiska
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Dodawaj, usuwaj i ustawiaj kolejność zdjęć widocznych na
              publicznym profilu łowiska. Pierwsze zdjęcie w kolejności jest
              traktowane jako zdjęcie główne.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
            <Link
              href={`/moje-lowiska/${lake.slug}/edytuj`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Edytuj dane
            </Link>

            <Link
              href={`/lowiska-w-polsce/${lake.slug}`}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-700"
            >
              Podgląd publiczny
            </Link>
          </div>
        </div>

        {uploaded && (
          <Alert
            variant="success"
            title="Zdjęcie zostało przesłane"
            description="Galeria łowiska została zaktualizowana."
          />
        )}

        {deleted && (
          <Alert
            variant="success"
            title="Zdjęcie zostało usunięte"
            description="Zdjęcie zostało usunięte z galerii łowiska."
          />
        )}

        {reordered && (
          <Alert
            variant="success"
            title="Kolejność zdjęć została zmieniona"
            description="Pierwsze zdjęcie w galerii jest teraz zdjęciem głównym łowiska."
          />
        )}

        {error && (
          <Alert
            variant="danger"
            title="Nie udało się wykonać akcji"
            description={getErrorMessage(error)}
          />
        )}

        {!ownerLake.canEditLake ? (
          <NoEditAccessCard lakeSlug={lake.slug} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Galeria zdjęć
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Liczba zdjęć:{" "}
                    <span className="font-black text-slate-700">
                      {lake.images.length}
                    </span>
                  </p>
                </div>

                <Link
                  href="/moje-lowiska"
                  className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Wróć do moich łowisk
                </Link>
              </div>

              {lake.images.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {lake.images.map((image, index) => {
                    const isFirst = index === 0;
                    const isLast = index === lake.images.length - 1;

                    return (
                      <article
                        key={image.id}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="relative h-52 bg-slate-100">
                          <img
                            src={image.url}
                            alt={`${lake.name} - zdjęcie ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          {isFirst ? (
                            <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-sm">
                              Zdjęcie główne
                            </span>
                          ) : (
                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">
                              #{index + 1}
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-xs font-bold text-slate-400">
                            Dodano: {formatDate(image.createdAt)}
                          </p>

                          <div className="mt-4 grid gap-2">
                            <form
                              action={reorderLakeImage}
                              className="grid grid-cols-2 gap-2"
                            >
                              <input
                                type="hidden"
                                name="lakeId"
                                value={lake.id}
                              />

                              <input
                                type="hidden"
                                name="slug"
                                value={lake.slug}
                              />

                              <input
                                type="hidden"
                                name="imageId"
                                value={image.id}
                              />

                              <button
                                type="submit"
                                name="direction"
                                value="up"
                                disabled={isFirst}
                                className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                ↑ Wyżej
                              </button>

                              <button
                                type="submit"
                                name="direction"
                                value="down"
                                disabled={isLast}
                                className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                ↓ Niżej
                              </button>
                            </form>

                            <a
                              href={image.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
                            >
                              Otwórz zdjęcie
                            </a>

                            <form action={deleteLakeImage}>
                              <input
                                type="hidden"
                                name="lakeId"
                                value={lake.id}
                              />

                              <input
                                type="hidden"
                                name="slug"
                                value={lake.slug}
                              />

                              <input
                                type="hidden"
                                name="imageId"
                                value={image.id}
                              />

                              <button
                                type="submit"
                                className="w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                              >
                                Usuń zdjęcie
                              </button>
                            </form>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-2xl font-black text-slate-950">
                    Brak zdjęć w galerii
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Prześlij pierwsze zdjęcie łowiska. Zdjęcia pomagają
                    wędkarzom szybciej ocenić miejsce, stanowiska i dojazd.
                  </p>
                </div>
              )}
            </section>

            <aside className="min-w-0 space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">
                  Prześlij zdjęcie
                </p>

                <h2 className="mt-3 break-words text-2xl font-black text-slate-950">
                  {lake.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Wybierz zdjęcie z telefonu lub komputera. Obsługiwane formaty:
                  JPG, PNG, WEBP i AVIF. Maksymalny rozmiar pliku to 8 MB.
                </p>

                <form
                  action={uploadLakeImage}
                  encType="multipart/form-data"
                  className="mt-5 space-y-4"
                >
                  <input type="hidden" name="lakeId" value={lake.id} />
                  <input type="hidden" name="slug" value={lake.slug} />

                  <div>
                    <label
                      htmlFor="image"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Plik zdjęcia
                    </label>

                    <input
                      id="image"
                      name="image"
                      type="file"
                      required
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-black file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    Prześlij zdjęcie
                  </button>
                </form>
              </section>

              <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <h2 className="text-xl font-black text-blue-950">
                  Zdjęcie główne
                </h2>

                <p className="mt-3 text-sm leading-6 text-blue-800">
                  Zdjęcie oznaczone jako główne będzie używane jako pierwsze w
                  galerii oraz powinno być pokazywane jako miniatura łowiska w
                  listach. Przesuń zdjęcie na samą górę, aby ustawić je jako
                  główne.
                </p>
              </section>

              <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <h2 className="text-xl font-black text-amber-950">
                  Jakie zdjęcia działają najlepiej?
                </h2>

                <div className="mt-4 space-y-3 text-sm leading-6 text-amber-800">
                  <p>✓ zdjęcia poziome w dobrej jakości,</p>
                  <p>✓ widok na wodę i stanowiska,</p>
                  <p>✓ zdjęcia pomostów, parkingu i zaplecza,</p>
                  <p>✓ aktualne zdjęcia bez dużej ilości tekstu na grafice.</p>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

async function uploadLakeImage(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");

  if (!lakeId || !slug) {
    redirect("/moje-lowiska");
  }

  const returnPath = `/moje-lowiska/${slug}/zdjecia`;

  const imageFile = formData.get("image");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    redirect(`${returnPath}?error=no-file`);
  }

  if (!allowedImageTypes.includes(imageFile.type)) {
    redirect(`${returnPath}?error=file-type`);
  }

  if (imageFile.size > MAX_IMAGE_SIZE_IN_BYTES) {
    redirect(`${returnPath}?error=file-size`);
  }

  const ownerLake = await getEditableOwnerLake(lakeId);

  const extension = getImageExtension(imageFile.type);
  const imagePath = `lakes/${
    ownerLake.lake.id
  }/${Date.now()}-${randomUUID()}.${extension}`;

  const lastImage = await prisma.lakeImage.findFirst({
    where: {
      lakeId: ownerLake.lake.id,
    },
    orderBy: [
      {
        sortOrder: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      sortOrder: true,
    },
  });

  const sortOrder = (lastImage?.sortOrder ?? -1) + 1;

  const supabaseAdmin = createAdminClient();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(LAKE_IMAGES_BUCKET)
    .upload(imagePath, imageFile, {
      cacheControl: "31536000",
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    redirect(`${returnPath}?error=upload`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(LAKE_IMAGES_BUCKET).getPublicUrl(imagePath);

  try {
    await prisma.lakeImage.create({
      data: {
        lakeId: ownerLake.lake.id,
        url: publicUrl,
        imagePath,
        sortOrder,
      },
    });
  } catch {
    await supabaseAdmin.storage.from(LAKE_IMAGES_BUCKET).remove([imagePath]);
    redirect(`${returnPath}?error=database`);
  }

  revalidateLakeImagePaths(ownerLake.lake.slug);

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/zdjecia?uploaded=1`);
}

async function reorderLakeImage(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const imageId = getString(formData, "imageId");
  const direction = getString(formData, "direction");

  if (!lakeId || !slug || !imageId) {
    redirect("/moje-lowiska");
  }

  if (direction !== "up" && direction !== "down") {
    redirect(`/moje-lowiska/${slug}/zdjecia`);
  }

  const ownerLake = await getEditableOwnerLake(lakeId);

  const images = await prisma.lakeImage.findMany({
    where: {
      lakeId: ownerLake.lake.id,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
    },
  });

  const currentIndex = images.findIndex((image) => image.id === imageId);

  if (currentIndex === -1) {
    redirect(`/moje-lowiska/${ownerLake.lake.slug}/zdjecia?error=not-found`);
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= images.length) {
    redirect(`/moje-lowiska/${ownerLake.lake.slug}/zdjecia`);
  }

  const reorderedImages = [...images];

  [reorderedImages[currentIndex], reorderedImages[targetIndex]] = [
    reorderedImages[targetIndex],
    reorderedImages[currentIndex],
  ];

  await saveImagesOrder(reorderedImages);

  revalidateLakeImagePaths(ownerLake.lake.slug);

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/zdjecia?reordered=1`);
}

async function deleteLakeImage(formData: FormData) {
  "use server";

  const lakeId = getString(formData, "lakeId");
  const slug = getString(formData, "slug");
  const imageId = getString(formData, "imageId");

  if (!lakeId || !slug || !imageId) {
    redirect("/moje-lowiska");
  }

  const ownerLake = await getEditableOwnerLake(lakeId);

  const image = await prisma.lakeImage.findFirst({
    where: {
      id: imageId,
      lakeId: ownerLake.lake.id,
    },
    select: {
      id: true,
      imagePath: true,
    },
  });

  if (!image) {
    redirect(`/moje-lowiska/${ownerLake.lake.slug}/zdjecia?error=not-found`);
  }

  await prisma.lakeImage.delete({
    where: {
      id: image.id,
    },
  });

  if (image.imagePath) {
    const supabaseAdmin = createAdminClient();

    await supabaseAdmin.storage
      .from(LAKE_IMAGES_BUCKET)
      .remove([image.imagePath]);
  }

  const remainingImages = await prisma.lakeImage.findMany({
    where: {
      lakeId: ownerLake.lake.id,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
    },
  });

  await saveImagesOrder(remainingImages);

  revalidateLakeImagePaths(ownerLake.lake.slug);

  redirect(`/moje-lowiska/${ownerLake.lake.slug}/zdjecia?deleted=1`);
}

async function getEditableOwnerLake(lakeId: string) {
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

  return ownerLake;
}

async function saveImagesOrder(images: { id: string }[]) {
  if (images.length === 0) {
    return;
  }

  await prisma.$transaction(
    images.map((image, index) =>
      prisma.lakeImage.update({
        where: {
          id: image.id,
        },
        data: {
          sortOrder: index,
        },
      })
    )
  );
}

function revalidateLakeImagePaths(slug: string) {
  revalidatePath("/moje-lowiska");
  revalidatePath(`/moje-lowiska/${slug}/zdjecia`);
  revalidatePath(`/moje-lowiska/${slug}/edytuj`);
  revalidatePath(`/lowiska-w-polsce/${slug}`);
  revalidatePath("/lowiska-w-polsce");
}

function NoEditAccessCard({ lakeSlug }: { lakeSlug: string }) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">
        Brak uprawnień edycji
      </p>

      <h2 className="mt-3 text-2xl font-black text-amber-950">
        Nie możesz zarządzać zdjęciami tego łowiska
      </h2>

      <p className="mt-3 text-sm leading-6 text-amber-800">
        Twoje konto jest przypisane do tego łowiska, ale nie ma aktywnego
        uprawnienia do edycji zdjęć. Skontaktuj się z administracją Rybio.
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

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getImageExtension(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "image/avif") {
    return "avif";
  }

  return "jpg";
}

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

function getErrorMessage(error: string) {
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
    return "Nie udało się przesłać zdjęcia do Storage. Sprawdź bucket lake-images i klucz SUPABASE_SERVICE_ROLE_KEY.";
  }

  if (error === "database") {
    return "Zdjęcie zostało przesłane, ale nie udało się zapisać go w bazie danych.";
  }

  if (error === "not-found") {
    return "Nie znaleziono zdjęcia.";
  }

  return "Spróbuj ponownie za chwilę.";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}