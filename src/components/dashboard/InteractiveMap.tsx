"use client";

import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { useUserLocation } from "@/hooks/useUserLocation";
import {
  isValidLocation,
  requestUserLocation,
  type UserLocation,
} from "@/lib/location";
import type { LakeDto } from "@/lib/lakes";

type LakeOwnerType = "all" | "pzw" | "commercial";
type FishingType = "all" | "general" | "spinning" | "carp";

type InteractiveMapProps = {
  lakes: LakeDto[];
};

type SafeLatLng = [number, number];

function getSafeLatLng(location: unknown): SafeLatLng | null {
  if (!location || typeof location !== "object") {
    return null;
  }

  const candidate = location as {
    lat?: unknown;
    lng?: unknown;
  };

  const rawLat = candidate.lat;
  const rawLng = candidate.lng;

  if (typeof rawLat !== "number" || typeof rawLng !== "number") {
    return null;
  }

  /*
   * Kopiujemy wartości do lokalnych zmiennych.
   * Leaflet nigdy nie dostaje bezpośrednio obiektu ze stanu.
   */
  const lat = rawLat;
  const lng = rawLng;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function getSafeLakeLatLng(lake: LakeDto): SafeLatLng | null {
  return getSafeLatLng({
    lat: lake.lat,
    lng: lake.lng,
  });
}

function createLakeIcon(color: string, shadowColor: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 999px;
        background: ${color};
        border: 4px solid white;
        box-shadow: 0 10px 24px ${shadowColor};
      "></div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const pzwIcon = createLakeIcon("#2563EB", "rgba(37, 99, 235, 0.35)");

const commercialIcon = createLakeIcon(
  "#10B981",
  "rgba(16, 185, 129, 0.35)"
);

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: #F97316;
      border: 4px solid white;
      box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function getLakeTypeLabel(type: string) {
  if (type === "pzw") {
    return "Łowisko PZW";
  }

  if (type === "commercial") {
    return "Łowisko komercyjne";
  }

  return "Inne łowisko";
}

function getFishingTypeLabel(type: string) {
  if (type === "spinning") {
    return "Spinningowe";
  }

  if (type === "carp") {
    return "Karpiowe";
  }

  if (type === "general") {
    return "Ogólne";
  }

  return "Inne";
}

function getNavigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/*
 * Automatycznie próbujemy pobrać lokalizację, ale NIE centrujemy mapy.
 *
 * To ważne:
 * - dashboard zawsze otworzy się na widoku Polski,
 * - błędna / niedostępna geolokalizacja nie może wywalić Leafleta,
 * - użytkownik nadal może kliknąć "Moja lokalizacja", aby ręcznie się zbliżyć.
 */
function AutoLocateUser({
  userLocation,
  onLocationFound,
}: {
  userLocation: UserLocation | null;
  onLocationFound: (location: UserLocation) => void;
}) {
  const hasRequestedLocation = useRef(false);

  useEffect(() => {
    if (getSafeLatLng(userLocation)) {
      return;
    }

    if (hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;

    requestUserLocation({
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    })
      .then((location) => {
        const coordinates = getSafeLatLng(location);

        if (!coordinates || !isValidLocation(location)) {
          console.warn(
            "[InteractiveMap] Przeglądarka zwróciła nieprawidłową lokalizację:",
            location
          );
          return;
        }

        onLocationFound({
          lat: coordinates[0],
          lng: coordinates[1],
        });
      })
      .catch((error) => {
        console.warn(
          "[InteractiveMap] Nie udało się automatycznie pobrać lokalizacji:",
          error
        );
      });
  }, [onLocationFound, userLocation]);

  return null;
}

function LocateButton({
  onLocationFound,
}: {
  onLocationFound: (location: UserLocation) => void;
}) {
  const map = useMap();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLocateUser() {
    setIsLoading(true);

    try {
      const location = await requestUserLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      const coordinates = getSafeLatLng(location);

      if (!coordinates || !isValidLocation(location)) {
        throw new Error(
          "Przeglądarka zwróciła nieprawidłowe współrzędne lokalizacji."
        );
      }

      const safeLocation: UserLocation = {
        lat: coordinates[0],
        lng: coordinates[1],
      };

      onLocationFound(safeLocation);

      /*
       * Dodatkowy try/catch bezpośrednio wokół Leafleta.
       * Nawet gdyby Leaflet z jakiegoś powodu odrzucił poprawne
       * współrzędne, cały dashboard nie powinien się wywrócić.
       */
      try {
        map.flyTo(coordinates, 13, {
          duration: 1.2,
        });
      } catch (error) {
        console.warn(
          "[InteractiveMap] Nie udało się wycentrować mapy:",
          error
        );
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Nie udało się pobrać lokalizacji."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLocateUser}
      disabled={isLoading}
      className="absolute left-12 top-5 z-[1000] rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-lg transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Szukam..." : "Moja lokalizacja"}
    </button>
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

export function InteractiveMap({ lakes }: InteractiveMapProps) {
  const { userLocation, setUserLocation } = useUserLocation();

  const [ownerTypeFilter, setOwnerTypeFilter] =
    useState<LakeOwnerType>("all");

  const [fishingTypeFilter, setFishingTypeFilter] =
    useState<FishingType>("all");

  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const handleLocationFound = useCallback(
    (location: UserLocation) => {
      const coordinates = getSafeLatLng(location);

      if (!coordinates) {
        console.warn(
          "[InteractiveMap] Pominięto nieprawidłową lokalizację:",
          location
        );
        return;
      }

      setUserLocation({
        lat: coordinates[0],
        lng: coordinates[1],
      });
    },
    [setUserLocation]
  );

  const validLakes = useMemo(() => {
    return lakes.flatMap((lake) => {
      const coordinates = getSafeLakeLatLng(lake);

      if (!coordinates) {
        console.warn(
          `[InteractiveMap] Pominięto łowisko z nieprawidłowymi współrzędnymi: ${lake.name}`,
          {
            lat: lake.lat,
            lng: lake.lng,
          }
        );

        return [];
      }

      return [
        {
          lake,
          coordinates,
        },
      ];
    });
  }, [lakes]);

  const filteredLakes = useMemo(() => {
    return validLakes.filter(({ lake }) => {
      const matchesOwnerType =
        ownerTypeFilter === "all" || lake.type === ownerTypeFilter;

      const matchesFishingType =
        fishingTypeFilter === "all" ||
        lake.fishingType === fishingTypeFilter;

      return matchesOwnerType && matchesFishingType;
    });
  }, [validLakes, ownerTypeFilter, fishingTypeFilter]);

  const userCoordinates = getSafeLatLng(userLocation);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm sm:h-[560px]">
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

        <AutoLocateUser
          userLocation={userLocation}
          onLocationFound={handleLocationFound}
        />

        <LocateButton onLocationFound={handleLocationFound} />

        {userCoordinates && (
          <Marker position={userCoordinates} icon={userIcon}>
            <Popup>Jesteś tutaj</Popup>
          </Marker>
        )}

        {filteredLakes.map(({ lake, coordinates }) => (
          <Marker
            key={lake.id}
            position={coordinates}
            icon={
              lake.type === "commercial"
                ? commercialIcon
                : pzwIcon
            }
          >
            <Popup>
              <div className="min-w-[220px]">
                <p className="text-base font-bold text-slate-950">
                  {lake.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {getLakeTypeLabel(lake.type)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {getFishingTypeLabel(lake.fishingType)}
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Ocena: {lake.rating}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Ryby: {lake.fish}
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={getNavigationUrl(
                      coordinates[0],
                      coordinates[1]
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-blue-600 px-3 py-2 text-center text-sm font-bold !text-white transition hover:bg-blue-700"
                  >
                    Nawiguj
                  </a>

                  <a
                    href={`/lowiska/${lake.slug}`}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                  >
                    Zobacz szczegóły
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        type="button"
        onClick={() => setAreFiltersOpen((current) => !current)}
        className="absolute bottom-5 left-5 z-[1000] rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 sm:hidden"
      >
        {areFiltersOpen ? "Ukryj filtry" : "Filtry"}
      </button>

      <div
        className={`absolute right-5 top-5 z-[1000] w-[280px] rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur transition sm:block ${
          areFiltersOpen ? "block" : "hidden"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Filtry łowisk
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Wyniki: {filteredLakes.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setOwnerTypeFilter("all");
              setFishingTypeFilter("all");
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Wyczyść
          </button>
        </div>

        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Rodzaj
          </p>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="Wszystkie"
              isActive={ownerTypeFilter === "all"}
              onClick={() => setOwnerTypeFilter("all")}
            />

            <FilterButton
              label="PZW"
              isActive={ownerTypeFilter === "pzw"}
              onClick={() => setOwnerTypeFilter("pzw")}
            />

            <FilterButton
              label="Komercyjne"
              isActive={ownerTypeFilter === "commercial"}
              onClick={() => setOwnerTypeFilter("commercial")}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Typ łowiska
          </p>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="Wszystkie"
              isActive={fishingTypeFilter === "all"}
              onClick={() => setFishingTypeFilter("all")}
            />

            <FilterButton
              label="Ogólne"
              isActive={fishingTypeFilter === "general"}
              onClick={() => setFishingTypeFilter("general")}
            />

            <FilterButton
              label="Spinningowe"
              isActive={fishingTypeFilter === "spinning"}
              onClick={() => setFishingTypeFilter("spinning")}
            />

            <FilterButton
              label="Karpiowe"
              isActive={fishingTypeFilter === "carp"}
              onClick={() => setFishingTypeFilter("carp")}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 z-[1000] hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:block">
        <p className="mb-3 text-sm font-bold text-slate-950">
          Rodzaj łowiska
        </p>

        <div className="space-y-2 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600" />
            <span>PZW</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>Komercyjne</span>
          </div>
        </div>
      </div>
    </div>
  );
}