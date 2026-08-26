"use client";

import L from "leaflet";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { PolishVectorBaseLayer } from "@/components/maps/PolishVectorBaseLayer";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  isValidLocation,
  requestUserLocation,
  type UserLocation,
} from "@/lib/location";
import type { LakeListDto } from "@/lib/lakes";

const POLAND_CENTER: [number, number] = [52.0693, 19.4803];
const POLAND_ZOOM = 6;

function createLakeIcon(
  color: string,
  shadowColor: string,
  size = 26
) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${color};
        border:3px solid #fff;
        box-shadow:0 5px 14px ${shadowColor};
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 3)],
  });
}

function createClusterIcon(count: number) {
  const size =
    count >= 50 ? 46 : count >= 20 ? 42 : count >= 10 ? 38 : 34;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:var(--rybio-map-cluster);
        color:#fff;
        border:3px solid #fff;
        box-shadow:0 8px 20px rgba(13,30,51,.22);
        font-family:var(--font-geist-sans),Arial,sans-serif;
        font-size:${count >= 100 ? 11 : 12}px;
        font-weight:800;
        letter-spacing:-.02em;
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const pzwIcon = createLakeIcon(
  "var(--rybio-map-pzw)",
  "rgba(47,91,167,.25)"
);

const commercialIcon = createLakeIcon(
  "var(--rybio-map-commercial)",
  "rgba(57,168,117,.25)"
);

const userIcon = createLakeIcon(
  "var(--rybio-map-user)",
  "rgba(249,115,22,.30)"
);

function FitMapToLakes({
  lakes,
  enabled,
}: {
  lakes: LakeListDto[];
  enabled: boolean;
}) {
  const map = useMap();

  const boundsKey = useMemo(
    () =>
      lakes
        .map((lake) => `${lake.id}:${lake.lat}:${lake.lng}`)
        .join("|"),
    [lakes]
  );

  useEffect(() => {
    if (!enabled) {
      map.setView(POLAND_CENTER, POLAND_ZOOM, { animate: false });
      return;
    }

    const points = lakes
      .filter((lake) => isValidLocation({ lat: lake.lat, lng: lake.lng }))
      .map((lake) => [lake.lat, lake.lng] as [number, number]);

    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 11, { animate: false });
      return;
    }

    map.fitBounds(points, {
      padding: [32, 32],
      maxZoom: 9,
      animate: false,
    });
  }, [boundsKey, enabled, lakes, map]);

  return null;
}

function MapLocationButton({
  onLocationFound,
}: {
  onLocationFound: (location: UserLocation) => void;
}) {
  const map = useMap();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLocate() {
    setIsLoading(true);

    try {
      const location = await requestUserLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      if (!isValidLocation(location)) {
        throw new Error("Nieprawidłowe współrzędne lokalizacji.");
      }

      onLocationFound(location);
      map.flyTo([location.lat, location.lng], 12, { duration: 1 });
    } catch (error) {
      toast.error({
        title: "Nie udało się pobrać lokalizacji",
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

type LakeCluster = {
  id: string;
  lakes: LakeListDto[];
  lat: number;
  lng: number;
};

function ClusteredLakeMarkers({ lakes }: { lakes: LakeListDto[] }) {
  const [viewportVersion, setViewportVersion] = useState(0);

  const map = useMapEvents({
    zoomend() {
      setViewportVersion((value) => value + 1);
    },
    moveend() {
      setViewportVersion((value) => value + 1);
    },
  });

  const clusters = useMemo(() => {
    const zoom = map.getZoom();
    const bounds = map.getBounds().pad(0.15);

    const visibleLakes = lakes.filter((lake) =>
      bounds.contains([lake.lat, lake.lng])
    );

    if (zoom >= 11) {
      return visibleLakes.map(
        (lake) =>
          ({
            id: lake.id,
            lakes: [lake],
            lat: lake.lat,
            lng: lake.lng,
          }) satisfies LakeCluster
      );
    }

    const cellSize =
      zoom <= 6 ? 72 : zoom === 7 ? 64 : zoom === 8 ? 56 : zoom === 9 ? 48 : 40;

    const buckets = new Map<string, LakeListDto[]>();

    for (const lake of visibleLakes) {
      const point = map.latLngToContainerPoint([lake.lat, lake.lng]);
      const key = `${Math.floor(point.x / cellSize)}:${Math.floor(
        point.y / cellSize
      )}`;

      const bucket = buckets.get(key) ?? [];
      bucket.push(lake);
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries()).map(([key, bucket]) => {
      const lat =
        bucket.reduce((sum, lake) => sum + lake.lat, 0) / bucket.length;
      const lng =
        bucket.reduce((sum, lake) => sum + lake.lng, 0) / bucket.length;

      return {
        id: key,
        lakes: bucket,
        lat,
        lng,
      } satisfies LakeCluster;
    });
  }, [lakes, map, viewportVersion]);

  function openCluster(cluster: LakeCluster) {
    if (cluster.lakes.length <= 1) return;

    const points = cluster.lakes.map(
      (lake) => [lake.lat, lake.lng] as [number, number]
    );

    const bounds = L.latLngBounds(points);

    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.setView(
        [cluster.lat, cluster.lng],
        Math.min(map.getZoom() + 2, 12)
      );
      return;
    }

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: Math.min(map.getZoom() + 2, 12),
    });
  }

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.lakes.length > 1) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(cluster.lakes.length)}
              eventHandlers={{
                click: () => openCluster(cluster),
              }}
              title={`${cluster.lakes.length} łowisk`}
            />
          );
        }

        return <LakeMarker key={cluster.lakes[0].id} lake={cluster.lakes[0]} />;
      })}
    </>
  );
}

function LakeMarker({ lake }: { lake: LakeListDto }) {
  return (
    <Marker
      position={[lake.lat, lake.lng]}
      icon={lake.type === "commercial" ? commercialIcon : pzwIcon}
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

          <p className="text-base font-bold text-text">{lake.name}</p>

          <p className="mt-1 text-sm font-medium text-text-secondary">
            {lake.address.city}
            {lake.address.voivodeship
              ? `, woj. ${lake.address.voivodeship}`
              : ""}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={lake.type === "commercial" ? "success" : "primary"}>
              {lake.type === "commercial" ? "Komercyjne" : "PZW"}
            </Badge>

            <Badge variant="neutral">
              {Number(lake.rating || 0) > 0
                ? `Ocena ${Number(lake.rating).toFixed(1).replace(".", ",")}`
                : "Brak ocen"}
            </Badge>
          </div>

          <div className="mt-3 grid gap-2">
            <Link
              href={`/lowiska/${lake.slug}`}
              className={buttonClassName({
                variant: "primary",
                size: "sm",
                fullWidth: true,
              })}
            >
              Zobacz łowisko
            </Link>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lake.lat},${lake.lng}`}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                fullWidth: true,
              })}
            >
              Wyznacz trasę
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function DashboardMapExplorer({
  lakes,
  fitToResults = false,
}: {
  lakes: LakeListDto[];
  fitToResults?: boolean;
}) {
  const { userLocation, setUserLocation } = useUserLocation();

  const handleLocationFound = useCallback(
    (location: UserLocation) => {
      if (isValidLocation(location)) {
        setUserLocation(location);
      }
    },
    [setUserLocation]
  );

  const validUserLocation =
    userLocation && isValidLocation(userLocation) ? userLocation : null;

  return (
    <div>
      <div className="relative h-[420px] overflow-hidden rounded-panel border border-border bg-surface-muted sm:h-[480px] lg:h-[520px]">
        <MapContainer
          center={POLAND_CENTER}
          zoom={POLAND_ZOOM}
          minZoom={5}
          scrollWheelZoom
          className="h-full w-full"
        >
          <PolishVectorBaseLayer />

          <FitMapToLakes lakes={lakes} enabled={fitToResults} />

          <MapLocationButton onLocationFound={handleLocationFound} />

          {validUserLocation && (
            <Marker
              position={[validUserLocation.lat, validUserLocation.lng]}
              icon={userIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <p className="font-semibold text-text">Twoja lokalizacja</p>
              </Popup>
            </Marker>
          )}

          <ClusteredLakeMarkers lakes={lakes} />
        </MapContainer>

        {lakes.length === 0 && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[900] mx-auto max-w-sm rounded-card border border-border bg-surface/95 px-4 py-3 text-center shadow-card backdrop-blur">
            <p className="text-sm font-bold text-text">
              Brak łowisk dla tych filtrów
            </p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Zmień filtry, aby ponownie wyświetlić miejsca na mapie.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-7 flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs font-medium text-text-secondary">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-text-muted">
          Legenda
        </span>

        <LegendDot color="var(--rybio-map-pzw)" label="PZW" />
        <LegendDot color="var(--rybio-map-commercial)" label="Komercyjne" />

        {validUserLocation && (
          <LegendDot color="var(--rybio-map-user)" label="Twoja lokalizacja" />
        )}

        <LegendCluster />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function LegendCluster() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-map-cluster px-1 text-[9px] font-bold text-white">
        12
      </span>
      Grupa łowisk
    </span>
  );
}
