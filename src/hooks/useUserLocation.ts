"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getSavedUserLocation,
  isValidLocation,
  saveAndBroadcastUserLocation,
  USER_LOCATION_UPDATED_EVENT,
  type UserLocation,
} from "@/lib/location";

export function useUserLocation() {
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(
    null
  );

  useEffect(() => {
    const savedLocation = getSavedUserLocation();

    if (savedLocation && isValidLocation(savedLocation)) {
      setUserLocationState(savedLocation);
    }

    function handleLocationUpdated(event: Event) {
      const customEvent = event as CustomEvent<unknown>;

      if (isValidLocation(customEvent.detail)) {
        setUserLocationState(customEvent.detail);
      }
    }

    window.addEventListener(
      USER_LOCATION_UPDATED_EVENT,
      handleLocationUpdated
    );

    return () => {
      window.removeEventListener(
        USER_LOCATION_UPDATED_EVENT,
        handleLocationUpdated
      );
    };
  }, []);

  const setUserLocation = useCallback((location: UserLocation) => {
    if (!isValidLocation(location)) {
      console.warn(
        "[useUserLocation] Pominięto nieprawidłową lokalizację:",
        location
      );
      return;
    }

    setUserLocationState(location);
    saveAndBroadcastUserLocation(location);
  }, []);

  return {
    userLocation,
    setUserLocation,
  };
}