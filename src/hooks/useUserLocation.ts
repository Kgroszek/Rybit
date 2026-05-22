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

    if (savedLocation) {
      setUserLocationState(savedLocation);
    }

    function handleLocationUpdated(event: Event) {
      const customEvent = event as CustomEvent<UserLocation>;

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
    setUserLocationState(location);
    saveAndBroadcastUserLocation(location);
  }, []);

  return {
    userLocation,
    setUserLocation,
  };
}