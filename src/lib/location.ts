export type UserLocation = {
  lat: number;
  lng: number;
};

export const USER_LOCATION_STORAGE_KEY = "rybit-user-location";
export const USER_LOCATION_UPDATED_EVENT = "rybit:user-location-updated";

export function isValidLocation(location: unknown): location is UserLocation {
  if (!location || typeof location !== "object") {
    return false;
  }

  const parsedLocation = location as Partial<UserLocation>;

  return (
    typeof parsedLocation.lat === "number" &&
    typeof parsedLocation.lng === "number" &&
    Number.isFinite(parsedLocation.lat) &&
    Number.isFinite(parsedLocation.lng) &&
    parsedLocation.lat >= -90 &&
    parsedLocation.lat <= 90 &&
    parsedLocation.lng >= -180 &&
    parsedLocation.lng <= 180
  );
}

export function getSavedUserLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedLocation = window.localStorage.getItem(
      USER_LOCATION_STORAGE_KEY
    );

    if (!savedLocation) {
      return null;
    }

    const parsedLocation = JSON.parse(savedLocation);

    if (!isValidLocation(parsedLocation)) {
      window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
      return null;
    }

    return parsedLocation;
  } catch {
    window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    return null;
  }
}

export function saveUserLocation(location: UserLocation) {
  if (typeof window === "undefined") {
    return;
  }

  if (!isValidLocation(location)) {
    window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    USER_LOCATION_STORAGE_KEY,
    JSON.stringify(location)
  );
}

export function broadcastUserLocation(location: UserLocation) {
  if (typeof window === "undefined" || !isValidLocation(location)) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<UserLocation>(USER_LOCATION_UPDATED_EVENT, {
      detail: location,
    })
  );
}

export function saveAndBroadcastUserLocation(location: UserLocation) {
  if (!isValidLocation(location)) {
    return;
  }

  saveUserLocation(location);
  broadcastUserLocation(location);
}

export function requestUserLocation(
  options: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 5 * 60 * 1000,
  }
) {
  return new Promise<UserLocation>((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Twoja przeglądarka nie obsługuje geolokalizacji."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!isValidLocation(location)) {
          reject(
            new Error(
              "Przeglądarka zwróciła nieprawidłowe współrzędne lokalizacji."
            )
          );
          return;
        }

        resolve(location);
      },
      () => {
        reject(
          new Error(
            "Nie udało się pobrać lokalizacji. Sprawdź zgodę w przeglądarce."
          )
        );
      },
      options
    );
  });
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceInKm(
  firstLocation: UserLocation,
  secondLocation: UserLocation
) {
  if (
    !isValidLocation(firstLocation) ||
    !isValidLocation(secondLocation)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusInKm = 6371;

  const firstLat = toRadians(firstLocation.lat);
  const secondLat = toRadians(secondLocation.lat);
  const latDifference = toRadians(secondLocation.lat - firstLocation.lat);
  const lngDifference = toRadians(secondLocation.lng - firstLocation.lng);

  const haversineValue =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(firstLat) *
      Math.cos(secondLat) *
      Math.sin(lngDifference / 2) *
      Math.sin(lngDifference / 2);

  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return earthRadiusInKm * centralAngle;
}

export function formatDistanceInKm(distance: number) {
  if (!Number.isFinite(distance)) {
    return "—";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  }

  return `${Math.round(distance)} km`;
}

export function getDistanceLabel(
  userLocation: UserLocation | null,
  targetLocation: UserLocation
) {
  if (!userLocation || !isValidLocation(userLocation)) {
    return "Włącz lokalizację";
  }

  if (!isValidLocation(targetLocation)) {
    return "Brak lokalizacji";
  }

  const distance = calculateDistanceInKm(userLocation, targetLocation);

  return formatDistanceInKm(distance);
}