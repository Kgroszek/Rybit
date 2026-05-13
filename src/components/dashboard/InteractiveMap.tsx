"use client";

import L from "leaflet";
import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
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

function createLakeIcon(color: string, shadowColor: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: ${color};
        border: 4px solid white;
        box-shadow: 0 10px 25px ${shadowColor};
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
      border-radius: 9999px;
      background: #10B981;
      border: 4px solid white;
      box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.18);
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

        localStorage.setItem(
          "rybit-user-location",
          JSON.stringify(userLocation)
        );

        window.dispatchEvent(
          new CustomEvent("rybit:user-location-updated", {
            detail: userLocation,
          })
        );

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
      className="absolute left-4 top-4 z-[500] rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold shadow-sm transition hover:bg-slate-50 sm:left-5 sm:top-5 sm:px-4 sm:py-3 sm:text-sm"
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
      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

export function InteractiveMap({ lakes }: InteractiveMapProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<LakeOwnerType>("all");
  const [fishingTypeFilter, setFishingTypeFilter] =
    useState<FishingType>("all");
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

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
    <div className="relative h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:h-[560px] lg:h-[600px]">
      <MapContainer
        center={[53.7784, 20.4801]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocateButton onLocationFound={setUserLocation} />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
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
              <div className="min-w-56">
                <p className="mb-2 text-base font-bold">{lake.name}</p>

                <div className="flex flex-wrap gap-2">
                  <div
                    style={{
                      display: "inline-flex",
                      borderRadius: "9999px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      ...(lake.type === "commercial"
                        ? {
                            background: "#ECFDF5",
                            color: "#059669",
                          }
                        : {
                            background: "#EFF6FF",
                            color: "#2563EB",
                          }),
                    }}
                  >
                    {getLakeTypeLabel(lake.type)}
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      borderRadius: "9999px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: "#F1F5F9",
                      color: "#475569",
                    }}
                  >
                    {getFishingTypeLabel(lake.fishingType)}
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>
                    <strong>Ocena:</strong> {lake.rating}
                  </p>

                  <p>
                    <strong>Ryby:</strong> {lake.fish}
                  </p>
                </div>

                <a
                  href={getNavigationUrl(lake.lat, lake.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Nawiguj
                </a>
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
        className={`absolute left-5 right-5 z-[550] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition sm:left-auto sm:right-5 sm:top-5 sm:w-72 ${
          areFiltersOpen
            ? "bottom-20 opacity-100"
            : "pointer-events-none bottom-20 opacity-0 sm:pointer-events-auto sm:bottom-auto sm:opacity-100"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">Filtry łowisk</p>
            <p className="text-xs text-slate-500">
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
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
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

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
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

      <div className="absolute bottom-5 left-5 z-[500] hidden rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm sm:block">
        <p className="mb-3 font-bold text-slate-900">Rodzaj łowiska</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600" />
            <span className="text-slate-600">PZW</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Komercyjne</span>
          </div>
        </div>
      </div>
    </div>
  );
}