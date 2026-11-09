"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const LAKE_IMAGES_BUCKET =
  "lake-images";

const MAX_IMAGE_SIZE_IN_BYTES =
  8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function uploadLakeImage(
  formData: FormData
) {
  const lakeId = getString(
    formData,
    "lakeId"
  );
  const requestedSlug = getString(
    formData,
    "slug"
  );

  if (!lakeId || !requestedSlug) {
    redirect("/moje-lowiska");
  }

  const imageFile =
    formData.get("image");

  if (
    !(imageFile instanceof File) ||
    imageFile.size === 0
  ) {
    redirect(
      `/moje-lowiska/${requestedSlug}/zdjecia?error=no-file`
    );
  }

  if (
    !ALLOWED_IMAGE_TYPES.has(
      imageFile.type
    )
  ) {
    redirect(
      `/moje-lowiska/${requestedSlug}/zdjecia?error=file-type`
    );
  }

  if (
    imageFile.size >
    MAX_IMAGE_SIZE_IN_BYTES
  ) {
    redirect(
      `/moje-lowiska/${requestedSlug}/zdjecia?error=file-size`
    );
  }

  const ownerLake =
    await getEditableOwnerLake(lakeId);

  const slug = ownerLake.lake.slug;
  const extension =
    getImageExtension(imageFile.type);

  const imagePath = `lakes/${
    ownerLake.lake.id
  }/${Date.now()}-${randomUUID()}.${extension}`;

  const lastImage =
    await prisma.lakeImage.findFirst({
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

  const sortOrder =
    (lastImage?.sortOrder ?? -1) + 1;

  const supabaseAdmin =
    createAdminClient();

  const { error: uploadError } =
    await supabaseAdmin.storage
      .from(LAKE_IMAGES_BUCKET)
      .upload(
        imagePath,
        imageFile,
        {
          cacheControl: "31536000",
          contentType: imageFile.type,
          upsert: false,
        }
      );

  if (uploadError) {
    redirect(
      `/moje-lowiska/${slug}/zdjecia?error=upload`
    );
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from(LAKE_IMAGES_BUCKET)
    .getPublicUrl(imagePath);

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
    await supabaseAdmin.storage
      .from(LAKE_IMAGES_BUCKET)
      .remove([imagePath]);

    redirect(
      `/moje-lowiska/${slug}/zdjecia?error=database`
    );
  }

  revalidateLakeImagePaths(slug);

  redirect(
    `/moje-lowiska/${slug}/zdjecia?uploaded=1`
  );
}

export async function reorderLakeImage(
  formData: FormData
) {
  const lakeId = getString(
    formData,
    "lakeId"
  );
  const imageId = getString(
    formData,
    "imageId"
  );
  const direction = getString(
    formData,
    "direction"
  );

  if (!lakeId || !imageId) {
    redirect("/moje-lowiska");
  }

  const ownerLake =
    await getEditableOwnerLake(lakeId);

  const slug = ownerLake.lake.slug;

  if (
    direction !== "up" &&
    direction !== "down"
  ) {
    redirect(
      `/moje-lowiska/${slug}/zdjecia`
    );
  }

  const images =
    await getOrderedImageIds(
      ownerLake.lake.id
    );

  const currentIndex =
    images.findIndex(
      (image) =>
        image.id === imageId
    );

  if (currentIndex === -1) {
    redirect(
      `/moje-lowiska/${slug}/zdjecia?error=not-found`
    );
  }

  const targetIndex =
    direction === "up"
      ? currentIndex - 1
      : currentIndex + 1;

  if (
    targetIndex < 0 ||
    targetIndex >= images.length
  ) {
    redirect(
      `/moje-lowiska/${slug}/zdjecia`
    );
  }

  const reordered = [...images];

  [
    reordered[currentIndex],
    reordered[targetIndex],
  ] = [
    reordered[targetIndex],
    reordered[currentIndex],
  ];

  await saveImagesOrder(reordered);

  revalidateLakeImagePaths(slug);

  redirect(
    `/moje-lowiska/${slug}/zdjecia?reordered=1`
  );
}

export async function makeLakeImagePrimary(
  formData: FormData
) {
  const lakeId = getString(
    formData,
    "lakeId"
  );
  const imageId = getString(
    formData,
    "imageId"
  );

  if (!lakeId || !imageId) {
    redirect("/moje-lowiska");
  }

  const ownerLake =
    await getEditableOwnerLake(lakeId);

  const slug = ownerLake.lake.slug;

  const images =
    await getOrderedImageIds(
      ownerLake.lake.id
    );

  const currentIndex =
    images.findIndex(
      (image) =>
        image.id === imageId
    );

  if (currentIndex === -1) {
    redirect(
      `/moje-lowiska/${slug}/zdjecia?error=not-found`
    );
  }

  if (currentIndex === 0) {
    redirect(
      `/moje-lowiska/${slug}/zdjecia`
    );
  }

  const selected =
    images[currentIndex];

  const reordered = [
    selected,
    ...images.filter(
      (image) =>
        image.id !== selected.id
    ),
  ];

  await saveImagesOrder(reordered);

  revalidateLakeImagePaths(slug);

  redirect(
    `/moje-lowiska/${slug}/zdjecia?primary=1`
  );
}

export async function deleteLakeImage(
  formData: FormData
) {
  const lakeId = getString(
    formData,
    "lakeId"
  );
  const imageId = getString(
    formData,
    "imageId"
  );

  if (!lakeId || !imageId) {
    redirect("/moje-lowiska");
  }

  const ownerLake =
    await getEditableOwnerLake(lakeId);

  const slug = ownerLake.lake.slug;

  const image =
    await prisma.lakeImage.findFirst({
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
    redirect(
      `/moje-lowiska/${slug}/zdjecia?error=not-found`
    );
  }

  await prisma.lakeImage.delete({
    where: {
      id: image.id,
    },
  });

  if (image.imagePath) {
    const supabaseAdmin =
      createAdminClient();

    await supabaseAdmin.storage
      .from(LAKE_IMAGES_BUCKET)
      .remove([image.imagePath]);
  }

  const remainingImages =
    await getOrderedImageIds(
      ownerLake.lake.id
    );

  await saveImagesOrder(
    remainingImages
  );

  revalidateLakeImagePaths(slug);

  redirect(
    `/moje-lowiska/${slug}/zdjecia?deleted=1`
  );
}

async function getEditableOwnerLake(
  lakeId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ownerLake =
    await prisma.lakeOwner.findFirst({
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

async function getOrderedImageIds(
  lakeId: string
) {
  return prisma.lakeImage.findMany({
    where: {
      lakeId,
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
}

async function saveImagesOrder(
  images: { id: string }[]
) {
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

function revalidateLakeImagePaths(
  slug: string
) {
  revalidatePath("/moje-lowiska");
  revalidatePath(
    `/moje-lowiska/${slug}`
  );
  revalidatePath(
    `/moje-lowiska/${slug}/zdjecia`
  );
  revalidatePath(
    `/moje-lowiska/${slug}/edytuj`
  );
  revalidatePath(
    `/lowiska-w-polsce/${slug}`
  );
  revalidatePath("/lowiska-w-polsce");
}

function getString(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(key) || ""
  ).trim();
}

function getImageExtension(
  mimeType: string
) {
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
