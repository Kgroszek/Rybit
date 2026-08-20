"use client";

import L from "leaflet";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { Badge } from "@/components/ui/Badge";
import {
  Button,
  buttonClassName,
} from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  isValidLocation,
  requestUserLocation,
  type UserLocation,
} from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";

function createLakeIcon(
  color: string,
  shadowColor: string,
  size = 26
) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 999px;
        background: ${color};
        border: 3px solid #fff;
        box-shadow: 0 5px 14px ${shadowColor};
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [
      size / 2,
      size / 2,
    ],
    popupAnchor: [
      0,
      -(size / 2 + 3),
    ],
  });
}

const pzwIcon = createLakeIcon(
  "#2F5BA7",
  "rgba(47,91,167,.28)"
);

const commercialIcon = createLakeIcon(
  "#39A875",
  "rgba(57,168,117,.28)"
);

const userIcon = createLakeIcon(
  "#F97316",
  "rgba(249,115,22,.32)"
);

function FitMapToLakes({
  lakes,
}: {
  lakes: LakeListDto[];
}) {
  const map = useMap();

  const boundsKey = useMemo(
    () =>
      lakes
        .map(
          (lake) =>
            `${lake.id}:${lake.lat}:${lake.lng}`
        )
        .join("|"),
    [lakes]
  );

  useEffect(() => {
    if (lakes.length === 0) {
      return;
    }

    if (lakes.length === 1) {
      const lake = lakes[0];

      if (
        isValidLocation({
          lat: lake.lat,
          lng: lake.lng,
        })
      ) {
        map.setView(
          [lake.lat, lake.lng],
          11,
          {
            animate: false,
          }
        );
      }

      return;
    }

    const points = lakes
      .filter((lake) =>
        isValidLocation({
          lat: lake.lat,
          lng: lake.lng,
        })
      )
      .map(
        (lake) =>
          [
            lake.lat,
            lake.lng,
          ] as [number, number]
      );

    if (points.length < 2) {
      return;
    }

    map.fitBounds(points, {
      padding: [28, 28],
      maxZoom: 9,
      animate: false,
    });
  }, [boundsKey, lakes, map]);

  return null;
}

function MapLocationButton({
  onLocationFound,
}: {
  onLocationFound: (
    location: UserLocation
  ) => void;
}) {
  const map = useMap();
  const toast = useToast();
  const [isLoading, setIsLoading] =
    useState(false);

  async function handleLocate() {
    setIsLoading(true);

    try {
      const location =
        await requestUserLocation({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });

      if (!isValidLocation(location)) {
        throw new Error(
          "Nieprawidłowe współrzędne lokalizacji."
        );
      }

      onLocationFound(location);

      map.flyTo(
        [
          location.lat,
          location.lng,
        ],
        12,
        {
          duration: 1,
        }
      );
    } catch (error) {
      toast.error({
        title:
          "Nie udało się pobrać lokalizacji",
        description:
          error instanceof Error
            ? error.message
            : "Sprawdź uprawnienia lokalizacji w przeglądarce i spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="absolute left-[58px] top-3 z-[1000] sm:top-4">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleLocate}
        isLoading={isLoading}
        loadingLabel="Lokalizacja…"
        className="bg-surface/95 backdrop-blur"
      >
        Moja lokalizacja
      </Button>
    </div>
  );
}

export function DashboardMapExplorer({
  lakes,
}: {
  lakes: LakeListDto[];
}) {
  const {
    userLocation,
    setUserLocation,
  } = useUserLocation();

  const handleLocationFound =
    useCallback(
      (location: UserLocation) => {
        if (
          isValidLocation(location)
        ) {
          setUserLocation(location);
        }
      },
      [setUserLocation]
    );

  const validUserLocation =
    userLocation &&
    isValidLocation(userLocation)
      ? userLocation
      : null;

  return (
    <div>
      <div className="relative h-[420px] overflow-hidden rounded-panel border border-border bg-surface-muted sm:h-[480px] lg:h-[520px]">
        <MapContainer
          center={[52.1, 19.4]}
          zoom={6}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitMapToLakes
            lakes={lakes}
          />

          <MapLocationButton
            onLocationFound={
              handleLocationFound
            }
          />

          {validUserLocation && (
            <Marker
              position={[
                validUserLocation.lat,
                validUserLocation.lng,
              ]}
              icon={userIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <p className="font-bold text-text">
                  Twoja lokalizacja
                </p>
              </Popup>
            </Marker>
          )}

          {lakes.map((lake) => (
            <Marker
              key={lake.id}
              position={[
                lake.lat,
                lake.lng,
              ]}
              icon={
                lake.type ===
                "commercial"
                  ? commercialIcon
                  : pzwIcon
              }
              riseOnHover
            >
              <Popup
                minWidth={235}
                maxWidth={290}
              >
                <div>
                  {lake.images[0] && (
                    <img
                      src={lake.images[0]}
                      alt={lake.name}
                      className="mb-3 h-28 w-full rounded-xl object-cover"
                    />
                  )}

                  <p className="text-base font-extrabold text-text">
                    {lake.name}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-text-secondary">
                    {lake.address.city}
                    {lake.address
                      .voivodeship
                      ? `, woj. ${lake.address.voivodeship}`
                      : ""}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      variant={
                        lake.type ===
                        "commercial"
                          ? "success"
                          : "primary"
                      }
                    >
                      {lake.type ===
                      "commercial"
                        ? "Komercyjne"
                        : "PZW"}
                    </Badge>

                    <Badge variant="neutral">
                      {Number(
                        lake.rating || 0
                      ) > 0
                        ? `Ocena ${Number(
                            lake.rating
                          )
                            .toFixed(1)
                            .replace(
                              ".",
                              ","
                            )}`
                        : "Brak ocen"}
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <Link
                      href={`/lowiska/${lake.slug}`}
                      className={buttonClassName(
                        {
                          variant:
                            "primary",
                          size: "sm",
                          fullWidth: true,
                        }
                      )}
                    >
                      Zobacz łowisko
                    </Link>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lake.lat},${lake.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClassName(
                        {
                          variant:
                            "outline",
                          size: "sm",
                          fullWidth: true,
                        }
                      )}
                    >
                      Wyznacz trasę
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {lakes.length === 0 && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[900] mx-auto max-w-sm rounded-card border border-border bg-surface/95 px-4 py-3 text-center shadow-card backdrop-blur">
            <p className="text-sm font-extrabold text-text">
              Brak łowisk dla tych filtrów
            </p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Zmień filtry, aby ponownie wyświetlić miejsca na mapie.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-7 flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs font-semibold text-text-secondary">
        <span className="text-[10px] font-black uppercase tracking-[0.13em] text-text-muted">
          Legenda
        </span>

        <LegendDot
          color="#2F5BA7"
          label="PZW"
        />

        <LegendDot
          color="#39A875"
          label="Komercyjne"
        />

        {validUserLocation && (
          <LegendDot
            color="#F97316"
            label="Twoja lokalizacja"
          />
        )}
      </div>
    </div>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />
      {label}
    </span>
  );
}
