"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type UserLocation = {
  lat: number;
  lng: number;
};

type Weather = {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
};

export function WeatherCard() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchWeather(location: UserLocation) {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/weather?lat=${location.lat}&lng=${location.lng}`
      );

      if (!response.ok) {
        throw new Error("Nie udało się pobrać pogody.");
      }

      const data = (await response.json()) as Weather;

      setWeather(data);
    } catch (error) {
      console.error(error);
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const savedLocation = localStorage.getItem("rybit-user-location");

    if (savedLocation) {
      const parsedLocation = JSON.parse(savedLocation) as UserLocation;

      setUserLocation(parsedLocation);
      fetchWeather(parsedLocation);
    }

    function handleLocationUpdated(event: Event) {
      const customEvent = event as CustomEvent<UserLocation>;

      setUserLocation(customEvent.detail);
      fetchWeather(customEvent.detail);
    }

    window.addEventListener("rybit:user-location-updated", handleLocationUpdated);

    return () => {
      window.removeEventListener(
        "rybit:user-location-updated",
        handleLocationUpdated
      );
    };
  }, []);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Pogoda</h2>

          <p className="text-sm text-slate-500">
            {userLocation ? "Twoja lokalizacja" : "Brak lokalizacji"}
          </p>
        </div>

        <Link href="/pogoda" className="text-sm font-bold text-blue-600">
          Zobacz więcej
        </Link>
      </div>

      {!userLocation && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">
            Kliknij „Moja lokalizacja” na mapie.
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Po zaakceptowaniu zgody pokażemy aktualną pogodę dla Twojej okolicy.
          </p>
        </div>
      )}

      {userLocation && isLoading && (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
          Pobieranie aktualnej pogody...
        </div>
      )}

      {userLocation && weather && !isLoading && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold">{weather.temperature}°C</p>

              <p className="mt-2 text-sm text-slate-500">
                {weather.description}, odczuwalnie {weather.feelsLike}°C
              </p>
            </div>

            <div className="text-6xl">{weather.icon}</div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5 text-sm">
            <WeatherStat label="Wiatr" value={`${weather.windSpeed} km/h`} />
            <WeatherStat label="Ciśnienie" value={`${weather.pressure} hPa`} />
            <WeatherStat label="Wilgotność" value={`${weather.humidity}%`} />
          </div>
        </>
      )}
    </section>
  );
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}