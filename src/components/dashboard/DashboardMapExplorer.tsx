"use client";

import L from "leaflet";
import { useCallback, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { useUserLocation } from "@/hooks/useUserLocation";
import {
  requestUserLocation,
  type UserLocation,
} from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";

type LakeOwnerType = "all" | "pzw" | "commercial";
type FishingType = "all" | "general" | "spinning" | "carp";

type DashboardMapExplorerProps = {
  lakes: LakeListDto[];
};

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
    popupAnchor: [0, -18],
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
  popupAnchor: [0, -12],
});

function MapLocationButton({
  onLocationFound,
}: {
  onLocationFound: (location: UserLocation) => void;
}) {
  const map = useMap();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLocate() {
    setIsLoading(true);

    try {
      const location = await requestUserLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      onLocationFound(location);

      map.flyTo([location.lat, location.lng], 12, {
        duration: 1.1,
      });
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Nie udało się pobrać Twojej lokalizacji."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLocate}
      disabled={isLoading}
      className="absolute left-12 top-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 text-xs font-black text-slate-700 shadow-lg backdrop-blur transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
    >
      {isLoading ? "Ustalam lokalizację…" : "Moja lokalizacja"}
    </button>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-xs font-black transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

export function DashboardMapExplorer({
  lakes,
}: DashboardMapExplorerProps) {
  const { userLocation, setUserLocation } = useUserLocation();
  const [ownerType, setOwnerType] = useState<LakeOwnerType>("all");
  const [fishingType, setFishingType] = useState<FishingType>("all");

  const handleLocationFound = useCallback(
    (location: UserLocation) => {
      setUserLocation(location);
    },
    [setUserLocation]
  );

  const filteredLakes = useMemo(() => {
    return lakes.filter((lake) => {
      const ownerMatches =
        ownerType === "all" || lake.type === ownerType;

      const fishingMatches =
        fishingType === "all" || lake.fishingType === fishingType;

      return ownerMatches && fishingMatches;
    });
  }, [lakes, ownerType, fishingType]);

  const hasFilters = ownerType !== "all" || fishingType !== "all";

  return (
    <div>
      <div className="mb-4 flex min-h-[80px] flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Rodzaj
          </span>

          <FilterButton
            label="Wszystkie"
            active={ownerType === "all"}
            onClick={() => setOwnerType("all")}
          />
          <FilterButton
            label="PZW"
            active={ownerType === "pzw"}
            onClick={() => setOwnerType("pzw")}
          />
          <FilterButton
            label="Komercyjne"
            active={ownerType === "commercial"}
            onClick={() => setOwnerType("commercial")}
          />
        </div>

        <div className="hidden h-8 w-px bg-slate-200 xl:block" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Typ łowiska
          </span>

          <FilterButton
            label="Wszystkie"
            active={fishingType === "all"}
            onClick={() => setFishingType("all")}
          />
          <FilterButton
            label="Ogólne"
            active={fishingType === "general"}
            onClick={() => setFishingType("general")}
          />
          <FilterButton
            label="Spinningowe"
            active={fishingType === "spinning"}
            onClick={() => setFishingType("spinning")}
          />
          <FilterButton
            label="Karpiowe"
            active={fishingType === "carp"}
            onClick={() => setFishingType("carp")}
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="whitespace-nowrap text-xs font-bold text-slate-500">
            {filteredLakes.length}{" "}
            {filteredLakes.length === 1 ? "wynik" : "wyników"}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setOwnerType("all");
                setFishingType("all");
              }}
              className="whitespace-nowrap text-xs font-black text-blue-600 transition hover:text-blue-700"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      <div className="relative h-[520px] overflow-hidden rounded-[26px] border border-slate-200 bg-slate-100 shadow-sm">
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

          <MapLocationButton onLocationFound={handleLocationFound} />

          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <p className="font-bold text-slate-950">
                  Twoja lokalizacja
                </p>
              </Popup>
            </Marker>
          )}

          {filteredLakes.map((lake) => (
            <Marker
              key={lake.id}
              position={[lake.lat, lake.lng]}
              icon={
                lake.type === "commercial"
                  ? commercialIcon
                  : pzwIcon
              }
              riseOnHover
            >
              <Popup minWidth={235} maxWidth={290}>
                <div>
                  {lake.images[0] && (
                    <img
                      src={lake.images[0]}
                      alt={lake.name}
                      className="mb-3 h-28 w-full rounded-xl object-cover"
                    />
                  )}

                  <p className="text-base font-black text-slate-950">
                    {lake.name}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {lake.address.city}
                    {lake.address.voivodeship
                      ? `, woj. ${lake.address.voivodeship}`
                      : ""}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        lake.type === "commercial"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {lake.type === "commercial" ? "Komercyjne" : "PZW"}
                    </span>

                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                      {Number(lake.rating || 0) > 0
                        ? `★ ${Number(lake.rating).toFixed(1)}`
                        : "Brak ocen"}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <a
                      href={`/lowiska/${lake.slug}`}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-center text-sm font-black !text-white transition hover:bg-blue-700"
                    >
                      Zobacz łowisko
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lake.lat},${lake.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-black !text-slate-700 transition hover:bg-slate-200"
                    >
                      Wyznacz trasę
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-3 flex h-[36px] flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs font-bold text-slate-500">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          Legenda
        </span>

        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          PZW
        </span>

        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Komercyjne
        </span>

        {userLocation && (
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            Twoja lokalizacja
          </span>
        )}
      </div>
    </div>
  );
}
