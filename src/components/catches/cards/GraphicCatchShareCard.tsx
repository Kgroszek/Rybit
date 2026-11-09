import type { CatchShareData } from "@/lib/catch-sharing";
import { getMethodLabel } from "@/lib/catch-sharing";
import { resolveStoredCatchScore } from "@/lib/catch-score";

type GraphicCatchShareCardProps = {
  fishingCatch: CatchShareData;
  imageUrl: string | null;
  templateUrl: string;
};

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

// Pozycje są dopasowane do szablonu 941 × 1672 px
// i przeskalowane do finalnego eksportu 1080 × 1920 px.
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

export function GraphicCatchShareCard({
  fishingCatch,
  imageUrl,
  templateUrl,
}: GraphicCatchShareCardProps) {
  const score = resolveStoredCatchScore(fishingCatch);

  const anglerName =
    fishingCatch.userName?.trim() || "Wędkarz Rybio";

  const length =
    fishingCatch.length !== null
      ? formatMeasurement(fishingCatch.length, 0)
      : "—";

  const weight =
    fishingCatch.weight !== null
      ? formatMeasurement(fishingCatch.weight, 2)
      : "—";

  const method = getMethodLabel(fishingCatch.method);
  const scoreValue = score.score !== null ? String(score.score) : "—";

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        overflow: "hidden",
        background: "#02070d",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PHOTO.left,
          top: PHOTO.top,
          width: PHOTO.width,
          height: PHOTO.height,
          display: "flex",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #07111f 0%, #0d2d54 58%, #07111f 100%)",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={fishingCatch.fishName}
            width={PHOTO.width}
            height={PHOTO.height}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.42)",
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: "5px",
            }}
          >
            RYBIO
          </div>
        )}
      </div>

      <img
        src={templateUrl}
        alt=""
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        style={{
          position: "absolute",
          inset: 0,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
      />

      <OverlayValue
        value={scoreValue}
        box={SCORE}
        fontSize={score.score === 100 ? 92 : 106}
        color="#ffffff"
      />

      <OverlayValue
        value={anglerName}
        box={ANGLER}
        fontSize={fitFontSize(anglerName, 38, 29, 21)}
        color="#ffffff"
      />

      <OverlayValue
        value={length}
        box={LENGTH}
        fontSize={48}
        color="#ffffff"
      />

      <OverlayValue
        value={weight}
        box={WEIGHT}
        fontSize={48}
        color="#ffffff"
      />

      <OverlayValue
        value={method}
        box={METHOD}
        fontSize={fitFontSize(method, 38, 27, 13)}
        color="#ffffff"
      />
    </div>
  );
}

function OverlayValue({
  value,
  box,
  fontSize,
  color,
}: {
  value: string;
  box: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  fontSize: number;
  color: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color,
        fontSize,
        fontWeight: 900,
        fontStyle: "italic",
        lineHeight: 1,
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </div>
  );
}

function fitFontSize(
  value: string,
  preferred: number,
  minimum: number,
  comfortableLength: number
) {
  if (value.length <= comfortableLength) {
    return preferred;
  }

  const overflow = value.length - comfortableLength;
  return Math.max(minimum, preferred - overflow * 1.4);
}

function formatMeasurement(value: number, maximumDecimals: number) {
  const fixed = value.toFixed(maximumDecimals);

  return fixed
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(".", ",");
}
