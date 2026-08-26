"use client";

import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const OPEN_FREE_MAP_STYLE =
  "https://tiles.openfreemap.org/styles/positron";

const OPEN_FREE_MAP_ATTRIBUTION =
  '<a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a> © <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

function usesNameField(value: unknown) {
  if (typeof value === "string") {
    return value.toLowerCase().includes("name");
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value)
      .toLowerCase()
      .includes("name");
  }

  return false;
}

function applyPolishLabels(glMap: MapLibreMap) {
  const style = glMap.getStyle();

  for (const layer of style.layers ?? []) {
    if (layer.type !== "symbol") {
      continue;
    }

    const originalTextField =
      layer.layout?.["text-field"];

    if (
      originalTextField === undefined ||
      !usesNameField(originalTextField)
    ) {
      continue;
    }

    const originalFallback = Array.isArray(
      originalTextField
    )
      ? originalTextField
      : ["get", "name"];

    try {
      glMap.setLayoutProperty(
        layer.id,
        "text-field",
        [
          "coalesce",
          ["get", "name:pl"],
          ["get", "name"],
          originalFallback,
        ]
      );
    } catch (error) {
      console.warn(
        `[PolishVectorBaseLayer] Nie udało się przestawić etykiety ${layer.id}:`,
        error
      );
    }
  }
}

export function PolishVectorBaseLayer() {
  const map = useMap();

  useEffect(() => {
    const vectorLayer = maplibreGL({
      style: OPEN_FREE_MAP_STYLE,
      interactive: false,
      attributionControl: false,
    });

    vectorLayer.addTo(map);

    map.attributionControl.addAttribution(
      OPEN_FREE_MAP_ATTRIBUTION
    );

    const glMap =
      vectorLayer.getMaplibreMap();

    const handleStyleReady = () => {
      applyPolishLabels(glMap);
    };

    if (glMap.isStyleLoaded()) {
      handleStyleReady();
    } else {
      glMap.once("load", handleStyleReady);
    }

    return () => {
      glMap.off("load", handleStyleReady);

      map.attributionControl.removeAttribution(
        OPEN_FREE_MAP_ATTRIBUTION
      );

      if (map.hasLayer(vectorLayer)) {
        map.removeLayer(vectorLayer);
      }
    };
  }, [map]);

  return null;
}
