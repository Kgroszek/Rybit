import { NextResponse } from "next/server";

type OpenMeteoResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    pressure_msl: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { message: "Brakuje poprawnych współrzędnych lokalizacji." },
      { status: 400 }
    );
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "pressure_msl",
      "wind_speed_10m",
      "weather_code",
    ].join(",")
  );

  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(",")
  );

  const response = await fetch(url.toString(), {
    next: {
      revalidate: 60 * 30,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Nie udało się pobrać prognozy pogody." },
      { status: 500 }
    );
  }

  const data = (await response.json()) as OpenMeteoResponse;

  const forecast =
    data.daily?.time.map((date, index) => ({
      date,
      weatherCode: data.daily?.weather_code[index] ?? 0,
      temperatureMax: data.daily?.temperature_2m_max[index] ?? null,
      temperatureMin: data.daily?.temperature_2m_min[index] ?? null,
      apparentTemperatureMax:
        data.daily?.apparent_temperature_max[index] ?? null,
      apparentTemperatureMin:
        data.daily?.apparent_temperature_min[index] ?? null,
      precipitationProbability:
        data.daily?.precipitation_probability_max[index] ?? null,
      precipitationSum: data.daily?.precipitation_sum[index] ?? null,
      windSpeedMax: data.daily?.wind_speed_10m_max[index] ?? null,
      uvIndexMax: data.daily?.uv_index_max[index] ?? null,
      sunrise: data.daily?.sunrise[index] ?? null,
      sunset: data.daily?.sunset[index] ?? null,
    })) ?? [];

  return NextResponse.json({
    current: data.current
      ? {
          time: data.current.time,
          temperature: data.current.temperature_2m,
          apparentTemperature: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          pressure: data.current.pressure_msl,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
        }
      : null,
    forecast,
  });
}