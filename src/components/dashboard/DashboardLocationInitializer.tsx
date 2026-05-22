"use client";

import { useEffect, useRef } from "react";

import {
  getSavedUserLocation,
  requestUserLocation,
  saveAndBroadcastUserLocation,
} from "@/lib/location";

export function DashboardLocationInitializer() {
  const hasRequestedLocation = useRef(false);

  useEffect(() => {
    if (hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;

    const savedLocation = getSavedUserLocation();

    if (savedLocation) {
      saveAndBroadcastUserLocation(savedLocation);
      return;
    }

    requestUserLocation({
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    })
      .then((location) => {
        saveAndBroadcastUserLocation(location);
      })
      .catch((error) => {
        console.warn(
          "[DashboardLocationInitializer] Nie udało się pobrać lokalizacji:",
          error
        );
      });
  }, []);

  return null;
}