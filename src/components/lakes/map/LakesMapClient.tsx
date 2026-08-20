"use client";

import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import {
  areBoundsEqual,
  normalizeLakeExplorerBounds,
  roundBounds,
} from "@/lib/lake-explorer-params";
import type {
  LakeExplorerBounds,
  LakeMapPointDto,
} from "@/lib/lake-explorer-types";
import {
  isValidLocation,
  type UserLocation,
} from "@/lib/location";

function toLeafletBounds(bounds: LakeExplorerBounds) {
  return L.latLngBounds(
    [bounds.south, bounds.west],
    [bounds.north, bounds.east]
  );
}

function getCurrentBounds(map: L.Map): LakeExplorerBounds {
  const bounds = map.getBounds();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

function isValidMapPoint(point: LakeMapPointDto) {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

function createLakeIcon({
  type,
  selected,
  hovered,
}: {
  type: "pzw" | "commercial";
  selected: boolean;
  hovered: boolean;
}) {
  const size = selected ? 34 : hovered ? 31 : 26;

  const color =
    type === "commercial"
      ? "var(--rybio-map-commercial)"
      : "var(--rybio-map-pzw)";

  const shadow =
    selected || hovered
      ? "0 8px 20px rgba(13,30,51,.28),0 0 0 4px rgba(121,216,213,.30)"
      : "0 5px 14px rgba(13,30,51,.18)";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${color};
        border:3px solid #fff;
        box-shadow:${shadow};
        transition:width .15s ease,height .15s ease,box-shadow .15s ease;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createUserIcon() {
  const size = 26;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:var(--rybio-map-user);
        border:3px solid #fff;
        box-shadow:0 6px 16px rgba(249,115,22,.28);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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

type LakeCluster = {
  id: string;
  points: LakeMapPointDto[];
  lat: number;
  lng: number;
};


function MapResizeController() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frameId: number | null = null;
    let secondFrameId: number | null = null;

    function refreshSize() {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (secondFrameId !== null) {
        window.cancelAnimationFrame(secondFrameId);
      }

      frameId = window.requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }

        map.invalidateSize({
          animate: false,
          pan: false,
        });

        /**
         * Druga klatka jest celowa. Na mobile przełączenie `Lista -> Mapa`
         * może zmienić rozmiar kontenera dopiero po zakończeniu bieżącego layoutu.
         */
        secondFrameId = window.requestAnimationFrame(() => {
          const nextRect = container.getBoundingClientRect();

          if (nextRect.width > 0 && nextRect.height > 0) {
            map.invalidateSize({
              animate: false,
              pan: false,
            });
          }
        });
      });
    }

    refreshSize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            refreshSize();
          })
        : null;

    resizeObserver?.observe(container);
    window.addEventListener("resize", refreshSize);
    window.addEventListener("orientationchange", refreshSize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", refreshSize);
      window.removeEventListener("orientationchange", refreshSize);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (secondFrameId !== null) {
        window.cancelAnimationFrame(secondFrameId);
      }
    };
  }, [map]);

  return null;
}

function MapController({
  activeBounds,
  focusLocation,
  onViewportChange,
}: {
  activeBounds: LakeExplorerBounds;
  focusLocation:
    | (UserLocation & {
        token: number;
      })
    | null;
  onViewportChange: (bounds: LakeExplorerBounds) => void;
}) {
  const suppressViewportEventsRef = useRef(true);
  const viewportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const releaseSuppressionTimerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  function scheduleViewportChange(map: L.Map) {
    if (suppressViewportEventsRef.current) {
      return;
    }

    if (viewportTimerRef.current) {
      clearTimeout(viewportTimerRef.current);
    }

    /**
     * Leaflet potrafi wyemitować zarówno zoomend, jak i moveend
     * dla jednej interakcji. Krótki debounce scala je do jednego bboxu.
     */
    viewportTimerRef.current = setTimeout(() => {
      const bounds = normalizeLakeExplorerBounds(getCurrentBounds(map));

      if (bounds) {
        onViewportChange(roundBounds(bounds));
      }
    }, 90);
  }

  const map = useMapEvents({
    moveend() {
      scheduleViewportChange(map);
    },
    zoomend() {
      scheduleViewportChange(map);
    },
  });

  useEffect(() => {
    const normalizedTarget = normalizeLakeExplorerBounds(activeBounds);

    if (!normalizedTarget) {
      return;
    }

    const currentBounds = normalizeLakeExplorerBounds(getCurrentBounds(map));

    /**
     * Gdy activeBounds pochodzi bezpośrednio z ręcznego przesunięcia mapy,
     * nie wykonujemy ponownie fitBounds. Zapobiega to "odbiciu" mapy i pętli
     * moveend -> state -> fitBounds -> moveend.
     */
    if (
      currentBounds &&
      areBoundsEqual(roundBounds(currentBounds), roundBounds(normalizedTarget), 0.002)
    ) {
      suppressViewportEventsRef.current = false;
      return;
    }

    suppressViewportEventsRef.current = true;

    map.fitBounds(toLeafletBounds(normalizedTarget), {
      animate: false,
      padding: [12, 12],
      maxZoom: 12,
    });

    if (releaseSuppressionTimerRef.current) {
      clearTimeout(releaseSuppressionTimerRef.current);
    }

    releaseSuppressionTimerRef.current = setTimeout(() => {
      suppressViewportEventsRef.current = false;
    }, 140);
  }, [activeBounds, map]);

  useEffect(() => {
    if (!focusLocation || !isValidLocation(focusLocation)) {
      return;
    }

    const lat = Number(focusLocation.lat);
    const lng = Number(focusLocation.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let frameId: number | null = null;

    const handleMoveEnd = () => {
      suppressViewportEventsRef.current = false;

      const bounds = normalizeLakeExplorerBounds(getCurrentBounds(map));

      if (bounds) {
        onViewportChange(roundBounds(bounds));
      }
    };

    function focusMap(attempt = 0) {
      if (cancelled) {
        return;
      }

      const container = map.getContainer();
      const rect = container.getBoundingClientRect();

      /**
       * Leaflet nie może wykonywać animowanego flyTo, gdy mapa była wcześniej
       * zamontowana w kontenerze `display:none`. W takim przypadku rozmiar mapy
       * wynosi 0x0, a obliczenia animacji kończą się LatLng(NaN, NaN).
       */
      if (rect.width <= 0 || rect.height <= 0) {
        if (attempt < 12) {
          retryTimer = setTimeout(() => focusMap(attempt + 1), 50);
        }

        return;
      }

      map.invalidateSize({
        animate: false,
        pan: false,
      });

      const size = map.getSize();

      if (
        !Number.isFinite(size.x) ||
        !Number.isFinite(size.y) ||
        size.x <= 0 ||
        size.y <= 0
      ) {
        if (attempt < 12) {
          retryTimer = setTimeout(() => focusMap(attempt + 1), 50);
        }

        return;
      }

      suppressViewportEventsRef.current = true;
      map.off("moveend", handleMoveEnd);
      map.once("moveend", handleMoveEnd);

      /**
       * Tworzymy LatLng jawnie po ponownej walidacji. Gdyby Leaflet mimo to
       * nie mógł uruchomić animacji (np. podczas bardzo szybkiej zmiany
       * orientacji), bezpiecznie przechodzimy do setView.
       */
      const target = L.latLng(lat, lng);

      try {
        map.flyTo(target, 11, {
          duration: 0.65,
        });
      } catch {
        map.off("moveend", handleMoveEnd);
        map.setView(target, 11, {
          animate: false,
        });
        suppressViewportEventsRef.current = false;

        const bounds = normalizeLakeExplorerBounds(getCurrentBounds(map));

        if (bounds) {
          onViewportChange(roundBounds(bounds));
        }
      }
    }

    frameId = window.requestAnimationFrame(() => {
      focusMap();
    });

    return () => {
      cancelled = true;
      map.off("moveend", handleMoveEnd);

      if (retryTimer) {
        clearTimeout(retryTimer);
      }

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [focusLocation?.lat, focusLocation?.lng, focusLocation?.token, map, onViewportChange]);

  useEffect(() => {
    return () => {
      if (viewportTimerRef.current) {
        clearTimeout(viewportTimerRef.current);
      }

      if (releaseSuppressionTimerRef.current) {
        clearTimeout(releaseSuppressionTimerRef.current);
      }
    };
  }, []);

  return null;
}

function ClusteredMarkers({
  points,
  selectedLakeId,
  hoveredLakeId,
  onSelectLake,
}: {
  points: LakeMapPointDto[];
  selectedLakeId: string | null;
  hoveredLakeId: string | null;
  onSelectLake: (lakeId: string) => void;
}) {
  const [viewportVersion, setViewportVersion] = useState(0);

  const map = useMapEvents({
    moveend() {
      setViewportVersion((value) => value + 1);
    },
    zoomend() {
      setViewportVersion((value) => value + 1);
    },
  });

  const clusters = useMemo(() => {
    const zoom = map.getZoom();
    const visibleBounds = map.getBounds().pad(0.18);

    const visiblePoints = points.filter(
      (point) =>
        isValidMapPoint(point) &&
        visibleBounds.contains([point.lat, point.lng])
    );

    if (zoom >= 12) {
      return visiblePoints.map(
        (point) =>
          ({
            id: point.id,
            points: [point],
            lat: point.lat,
            lng: point.lng,
          }) satisfies LakeCluster
      );
    }

    const cellSize =
      zoom <= 6
        ? 78
        : zoom === 7
          ? 68
          : zoom === 8
            ? 58
            : zoom === 9
              ? 50
              : zoom === 10
                ? 44
                : 38;

    const buckets = new Map<string, LakeMapPointDto[]>();

    for (const point of visiblePoints) {
      const pixel = map.latLngToContainerPoint([point.lat, point.lng]);
      const key = `${Math.floor(pixel.x / cellSize)}:${Math.floor(
        pixel.y / cellSize
      )}`;
      const bucket = buckets.get(key) ?? [];

      bucket.push(point);
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries()).map(([key, bucket]) => {
      const lat =
        bucket.reduce((sum, point) => sum + point.lat, 0) / bucket.length;
      const lng =
        bucket.reduce((sum, point) => sum + point.lng, 0) / bucket.length;

      return {
        id: key,
        points: bucket,
        lat,
        lng,
      } satisfies LakeCluster;
    });
  }, [map, points, viewportVersion]);

  function openCluster(cluster: LakeCluster) {
    const validPoints = cluster.points.filter(isValidMapPoint);

    if (validPoints.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      validPoints.map(
        (point) => [point.lat, point.lng] as [number, number]
      )
    );

    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.setView(
        [cluster.lat, cluster.lng],
        Math.min(map.getZoom() + 2, 13)
      );
      return;
    }

    map.fitBounds(bounds, {
      padding: [36, 36],
      maxZoom: Math.min(map.getZoom() + 2, 13),
    });
  }

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.points.length > 1) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(cluster.points.length)}
              eventHandlers={{
                click: () => openCluster(cluster),
              }}
              title={`${cluster.points.length} łowisk`}
            />
          );
        }

        const point = cluster.points[0];

        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createLakeIcon({
              type: point.type,
              selected: selectedLakeId === point.id,
              hovered: hoveredLakeId === point.id,
            })}
            zIndexOffset={
              selectedLakeId === point.id
                ? 1200
                : hoveredLakeId === point.id
                  ? 900
                  : 0
            }
            riseOnHover
            title={point.name}
            eventHandlers={{
              click: () => onSelectLake(point.id),
            }}
          />
        );
      })}
    </>
  );
}

export function LakesMapClient({
  points,
  activeBounds,
  userLocation,
  focusLocation,
  selectedLakeId,
  hoveredLakeId,
  onViewportChange,
  onSelectLake,
}: {
  points: LakeMapPointDto[];
  activeBounds: LakeExplorerBounds;
  userLocation: UserLocation | null;
  focusLocation:
    | (UserLocation & {
        token: number;
      })
    | null;
  selectedLakeId: string | null;
  hoveredLakeId: string | null;
  onViewportChange: (bounds: LakeExplorerBounds) => void;
  onSelectLake: (lakeId: string | null) => void;
}) {
  const normalizedBounds = normalizeLakeExplorerBounds(activeBounds);

  const center: [number, number] = normalizedBounds
    ? [
        (normalizedBounds.north + normalizedBounds.south) / 2,
        (normalizedBounds.east + normalizedBounds.west) / 2,
      ]
    : [52.0693, 19.4803];

  const safeUserLocation =
    userLocation && isValidLocation(userLocation) ? userLocation : null;

  return (
    <MapContainer
      center={center}
      zoom={6}
      minZoom={5}
      maxZoom={17}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <MapResizeController />

      <MapController
        activeBounds={normalizedBounds ?? activeBounds}
        focusLocation={focusLocation}
        onViewportChange={onViewportChange}
      />

      {safeUserLocation && (
        <Marker
          position={[safeUserLocation.lat, safeUserLocation.lng]}
          icon={createUserIcon()}
          zIndexOffset={1500}
          title="Twoja lokalizacja"
        />
      )}

      <ClusteredMarkers
        points={points}
        selectedLakeId={selectedLakeId}
        hoveredLakeId={hoveredLakeId}
        onSelectLake={(lakeId) => onSelectLake(lakeId)}
      />
    </MapContainer>
  );
}
