"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudSun, RefreshCw, MapPin } from "lucide-react";
import type { WidgetComponentProps } from "@/lib/widgets-types";

const COORDS_KEY = "widget-weather-coords";
const REFRESH_MS = 30 * 60 * 1000;
const DEFAULT = { lat: 48.8566, lon: 2.3522 };

interface WeatherData {
  city: string;
  region: string | null;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    label: string;
    emoji: string;
  };
  days: { date: string; emoji: string; max: number; min: number }[];
}

function dayLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Auj.";
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return "Dem.";
  return d.toLocaleDateString("fr-FR", { weekday: "short" });
}

export function WeatherWidget({ state }: WidgetComponentProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (coords?: { lat: number; lon: number }) => {
    setRefreshing(true);
    let lat = coords?.lat;
    let lon = coords?.lon;

    if (lat == null || lon == null) {
      try {
        const raw = localStorage.getItem(COORDS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { lat: number; lon: number };
          lat = parsed.lat;
          lon = parsed.lon;
        }
      } catch {
        /* ignore */
      }
    }

    lat ??= DEFAULT.lat;
    lon ??= DEFAULT.lon;

    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      setData(json);
      setError(null);
    } catch {
      setError("Météo indisponible");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      load();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        try {
          localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
        } catch {
          /* ignore */
        }
        load(coords);
      },
      () => load(),
      { timeout: 8000, maximumAge: 600_000 },
    );

    const t = setInterval(() => load(), REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const isBold = state.style === "bold";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#D2D3CC] dark:border-[#3a3b3f] shrink-0">
        <CloudSun className="w-3.5 h-3.5 text-[#9EA096]" />
        <span className="text-[11px] uppercase tracking-wider text-[#9EA096] font-semibold">
          Météo
        </span>
        <button
          onClick={() => load()}
          disabled={refreshing}
          className="ml-auto p-1 rounded-[5px] text-[#9EA096] hover:text-[#23251D] dark:hover:text-[#EAECF6] hover:bg-[#E5E7E0]/60 dark:hover:bg-[#2a2b2f]/60 transition-colors cursor-default"
          aria-label="Rafraîchir"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-3 py-2 min-h-0">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-24 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f]" />
            <div className="h-3 w-32 rounded bg-[#E5E7E0] dark:bg-[#2a2b2f]" />
          </div>
        ) : error ? (
          <p className="text-[12px] text-[#9EA096] text-center">{error}</p>
        ) : data ? (
          <>
            <div className="flex items-center gap-1 text-[11px] text-[#9EA096] mb-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {data.city}
                {data.region ? ` · ${data.region}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none" aria-hidden>
                {data.current.emoji}
              </span>
              <div>
                <div
                  className={`font-bold tabular-nums leading-none ${
                    isBold ? "text-[#EB9D2A]" : "text-[#23251D] dark:text-[#EAECF6]"
                  }`}
                  style={{ fontSize: "min(2.4rem, 20cqw)" }}
                >
                  {data.current.temperature}°
                </div>
                <div className="text-[11px] text-[#9EA096] mt-0.5">{data.current.label}</div>
              </div>
            </div>

            <div className="flex gap-3 mt-2 text-[10px] text-[#9EA096]">
              <span>Ressenti {data.current.feelsLike}°</span>
              <span>Hum. {data.current.humidity}%</span>
              <span>Vent {data.current.wind} km/h</span>
            </div>

            <div className="flex gap-2 mt-3 pt-2 border-t border-[#D2D3CC]/60 dark:border-[#3a3b3f]/60">
              {data.days.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 text-center min-w-0"
                >
                  <div className="text-[10px] text-[#9EA096] capitalize">{dayLabel(d.date)}</div>
                  <div className="text-base leading-none my-0.5">{d.emoji}</div>
                  <div className="text-[11px] font-medium text-[#23251D] dark:text-[#EAECF6] tabular-nums">
                    {d.max}° <span className="text-[#9EA096] font-normal">{d.min}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
