import { NextRequest, NextResponse } from "next/server";

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    pressure_msl: number;
  };
};

function getWeatherDescription(code: number) {
  const weatherCodes: Record<number, string> = {
    0: "Bezchmurnie",
    1: "Głównie bezchmurnie",
    2: "Częściowe zachmurzenie",
    3: "Pochmurno",
    45: "Mgła",
    48: "Mgła osadzająca szadź",
    51: "Lekka mżawka",
    53: "Mżawka",
    55: "Gęsta mżawka",
    61: "Lekki deszcz",
    63: "Deszcz",
    65: "Intensywny deszcz",
    71: "Lekki śnieg",
    73: "Śnieg",
    75: "Intensywny śnieg",
    80: "Przelotny deszcz",
    81: "Przelotne opady",
    82: "Silne przelotne opady",
    95: "Burza",
    96: "Burza z gradem",
    99: "Silna burza z gradem",
  };

  return weatherCodes[code] ?? "Brak opisu pogody";
}

function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";

  return "🌤️";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { message: "Brakuje parametrów lat i lng." },
      { status: 400 }
    );
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lng);
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "pressure_msl",
    ].join(",")
  );
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString(), {
    next: {
      revalidate: 900,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Nie udało się pobrać pogody." },
      { status: 500 }
    );
  }

  const data = (await response.json()) as OpenMeteoResponse;

  return NextResponse.json({
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    windSpeed: Math.round(data.current.wind_speed_10m),
    humidity: data.current.relative_humidity_2m,
    pressure: Math.round(data.current.pressure_msl),
    weatherCode: data.current.weather_code,
    description: getWeatherDescription(data.current.weather_code),
    icon: getWeatherIcon(data.current.weather_code),
  });
}