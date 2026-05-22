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

import type { LakeDto } from "@/lib/lakes";

type UserLocation = {
  lat: number;
  lng: number;
};

type LakeOwnerType = "all" | "pzw" | "commercial";
type FishingType = "all" | "general" | "spinning" | "carp";

type InteractiveMapProps = {
  lakes: LakeDto[];
};

const USER_LOCATION_STORAGE_KEY = "rybit-user-location";

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
const commercialIcon = createLakeIcon("#10B981", "rgba(16, 185, 129, 0.35)");

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

function getSavedUserLocation() {
  try {
    const savedLocation = localStorage.getItem(USER_LOCATION_STORAGE_KEY);

    if (!savedLocation) {
      return null;
    }

    const parsedLocation = JSON.parse(savedLocation) as UserLocation;

    if (
      typeof parsedLocation.lat !== "number" ||
      typeof parsedLocation.lng !== "number"
    ) {
      localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
      return null;
    }

    return parsedLocation;
  } catch {
    localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    return null;
  }
}

function saveUserLocation(location: UserLocation) {
  localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(location));

  window.dispatchEvent(
    new CustomEvent("rybit:user-location-updated", {
      detail: location,
    })
  );
}

function AutoLocateUser({
  onLocationFound,
}: {
  onLocationFound: (location: UserLocation) => void;
}) {
  const map = useMap();
  const hasRequestedLocation = useRef(false);

  useEffect(() => {
    if (hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;

    const savedLocation = getSavedUserLocation();

    if (savedLocation) {
      onLocationFound(savedLocation);

      map.flyTo([savedLocation.lat, savedLocation.lng], 11, {
        duration: 1,
      });

      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        onLocationFound(userLocation);
        saveUserLocation(userLocation);

        map.flyTo([userLocation.lat, userLocation.lng], 11, {
          duration: 1,
        });
      },
      (error) => {
        console.warn(
          "[InteractiveMap] Nie udało się automatycznie pobrać lokalizacji:",
          error
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, [map, onLocationFound]);

  return null;
}

function LocateButton({
  onLocationFound,
}: {
  onLocationFound: (location: UserLocation) => void;
}) {
  const map = useMap();
  const [isLoading, setIsLoading] = useState(false);

  function handleLocateUser() {
    if (!navigator.geolocation) {
      alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        onLocationFound(userLocation);
        saveUserLocation(userLocation);

        map.flyTo([userLocation.lat, userLocation.lng], 13, {
          duration: 1.2,
        });

        setIsLoading(false);
      },
      () => {
        alert("Nie udało się pobrać lokalizacji. Sprawdź zgodę w przeglądarce.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [ownerTypeFilter, setOwnerTypeFilter] =
    useState<LakeOwnerType>("all");
  const [fishingTypeFilter, setFishingTypeFilter] =
    useState<FishingType>("all");
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const handleLocationFound = useCallback((location: UserLocation) => {
    setUserLocation(location);
  }, []);

  const filteredLakes = useMemo(() => {
    return lakes.filter((lake) => {
      const matchesOwnerType =
        ownerTypeFilter === "all" || lake.type === ownerTypeFilter;

      const matchesFishingType =
        fishingTypeFilter === "all" || lake.fishingType === fishingTypeFilter;

      return matchesOwnerType && matchesFishingType;
    });
  }, [lakes, ownerTypeFilter, fishingTypeFilter]);

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

        <AutoLocateUser onLocationFound={handleLocationFound} />

        <LocateButton onLocationFound={handleLocationFound} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Jesteś tutaj</Popup>
          </Marker>
        )}

        {filteredLakes.map((lake) => (
          <Marker
            key={lake.id}
            position={[lake.lat, lake.lng]}
            icon={lake.type === "commercial" ? commercialIcon : pzwIcon}
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
                    href={getNavigationUrl(lake.lat, lake.lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-blue-600 px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-blue-700"
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
        <p className="mb-3 text-sm font-bold text-slate-950">Rodzaj łowiska</p>

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