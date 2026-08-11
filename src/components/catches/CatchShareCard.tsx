import type { CatchShareData } from "@/lib/catch-sharing";
import {
  formatCatchDate,
  getMethodLabel,
} from "@/lib/catch-sharing";
import {
  getScoreTheme,
  resolveStoredCatchScore,
} from "@/lib/catch-score";

type CatchShareCardProps = {
  fishingCatch: CatchShareData;
  imageUrl: string | null;
  format: "post" | "story";
  variant: "collector" | "clean";
};

export function CatchShareCard({
  fishingCatch,
  imageUrl,
  format,
  variant,
}: CatchShareCardProps) {
  const score = resolveStoredCatchScore(fishingCatch);
  const theme = getScoreTheme(score.score);

  if (variant === "clean") {
    return (
      <CleanCatchCard
        fishingCatch={fishingCatch}
        imageUrl={imageUrl}
        format={format}
        score={score}
        theme={theme}
      />
    );
  }

  return (
    <CollectorCatchCard
      fishingCatch={fishingCatch}
      imageUrl={imageUrl}
      format={format}
      score={score}
      theme={theme}
    />
  );
}

function CollectorCatchCard({
  fishingCatch,
  imageUrl,
  format,
  score,
  theme,
}: {
  fishingCatch: CatchShareData;
  imageUrl: string | null;
  format: "post" | "story";
  score: ReturnType<typeof resolveStoredCatchScore>;
  theme: ReturnType<typeof getScoreTheme>;
}) {
  const story = format === "story";
  const width = 1080;
  const height = story ? 1920 : 1350;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        padding: story ? 42 : 34,
        background:
          "linear-gradient(145deg, #07111f 0%, #0b2442 46%, #07111f 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          borderRadius: story ? 44 : 38,
          border: `${story ? 18 : 14}px solid ${theme.frame}`,
          background: "#10243d",
          boxShadow: "0 30px 90px rgba(0,0,0,.42)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.18,
            background:
              "repeating-linear-gradient(90deg, transparent 0, transparent 92px, rgba(255,255,255,.12) 93px, rgba(255,255,255,.12) 95px)",
          }}
        />

        <div
          style={{
            display: "flex",
            width: story ? "74%" : "77%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(160deg, #0d2d54 0%, #081828 100%)",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={fishingCatch.fishName}
              width="100%"
              height="100%"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                position: "absolute",
                inset: 0,
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(145deg, #14375f 0%, #0d2d54 46%, #07111f 100%)",
                color: "#ffffff",
                fontSize: 100,
                fontWeight: 900,
              }}
            >
              R
            </div>
          )}

          <div
            style={{
              display: "flex",
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(7,17,31,.05) 0%, rgba(7,17,31,.10) 45%, rgba(7,17,31,.94) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: story ? 40 : 32,
              top: story ? 40 : 30,
              display: "flex",
              alignItems: "center",
              padding: "12px 17px",
              borderRadius: 16,
              background: "rgba(7,17,31,.84)",
              border: "1px solid rgba(255,255,255,.22)",
              color: "#ffffff",
              fontSize: story ? 28 : 21,
              fontWeight: 900,
              letterSpacing: "3px",
            }}
          >
            RYBIO // CATCH CARD
          </div>

          <div
            style={{
              position: "absolute",
              left: story ? 40 : 32,
              right: story ? 40 : 32,
              bottom: story ? 46 : 36,
              display: "flex",
              flexDirection: "column",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: story ? 25 : 19,
                fontWeight: 800,
                color: theme.frame,
                textTransform: "uppercase",
                letterSpacing: "3px",
              }}
            >
              {score.tierLabel}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: story ? 78 : 61,
                lineHeight: 0.98,
                fontWeight: 900,
                letterSpacing: "-3px",
                textTransform: "uppercase",
              }}
            >
              {fishingCatch.fishName}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: story ? 22 : 15,
                flexWrap: "wrap",
                fontSize: story ? 24 : 18,
                fontWeight: 700,
                color: "rgba(255,255,255,.78)",
              }}
            >
              {fishingCatch.lakeName || "Połów zapisany w Rybio"}
              <span style={{ display: "flex", margin: "0 10px" }}>•</span>
              {formatCatchDate(fishingCatch.caughtAt)}
            </div>

            {fishingCatch.userName ? (
              <div
                style={{
                  display: "flex",
                  marginTop: story ? 15 : 10,
                  fontSize: story ? 22 : 17,
                  fontWeight: 800,
                  color: "rgba(255,255,255,.9)",
                }}
              >
                {fishingCatch.userName}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: story ? "26%" : "23%",
            height: "100%",
            flexDirection: "column",
            background: theme.frame,
            color: "#07111f",
          }}
        >
          <StatRailBox
            label="RYBIO SCORE"
            value={score.score !== null ? String(score.score) : "—"}
            subValue="/100"
            large
            story={story}
            dark={false}
          />

          <StatRailBox
            label="RANGA"
            value={score.tierLabel}
            story={story}
            dark
          />

          <StatRailBox
            label="WAGA"
            value={
              fishingCatch.weight !== null
                ? fishingCatch.weight.toFixed(2)
                : "—"
            }
            subValue={
              fishingCatch.weight !== null ? "KG" : undefined
            }
            story={story}
            dark={false}
          />

          <StatRailBox
            label="DŁUGOŚĆ"
            value={
              fishingCatch.length !== null
                ? fishingCatch.length.toFixed(0)
                : "—"
            }
            subValue={
              fishingCatch.length !== null ? "CM" : undefined
            }
            story={story}
            dark
          />

          <StatRailBox
            label="METODA"
            value={getMethodLabel(fishingCatch.method)}
            story={story}
            dark={false}
          />

          {story && fishingCatch.bait ? (
            <StatRailBox
              label="PRZYNĘTA"
              value={fishingCatch.bait}
              story={story}
              dark
            />
          ) : null}

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              minHeight: story ? 170 : 118,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: "#07111f",
              color: "#ffffff",
              padding: 18,
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: story ? 30 : 23,
                fontWeight: 900,
              }}
            >
              rybio.pl
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: story ? 14 : 11,
                fontWeight: 700,
                color: "rgba(255,255,255,.58)",
              }}
            >
              SCORE V{score.version}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRailBox({
  label,
  value,
  subValue,
  large = false,
  story,
  dark,
}: {
  label: string;
  value: string;
  subValue?: string;
  large?: boolean;
  story: boolean;
  dark: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: large
          ? story
            ? 270
            : 195
          : story
            ? 205
            : 150,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: story ? 22 : 14,
        borderBottom: "3px solid rgba(7,17,31,.35)",
        background: dark ? "#07111f" : "transparent",
        color: dark ? "#ffffff" : "#07111f",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: story ? 17 : 12,
          fontWeight: 900,
          letterSpacing: "2px",
          opacity: 0.72,
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 8,
          maxWidth: "100%",
          fontSize: large
            ? story
              ? 92
              : 70
            : story
              ? 34
              : 25,
          lineHeight: 1,
          fontWeight: 900,
          overflow: "hidden",
        }}
      >
        {value}
      </div>

      {subValue ? (
        <div
          style={{
            display: "flex",
            marginTop: 5,
            fontSize: story ? 17 : 13,
            fontWeight: 900,
            opacity: 0.72,
          }}
        >
          {subValue}
        </div>
      ) : null}
    </div>
  );
}

function CleanCatchCard({
  fishingCatch,
  imageUrl,
  format,
  score,
  theme,
}: {
  fishingCatch: CatchShareData;
  imageUrl: string | null;
  format: "post" | "story";
  score: ReturnType<typeof resolveStoredCatchScore>;
  theme: ReturnType<typeof getScoreTheme>;
}) {
  const story = format === "story";
  const width = 1080;
  const height = story ? 1920 : 1350;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        padding: story ? 54 : 42,
        background:
          "linear-gradient(145deg, #07111f 0%, #0d2d54 55%, #2563eb 100%)",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 70,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: story ? 36 : 30,
            fontWeight: 900,
          }}
        >
          RYBIO
        </div>

        <div
          style={{
            display: "flex",
            borderRadius: 999,
            padding: "12px 20px",
            background: theme.frame,
            color: "#07111f",
            fontSize: story ? 22 : 17,
            fontWeight: 900,
          }}
        >
          {score.score !== null
            ? `${score.score}/100 • ${score.tierLabel}`
            : "Rybio Score —"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          marginTop: 26,
          overflow: "hidden",
          borderRadius: story ? 42 : 34,
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            height: story ? 1010 : 680,
            position: "relative",
            overflow: "hidden",
            background: "#dbeafe",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={fishingCatch.fishName}
              width="100%"
              height="100%"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
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
                color: "#2563eb",
                fontSize: 70,
                fontWeight: 900,
              }}
            >
              RYBIO
            </div>
          )}

          <div
            style={{
              display: "flex",
              position: "absolute",
              left: 28,
              bottom: 28,
              borderRadius: 18,
              padding: "13px 18px",
              background: "rgba(7,17,31,.82)",
              color: "#ffffff",
              fontSize: story ? 23 : 18,
              fontWeight: 800,
            }}
          >
            {formatCatchDate(fishingCatch.caughtAt)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            padding: story ? "44px 46px" : "34px 38px",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              display: "flex",
              color: theme.accent,
              fontSize: story ? 20 : 15,
              fontWeight: 900,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {score.tierLabel}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: story ? 65 : 52,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {fishingCatch.fishName}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 26,
            }}
          >
            <CleanMetric
              label="Score"
              value={
                score.score !== null ? `${score.score}/100` : "—"
              }
              emphasized
              story={story}
            />
            <CleanMetric
              label="Waga"
              value={
                fishingCatch.weight !== null
                  ? `${fishingCatch.weight.toFixed(2)} kg`
                  : "—"
              }
              story={story}
            />
            <CleanMetric
              label="Długość"
              value={
                fishingCatch.length !== null
                  ? `${fishingCatch.length.toFixed(0)} cm`
                  : "—"
              }
              story={story}
            />
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              flexDirection: "column",
              fontSize: story ? 22 : 17,
              color: "#475569",
              fontWeight: 700,
            }}
          >
            <div style={{ display: "flex", marginBottom: 10 }}>
              Metoda: {getMethodLabel(fishingCatch.method)}
            </div>
            {fishingCatch.lakeName ? (
              <div style={{ display: "flex", marginBottom: 10 }}>
                Łowisko: {fishingCatch.lakeName}
              </div>
            ) : null}
            {fishingCatch.bait ? (
              <div style={{ display: "flex", marginBottom: 10 }}>
                Przynęta: {fishingCatch.bait}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              paddingTop: 22,
              borderTop: "1px solid #e2e8f0",
              justifyContent: "space-between",
              color: "#64748b",
              fontSize: story ? 18 : 14,
              fontWeight: 800,
            }}
          >
            <span style={{ display: "flex" }}>
              {fishingCatch.userName || "Wędkarz Rybio"}
            </span>
            <span style={{ display: "flex" }}>rybio.pl</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CleanMetric({
  label,
  value,
  emphasized = false,
  story,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  story: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        minWidth: story ? 245 : 210,
        marginRight: 12,
        flexDirection: "column",
        borderRadius: 20,
        padding: story ? "20px 22px" : "16px 18px",
        background: emphasized ? "#2563eb" : "#f1f5f9",
        color: emphasized ? "#ffffff" : "#0f172a",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: story ? 14 : 11,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "1px",
          opacity: 0.7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 6,
          fontSize: story ? 30 : 24,
          fontWeight: 900,
        }}
      >
        {value}
      </div>
    </div>
  );
}
