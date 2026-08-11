import type { CatchShareData } from "@/lib/catch-sharing";
import {
  formatCatchDate,
  getMethodLabel,
} from "@/lib/catch-sharing";

type CatchShareCardProps = {
  fishingCatch: CatchShareData;
  imageUrl: string | null;
  format: "post" | "story";
};

export function CatchShareCard({
  fishingCatch,
  imageUrl,
  format,
}: CatchShareCardProps) {
  const isStory = format === "story";
  const width = 1080;
  const height = isStory ? 1920 : 1350;

  const details = [
    fishingCatch.lakeName
      ? { label: "Łowisko", value: fishingCatch.lakeName }
      : null,
    fishingCatch.tripTitle
      ? { label: "Wyprawa", value: fishingCatch.tripTitle }
      : null,
    fishingCatch.bait
      ? { label: "Przynęta", value: fishingCatch.bait }
      : null,
    {
      label: "Metoda",
      value: getMethodLabel(fishingCatch.method),
    },
  ].filter(
    (item): item is { label: string; value: string } => Boolean(item)
  );

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(145deg, #07111f 0%, #0d2d54 46%, #2563eb 100%)",
        padding: isStory ? 54 : 42,
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 74,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: isStory ? 36 : 30,
            fontWeight: 900,
            letterSpacing: "-1px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
              background: "#ffffff",
              color: "#2563eb",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            R
          </div>
          RYBIO
        </div>

        <div
          style={{
            display: "flex",
            border: "1px solid rgba(255,255,255,.25)",
            background: "rgba(255,255,255,.10)",
            borderRadius: 999,
            padding: "12px 20px",
            fontSize: 18,
            fontWeight: 700,
            color: "rgba(255,255,255,.84)",
          }}
        >
          Mój połów
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          marginTop: 28,
          overflow: "hidden",
          borderRadius: isStory ? 40 : 34,
          background: "#ffffff",
          boxShadow: "0 28px 80px rgba(0,0,0,.26)",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            height: isStory ? 950 : 660,
            background:
              "linear-gradient(135deg, #dbeafe 0%, #ecfeff 52%, #d1fae5 100%)",
            overflow: "hidden",
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
                flexDirection: "column",
                color: "#1d4ed8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 120,
                  height: 120,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 36,
                  background: "rgba(255,255,255,.75)",
                  fontSize: 46,
                  fontWeight: 900,
                }}
              >
                R
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 22,
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                Połów zapisany w Rybio
              </div>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: 28,
              bottom: 28,
              display: "flex",
              padding: "13px 18px",
              borderRadius: 18,
              background: "rgba(7,17,31,.78)",
              color: "#ffffff",
              fontSize: 19,
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
            padding: isStory ? "44px 46px 48px" : "34px 38px 38px",
            color: "#0f172a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "68%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "#2563eb",
                  fontSize: 17,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Złowione
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 9,
                  fontSize: isStory ? 62 : 54,
                  lineHeight: 1.03,
                  fontWeight: 900,
                  letterSpacing: "-2px",
                }}
              >
                {fishingCatch.fishName}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              {fishingCatch.userName ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 14,
                      color: "#94a3b8",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Wędkarz
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginTop: 6,
                      fontSize: 22,
                      color: "#334155",
                      fontWeight: 800,
                      textAlign: "right",
                    }}
                  >
                    {fishingCatch.userName}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
            }}
          >
            {fishingCatch.weight !== null ? (
              <MetricBox
                label="Waga"
                value={`${fishingCatch.weight.toFixed(2)} kg`}
                emphasized
                story={isStory}
              />
            ) : null}

            {fishingCatch.length !== null ? (
              <MetricBox
                label="Długość"
                value={`${fishingCatch.length.toFixed(0)} cm`}
                story={isStory}
              />
            ) : null}
          </div>

          {details.length > 0 ? (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                flexWrap: "wrap",
              }}
            >
              {details.slice(0, isStory ? 4 : 3).map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: isStory ? "48%" : "31%",
                    marginRight: 12,
                    marginBottom: 12,
                    borderRadius: 18,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: isStory ? "18px 20px" : "14px 17px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      color: "#94a3b8",
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      marginTop: 5,
                      color: "#334155",
                      fontSize: isStory ? 21 : 18,
                      fontWeight: 800,
                      overflow: "hidden",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {fishingCatch.note ? (
            <div
              style={{
                display: "flex",
                marginTop: 14,
                borderLeft: "5px solid #2563eb",
                background: "#eff6ff",
                borderRadius: 18,
                padding: isStory ? "20px 22px" : "16px 18px",
                color: "#475569",
                fontSize: isStory ? 20 : 17,
                lineHeight: 1.4,
                fontWeight: 600,
                maxHeight: isStory ? 130 : 94,
                overflow: "hidden",
              }}
            >
              {fishingCatch.note}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              paddingTop: 22,
              borderTop: "1px solid #e2e8f0",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                rybio.pl
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 3,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#94a3b8",
                }}
              >
                Twój dziennik wypraw i połowów
              </div>
            </div>

            <div
              style={{
                display: "flex",
                borderRadius: 999,
                background: "#eff6ff",
                color: "#2563eb",
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              #Rybio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  emphasized = false,
  story = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  story?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: story ? 260 : 230,
        marginRight: 16,
        borderRadius: 22,
        background: emphasized ? "#2563eb" : "#f1f5f9",
        color: emphasized ? "#ffffff" : "#0f172a",
        padding: story ? "22px 26px" : "18px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 14,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: emphasized ? "rgba(255,255,255,.72)" : "#94a3b8",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 5,
          fontSize: story ? 34 : 30,
          fontWeight: 900,
        }}
      >
        {value}
      </div>
    </div>
  );
}
