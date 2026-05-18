"use client";

import { useEffect, useState } from "react";

type WeatherCurrent = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  weatherCode: number;
};

type WeatherDay = {
  date: string;
  weatherCode: number;
  temperatureMax: number | null;
  temperatureMin: number | null;
  apparentTemperatureMax: number | null;
  apparentTemperatureMin: number | null;
  precipitationProbability: number | null;
  precipitationSum: number | null;
  windSpeedMax: number | null;
  uvIndexMax: number | null;
  sunrise: string | null;
  sunset: string | null;
};

type WeatherResponse = {
  current: WeatherCurrent | null;
  forecast: WeatherDay[];
};

const fallbackLocation = {
  lat: 52.2297,
  lng: 21.0122,
  label: "Warszawa",
};

export function WeatherForecastPage() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [locationName, setLocationName] = useState("Twoja lokalizacja");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadWeather(lat: number, lng: number, label?: string) {
    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/weather/forecast?lat=${lat}&lng=${lng}`);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setMessage(data?.message || "Nie udało się pobrać prognozy pogody.");
      setIsLoading(false);
      return;
    }

    setWeather(data);
    setLocationName(label || "Twoja lokalizacja");
    setIsLoading(false);
  }

  function loadFallbackWeather() {
    loadWeather(fallbackLocation.lat, fallbackLocation.lng, fallbackLocation.label);
  }

  function loadUserLocation() {
    if (!navigator.geolocation) {
      setMessage("Twoja przeglądarka nie obsługuje geolokalizacji.");
      loadFallbackWeather();
      return;
    }

    setIsLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setMessage(
          "Nie udało się pobrać Twojej lokalizacji. Pokazuję pogodę dla Warszawy."
        );
        loadFallbackWeather();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  useEffect(() => {
    loadUserLocation();
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Pogoda
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Sprawdź aktualne warunki oraz prognozę na najbliższe 7 dni przed
            planowaną wyprawą.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUserLocation}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Użyj mojej lokalizacji
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm font-semibold text-amber-700">
          {message}
        </div>
      )}

      {isLoading ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Pobieranie pogody...
          </p>

          <p className="mt-2 text-slate-500">
            Sprawdzam aktualne warunki i prognozę.
          </p>
        </section>
      ) : weather ? (
        <div className="space-y-6">
          {weather.current && (
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50 p-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-500">
                      Aktualna pogoda
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-950">
                      {locationName}
                    </h2>

                    <p className="mt-2 text-slate-500">
                      {getWeatherLabel(weather.current.weatherCode)}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-6xl">
                      {getWeatherIcon(weather.current.weatherCode)}
                    </div>

                    <div>
                      <p className="text-6xl font-black tracking-tight text-slate-950">
                        {Math.round(weather.current.temperature)}°C
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        Odczuwalnie{" "}
                        {Math.round(weather.current.apparentTemperature)}°C
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                <WeatherStat
                  label="Wiatr"
                  value={`${Math.round(weather.current.windSpeed)} km/h`}
                />

                <WeatherStat
                  label="Ciśnienie"
                  value={`${Math.round(weather.current.pressure)} hPa`}
                />

                <WeatherStat
                  label="Wilgotność"
                  value={`${Math.round(weather.current.humidity)}%`}
                />

                <WeatherStat
                  label="Aktualizacja"
                  value={formatTime(weather.current.time)}
                />
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Prognoza na 7 dni
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Temperatura, opady, wiatr, UV oraz godziny wschodu i zachodu
                  słońca.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                7 dni
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-7">
              {weather.forecast.map((day, index) => (
                <article
                  key={day.date}
                  className={`rounded-3xl border p-5 ${
                    index === 0
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {index === 0 ? "Dzisiaj" : formatWeekday(day.date)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {formatDate(day.date)}
                      </p>
                    </div>

                    <div className="text-3xl">
                      {getWeatherIcon(day.weatherCode)}
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    {getWeatherLabel(day.weatherCode)}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Max
                      </p>

                      <p className="mt-1 text-3xl font-black text-slate-950">
                        {formatTemperature(day.temperatureMax)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Min
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-500">
                        {formatTemperature(day.temperatureMin)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <SmallWeatherRow
                      label="Opady"
                      value={
                        day.precipitationProbability !== null
                          ? `${Math.round(day.precipitationProbability)}%`
                          : "Brak"
                      }
                    />

                    <SmallWeatherRow
                      label="Suma opadów"
                      value={
                        day.precipitationSum !== null
                          ? `${day.precipitationSum.toFixed(1)} mm`
                          : "Brak"
                      }
                    />

                    <SmallWeatherRow
                      label="Wiatr"
                      value={
                        day.windSpeedMax !== null
                          ? `${Math.round(day.windSpeedMax)} km/h`
                          : "Brak"
                      }
                    />

                    <SmallWeatherRow
                      label="UV"
                      value={
                        day.uvIndexMax !== null
                          ? day.uvIndexMax.toFixed(1)
                          : "Brak"
                      }
                    />

                    <SmallWeatherRow
                      label="Wschód"
                      value={day.sunrise ? formatTime(day.sunrise) : "Brak"}
                    />

                    <SmallWeatherRow
                      label="Zachód"
                      value={day.sunset ? formatTime(day.sunset) : "Brak"}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-bold text-slate-950">
            Brak danych pogodowych
          </p>

          <p className="mt-2 text-slate-500">
            Spróbuj ponownie pobrać lokalizację.
          </p>
        </section>
      )}
    </div>
  );
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function SmallWeatherRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2 last:border-none last:pb-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function formatTemperature(value: number | null) {
  if (value === null) {
    return "Brak";
  }

  return `${Math.round(value)}°C`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}

function formatWeekday(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

function getWeatherLabel(code: number) {
  if (code === 0) return "Bezchmurnie";
  if (code === 1) return "Głównie bezchmurnie";
  if (code === 2) return "Częściowe zachmurzenie";
  if (code === 3) return "Pochmurno";
  if (code === 45) return "Mgła";
  if (code === 48) return "Mgła osadzająca szadź";
  if (code === 51) return "Lekka mżawka";
  if (code === 53) return "Mżawka";
  if (code === 55) return "Silna mżawka";
  if (code === 56) return "Marznąca mżawka";
  if (code === 57) return "Silna marznąca mżawka";
  if (code === 61) return "Lekki deszcz";
  if (code === 63) return "Deszcz";
  if (code === 65) return "Silny deszcz";
  if (code === 66) return "Marznący deszcz";
  if (code === 67) return "Silny marznący deszcz";
  if (code === 71) return "Lekki śnieg";
  if (code === 73) return "Śnieg";
  if (code === 75) return "Silny śnieg";
  if (code === 77) return "Ziarna śniegu";
  if (code === 80) return "Lekkie przelotne opady";
  if (code === 81) return "Przelotne opady";
  if (code === 82) return "Silne przelotne opady";
  if (code === 85) return "Lekkie opady śniegu";
  if (code === 86) return "Silne opady śniegu";
  if (code === 95) return "Burza";
  if (code === 96) return "Burza z gradem";
  if (code === 99) return "Silna burza z gradem";
  return "Nieznane warunki";
}