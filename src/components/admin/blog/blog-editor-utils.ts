import type {
  BlogEditorSnapshot,
} from "@/components/admin/blog/BlogEditorTypes";

export const BLOG_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif";

export const BLOG_IMAGE_MAX_BYTES =
  8 * 1024 * 1024;

const BLOG_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

export function cloneBlogSnapshot(
  snapshot: BlogEditorSnapshot
): BlogEditorSnapshot {
  return JSON.parse(
    JSON.stringify(snapshot)
  ) as BlogEditorSnapshot;
}

export function blogSnapshotSignature(
  snapshot: BlogEditorSnapshot
) {
  return JSON.stringify(snapshot);
}

export async function uploadBlogImage(
  file: File
) {
  if (
    !BLOG_IMAGE_TYPES.has(
      file.type
    )
  ) {
    throw new Error(
      "Dozwolone formaty zdjęć: JPG, PNG, WEBP i AVIF."
    );
  }

  if (
    file.size >
    BLOG_IMAGE_MAX_BYTES
  ) {
    throw new Error(
      "Zdjęcie może mieć maksymalnie 8 MB."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "image",
    file
  );

  const response =
    await fetch(
      "/api/admin/blog/upload",
      {
        method: "POST",
        body: formData,
      }
    );

  const data =
    (await response
      .json()
      .catch(() => null)) as
      | {
          url?: string;
          message?: string;
        }
      | null;

  if (
    !response.ok ||
    !data?.url
  ) {
    throw new Error(
      data?.message ||
        "Nie udało się przesłać zdjęcia."
    );
  }

  return data.url;
}

export function toLocalDateTimeValue(
  value: string | null
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const pad = (
    number: number
  ) =>
    String(number).padStart(
      2,
      "0"
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
}

export function localDateTimeToIso(
  value: string
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}

export function createDefaultScheduleIso() {
  const date = new Date();

  date.setDate(
    date.getDate() + 1
  );

  date.setHours(
    8,
    0,
    0,
    0
  );

  return date.toISOString();
}
