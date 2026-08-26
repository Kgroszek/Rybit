import { getMethodLabel } from "@/components/catches/utils";
import { getCatchCardTemplate } from "@/lib/catch-card-templates";

type GraphicCatchCardInput = {
  id: string;
  fishName: string;
  userName?: string | null;
  method: string;
  weight: number | null;
  length: number | null;
  score: number | null;
};

const PHOTO = {
  left: 18,
  top: 325,
  width: 1036,
  height: 1146,
};

const SCORE = {
  left: 822,
  top: 116,
  width: 180,
  height: 118,
};

const ANGLER = {
  left: 145,
  top: 1428,
  width: 528,
  height: 70,
};

const LENGTH = {
  left: 68,
  top: 1635,
  width: 175,
  height: 92,
};

const WEIGHT = {
  left: 404,
  top: 1635,
  width: 174,
  height: 92,
};

const METHOD = {
  left: 732,
  top: 1635,
  width: 270,
  height: 92,
};

export async function createGraphicCatchCardFile(
  input: GraphicCatchCardInput
) {
  const template = getCatchCardTemplate(input.fishName);

  if (!template) {
    throw new Error("Brak szablonu dla tego gatunku.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nie udało się przygotować karty.");
  }

  const photo = await fetchBitmap(
    `/api/catches/${encodeURIComponent(input.id)}/card-photo`
  );

  drawCover(context, photo, PHOTO);
  photo.close();

  const overlay = await fetchBitmap(template.publicPath);
  context.drawImage(overlay, 0, 0, template.width, template.height);
  overlay.close();

  drawFittedText(context, String(input.score ?? "—"), SCORE, 106, 72);
  drawFittedText(
    context,
    input.userName?.trim() || "Wędkarz Rybio",
    ANGLER,
    38,
    22
  );
  drawFittedText(
    context,
    input.length !== null ? formatNumber(input.length, 0) : "—",
    LENGTH,
    48,
    28
  );
  drawFittedText(
    context,
    input.weight !== null ? formatNumber(input.weight, 2) : "—",
    WEIGHT,
    48,
    28
  );
  drawFittedText(
    context,
    getMethodLabel(input.method),
    METHOD,
    38,
    18
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Nie udało się wygenerować pliku PNG."));
          return;
        }

        resolve(result);
      },
      "image/png",
      1
    );
  });

  return new File(
    [blob],
    `rybio-${slugify(input.fishName)}-story.png`,
    { type: "image/png" }
  );
}

async function fetchBitmap(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      data && typeof data.message === "string"
        ? data.message
        : "Nie udało się pobrać obrazu.";

    throw new Error(message);
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("Pobrany plik nie jest obrazem.");
  }

  return createImageBitmap(blob);
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: ImageBitmap,
  box: {
    left: number;
    top: number;
    width: number;
    height: number;
  }
) {
  const scale = Math.max(
    box.width / image.width,
    box.height / image.height
  );

  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = box.left + (box.width - drawWidth) / 2;
  const drawY = box.top + (box.height - drawHeight) / 2;

  context.save();
  context.beginPath();
  context.rect(box.left, box.top, box.width, box.height);
  context.clip();
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  value: string,
  box: {
    left: number;
    top: number;
    width: number;
    height: number;
  },
  preferredSize: number,
  minimumSize: number
) {
  let size = preferredSize;

  while (size > minimumSize) {
    context.font = `italic 900 ${size}px Arial`;

    if (context.measureText(value).width <= box.width - 20) {
      break;
    }

    size -= 1;
  }

  context.save();
  context.font = `italic 900 ${size}px Arial`;
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    value,
    box.left + box.width / 2,
    box.top + box.height / 2
  );
  context.restore();
}

function formatNumber(value: number, decimals: number) {
  return value
    .toFixed(decimals)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(".", ",");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
