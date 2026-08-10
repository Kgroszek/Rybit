"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { LakeListDto } from "@/lib/lakes";

type UserLocation = {
  lat: number;
  lng: number;
};

type PublicLakesMapProps = {
  lakes: LakeListDto[];
  userLocation?: UserLocation | null;
};

type LakePoint = {
  lake: LakeListDto;
  lat: number;
  lng: number;
};

const POLAND_CENTER: [number, number] = [52.0693, 19.4803];

function createLakeIcon(background: string, shadow: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: ${background};
        border: 4px solid white;
        box-shadow: 0 10px 24px ${shadow};
        color: white;
        font-size: 17px;
        line-height: 1;
      ">●</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

const pzwIcon = createLakeIcon(
  "#2563eb",
  "rgba(37, 99, 235, 0.35)"
);

const commercialIcon = createLakeIcon(
  "#10b981",
  "rgba(16, 185, 129, 0.35)"
);

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: #f97316;
      border: 4px solid white;
      box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

function FitMapToResults({
  points,
  userLocation,
}: {
  points: LakePoint[];
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  const positionsKey = useMemo(() => {
    const lakePositions = points
      .map((point) => `${point.lake.id}:${point.lat}:${point.lng}`)
      .join("|");

    const userPosition = userLocation
      ? `user:${userLocation.lat}:${userLocation.lng}`
      : "";

    return `${lakePositions}|${userPosition}`;
  }, [points, userLocation]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();

      const positions: Array<[number, number]> = points.map((point) => [
        point.lat,
        point.lng,
      ]);

      if (userLocation) {
        positions.push([userLocation.lat, userLocation.lng]);
      }

      if (positions.length === 0) {
        map.setView(POLAND_CENTER, 6, {
          animate: false,
        });
        return;
      }

      if (positions.length === 1) {
        map.setView(positions[0], 12, {
          animate: false,
        });
        return;
      }

      map.fitBounds(L.latLngBounds(positions), {
        padding: [40, 40],
        maxZoom: 12,
        animate: false,
      });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [map, points, positionsKey, userLocation]);

  return null;
}

export function PublicLakesMap({
  lakes,
  userLocation = null,
}: PublicLakesMapProps) {
  const points = useMemo<LakePoint[]>(() => {
    return lakes.flatMap((lake) => {
      const coordinates = getLakeCoordinates(lake);

      if (!coordinates) {
        return [];
      }

      return [
        {
          lake,
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
      ];
    });
  }, [lakes]);

  if (points.length === 0) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center bg-slate-100 p-6 text-center">
        <div>
          <p className="text-lg font-black text-slate-950">
            Brak łowisk ze współrzędnymi
          </p>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Wyniki spełniają filtry, ale nie mają poprawnych współrzędnych GPS,
            dlatego nie można ich umieścić na mapie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[420px] w-full">
      <MapContainer
        center={POLAND_CENTER}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMapToResults points={points} userLocation={userLocation} />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <p className="font-bold text-slate-950">Twoja lokalizacja</p>
            </Popup>
          </Marker>
        )}

        {points.map(({ lake, lat, lng }) => {
          const imageUrl = lake.images?.[0];
          const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

          return (
            <Marker
              key={lake.id}
              position={[lat, lng]}
              icon={lake.type === "commercial" ? commercialIcon : pzwIcon}
              riseOnHover
            >
              <Popup minWidth={240} maxWidth={290}>
                <div className="overflow-hidden">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`${lake.name} – łowisko w ${lake.address.city}`}
                      className="mb-3 h-28 w-full rounded-xl object-cover"
                    />
                  )}

                  <p className="text-base font-black text-slate-950">
                    {lake.name}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {lake.address.city}, woj. {lake.address.voivodeship}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
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
                      href={`/lowiska-w-polsce/${lake.slug}`}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-center text-sm font-black !text-white transition hover:bg-blue-700"
                    >
                      Zobacz szczegóły
                    </a>

                    <a
                      href={navigationUrl}
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
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] hidden rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:block">
        <div className="space-y-2 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600" />
            <span>PZW</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>Komercyjne</span>
          </div>

          {userLocation && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <span>Twoja lokalizacja</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getLakeCoordinates(lake: LakeListDto) {
  const lat = Number(lake.lat);
  const lng = Number(lake.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat === 0 && lng === 0) {
    return null;
  }

  return {
    lat,
    lng,
  };
}
