"use client";

import { useEffect, useRef } from "react";

type UserLocation = {
  lat: number;
  lng: number;
};

const USER_LOCATION_STORAGE_KEY = "rybit-user-location";

function isValidLocation(location: unknown): location is UserLocation {
  if (!location || typeof location !== "object") {
    return false;
  }

  const parsedLocation = location as Partial<UserLocation>;

  return (
    typeof parsedLocation.lat === "number" &&
    typeof parsedLocation.lng === "number" &&
    Number.isFinite(parsedLocation.lat) &&
    Number.isFinite(parsedLocation.lng)
  );
}

function saveAndBroadcastLocation(location: UserLocation) {
  localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(location));

  window.dispatchEvent(
    new CustomEvent("rybit:user-location-updated", {
      detail: location,
    })
  );
}

function getSavedLocation() {
  try {
    const savedLocation = localStorage.getItem(USER_LOCATION_STORAGE_KEY);

    if (!savedLocation) {
      return null;
    }

    const parsedLocation = JSON.parse(savedLocation);

    if (!isValidLocation(parsedLocation)) {
      localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
      return null;
    }

    return parsedLocation;
  } catch {
    localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    return null;
  }
}

export function DashboardLocationInitializer() {
  const hasRequestedLocation = useRef(false);

  useEffect(() => {
    if (hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;

    const savedLocation = getSavedLocation();

    if (savedLocation) {
      saveAndBroadcastLocation(savedLocation);
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

        saveAndBroadcastLocation(userLocation);
      },
      (error) => {
        console.warn(
          "[DashboardLocationInitializer] Nie udało się pobrać lokalizacji:",
          error
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

  return null;
}