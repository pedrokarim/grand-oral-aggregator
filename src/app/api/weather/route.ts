import { NextRequest, NextResponse } from "next/server";

const WMO_LABELS: Record<number, { label: string; emoji: string }> = {
  0: { label: "Ciel dégagé", emoji: "☀️" },
  1: { label: "Peu nuageux", emoji: "🌤️" },
  2: { label: "Partiellement nuageux", emoji: "⛅" },
  3: { label: "Couvert", emoji: "☁️" },
  45: { label: "Brouillard", emoji: "🌫️" },
  48: { label: "Brouillard givrant", emoji: "🌫️" },
  51: { label: "Bruine légère", emoji: "🌦️" },
  53: { label: "Bruine", emoji: "🌦️" },
  55: { label: "Bruine dense", emoji: "🌦️" },
  61: { label: "Pluie faible", emoji: "🌧️" },
  63: { label: "Pluie modérée", emoji: "🌧️" },
  65: { label: "Pluie forte", emoji: "🌧️" },
  71: { label: "Neige faible", emoji: "❄️" },
  73: { label: "Neige modérée", emoji: "❄️" },
  75: { label: "Neige forte", emoji: "❄️" },
  80: { label: "Averses légères", emoji: "🌦️" },
  81: { label: "Averses", emoji: "🌦️" },
  82: { label: "Averses violentes", emoji: "⛈️" },
  95: { label: "Orage", emoji: "⛈️" },
  96: { label: "Orage avec grêle", emoji: "⛈️" },
  99: { label: "Orage violent", emoji: "⛈️" },
};

function wmo(code: number) {
  return WMO_LABELS[code] ?? { label: "Conditions variables", emoji: "🌡️" };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = sp.get("lat") ?? "48.8566";
  const lon = sp.get("lon") ?? "2.3522";

  try {
    const [forecastRes, geoRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`,
        { next: { revalidate: 900 } },
      ),
      fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=fr&count=1`,
        { next: { revalidate: 86400 } },
      ),
    ]);

    if (!forecastRes.ok) {
      return NextResponse.json({ error: "Météo indisponible" }, { status: 502 });
    }

    const forecast = await forecastRes.json();
    const geo = geoRes.ok ? await geoRes.json() : null;
    const place = geo?.results?.[0];
    const city = place?.name ?? "Position actuelle";
    const admin = place?.admin1;

    const current = forecast.current;
    const daily = forecast.daily;
    const now = wmo(current.weather_code);

    const days = daily.time.slice(0, 3).map((date: string, i: number) => {
      const code = daily.weather_code[i] as number;
      const info = wmo(code);
      return {
        date,
        label: info.label,
        emoji: info.emoji,
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
      };
    });

    return NextResponse.json({
      city,
      region: admin ?? null,
      current: {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        wind: Math.round(current.wind_speed_10m),
        label: now.label,
        emoji: now.emoji,
      },
      days,
    });
  } catch {
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500 });
  }
}
