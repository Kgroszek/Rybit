export const MAX_LAKE_SUBMISSION_IMAGES =
  10;

export const MAX_LAKE_SUBMISSION_IMAGE_SIZE =
  5 * 1024 * 1024;

const MAX_IMAGE_DIMENSION =
  1600;

const COMPRESSED_IMAGE_QUALITY =
  0.82;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const HEIC_EXTENSIONS = [
  ".heic",
  ".heif",
];

export async function prepareLakeSubmissionImages(
  selectedFiles: File[],
  availableSlots: number
) {
  if (
    availableSlots <= 0
  ) {
    return {
      files: [] as File[],
      messages: [
        `Możesz dodać maksymalnie ${MAX_LAKE_SUBMISSION_IMAGES} zdjęć.`,
      ],
    };
  }

  const filesToProcess =
    selectedFiles.slice(
      0,
      availableSlots
    );

  const messages: string[] =
    [];

  const files: File[] = [];

  for (
    const file of
    filesToProcess
  ) {
    if (isHeicFile(file)) {
      messages.push(
        `${file.name} pominięto — format HEIC/HEIF nie jest obsługiwany. Zmień zdjęcie na JPG, PNG albo WEBP.`
      );
      continue;
    }

    if (
      !ALLOWED_IMAGE_TYPES.has(
        file.type
      )
    ) {
      messages.push(
        `${file.name} pominięto — dozwolone są tylko JPG, PNG albo WEBP.`
      );
      continue;
    }

    try {
      const compressed =
        await compressImageFile(
          file
        );

      if (
        compressed.size >
        MAX_LAKE_SUBMISSION_IMAGE_SIZE
      ) {
        messages.push(
          `${file.name} pominięto — zdjęcie po kompresji nadal ma więcej niż 5 MB.`
        );
        continue;
      }

      files.push(
        compressed
      );
    } catch {
      messages.push(
        `${file.name} pominięto — nie udało się przetworzyć zdjęcia.`
      );
    }
  }

  if (
    selectedFiles.length >
    availableSlots
  ) {
    messages.push(
      `Dodano maksymalnie ${availableSlots} zdjęć, ponieważ limit wynosi ${MAX_LAKE_SUBMISSION_IMAGES}.`
    );
  }

  return {
    files,
    messages,
  };
}

export function formatLakeSubmissionFileSize(
  bytes: number
) {
  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.round(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function isHeicFile(
  file: File
) {
  const name =
    file.name.toLowerCase();

  return (
    HEIC_EXTENSIONS.some(
      (extension) =>
        name.endsWith(
          extension
        )
    ) ||
    file.type ===
      "image/heic" ||
    file.type ===
      "image/heif"
  );
}

async function compressImageFile(
  file: File
) {
  const image =
    await createImageFromFile(
      file
    );

  const dimensions =
    getResizedDimensions(
      image.naturalWidth,
      image.naturalHeight
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    dimensions.width;
  canvas.height =
    dimensions.height;

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    throw new Error(
      "Nie udało się przygotować kompresji zdjęcia."
    );
  }

  context.drawImage(
    image,
    0,
    0,
    dimensions.width,
    dimensions.height
  );

  const blob =
    await new Promise<Blob | null>(
      (resolve) => {
        canvas.toBlob(
          resolve,
          "image/jpeg",
          COMPRESSED_IMAGE_QUALITY
        );
      }
    );

  if (!blob) {
    throw new Error(
      "Nie udało się skompresować zdjęcia."
    );
  }

  if (
    blob.size >= file.size &&
    file.size <=
      MAX_LAKE_SUBMISSION_IMAGE_SIZE
  ) {
    return file;
  }

  const cleanName =
    file.name.replace(
      /\.[^/.]+$/,
      ""
    );

  return new File(
    [blob],
    `${cleanName}.jpg`,
    {
      type: "image/jpeg",
      lastModified:
        Date.now(),
    }
  );
}

function createImageFromFile(
  file: File
) {
  return new Promise<HTMLImageElement>(
    (
      resolve,
      reject
    ) => {
      const image =
        new Image();

      const url =
        URL.createObjectURL(
          file
        );

      image.onload = () => {
        URL.revokeObjectURL(
          url
        );
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(
          url
        );
        reject(
          new Error(
            "Nie udało się odczytać zdjęcia."
          )
        );
      };

      image.src = url;
    }
  );
}

function getResizedDimensions(
  width: number,
  height: number
) {
  if (
    width <=
      MAX_IMAGE_DIMENSION &&
    height <=
      MAX_IMAGE_DIMENSION
  ) {
    return {
      width,
      height,
    };
  }

  const ratio =
    Math.min(
      MAX_IMAGE_DIMENSION /
        width,
      MAX_IMAGE_DIMENSION /
        height
    );

  return {
    width: Math.round(
      width * ratio
    ),
    height: Math.round(
      height * ratio
    ),
  };
}
