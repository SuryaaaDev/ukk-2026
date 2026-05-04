"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MqttClient } from "mqtt";
import { AlertTriangle, Droplets, Moon, Sun, Thermometer } from "lucide-react";
import HumidityChart from "@/components/HumidityChart";
import LoadingScreen from "@/components/LoadingScreen";
import RelayCard from "@/components/RelayCard";
import SensorCard from "@/components/SensorCard";
import SensorHistoryTable from "@/components/SensorHistoryTable";
import TemperatureChart from "@/components/TemperatureChart";
import ThemeToggle from "@/components/ThemeToggle";
import { connectMqtt, initialSensorState, publishMode, publishRelay, RelayKey, SensorState } from "@/lib/mqtt";
import type { SensorDataRow } from "@/lib/types";

type ChartPoint = {
  time: string;
  suhu: number | null;
  kelembaban: number | null;
};

const MAX_POINTS = 50;

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sensor, setSensor] = useState<SensorState>(initialSensorState);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [historyRows, setHistoryRows] = useState<SensorDataRow[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showTempWarning, setShowTempWarning] = useState(false);
  const clientRef = useRef<MqttClient | null>(null);
  const lastWarningAtRef = useRef(0);

  const playWarningSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const beep = (start: number, duration: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      beep(now, 0.18, 880);
      beep(now + 0.24, 0.18, 880);
      beep(now + 0.48, 0.24, 740);
    } catch (error) {
      console.error("Failed playing warning sound:", error);
    }
  };

  const fetchHistory = async (showLoading = false) => {
    if (showLoading) setIsHistoryLoading(true);
    try {
      const res = await fetch("/api/sensor-data?limit=10", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch history");
      const body = (await res.json()) as { data: SensorDataRow[] };
      setHistoryRows(body.data ?? []);
    } catch (error) {
      console.error("Failed loading history:", error);
    } finally {
      if (showLoading) setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");

    const timer = window.setTimeout(() => setIsReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const client = connectMqtt(setIsConnected, setSensor, () => {
      void fetchHistory(false);
    });
    clientRef.current = client;
    return () => {
      client.end(true);
    };
  }, []);

  useEffect(() => {
    void fetchHistory(true);
    const timer = window.setInterval(() => {
      void fetchHistory(false);
    }, 15000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (sensor.suhu === null && sensor.kelembaban === null) return;

    const point: ChartPoint = {
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }),
      suhu: sensor.suhu,
      kelembaban: sensor.kelembaban
    };

    setChartData((prev) => [...prev.slice(-(MAX_POINTS - 1)), point]);
  }, [sensor.suhu, sensor.kelembaban]);

  useEffect(() => {
    if (sensor.suhu === null || sensor.suhu < 30) return;
    const now = Date.now();
    const WARNING_COOLDOWN_MS = 60000;
    if (now - lastWarningAtRef.current < WARNING_COOLDOWN_MS) return;
    lastWarningAtRef.current = now;
    setShowTempWarning(true);
    playWarningSound();
  }, [sensor.suhu]);

  useEffect(() => {
    if (!showTempWarning) return;
    const soundTimer = window.setInterval(() => {
      playWarningSound();
    }, 6000);
    return () => {
      window.clearInterval(soundTimer);
    };
  }, [showTempWarning]);

  const relays = useMemo(
    () => ({
      relay1: sensor.relay1,
      relay2: sensor.relay2,
      relay3: sensor.relay3,
      relay4: sensor.relay4
    }),
    [sensor.relay1, sensor.relay2, sensor.relay3, sensor.relay4]
  );

  const onToggleRelay = (relay: RelayKey, next: boolean) => {
    if (sensor.mode === "AUTO") return;
    setSensor((prev) => ({ ...prev, [relay]: next }));
    publishRelay(clientRef.current, relay, next);
  };

  const onSetMode = (mode: "MANUAL" | "AUTO") => {
    publishMode(clientRef.current, mode);
  };

  const onToggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const onExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/sensor-data?format=csv&limit=5000", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to export CSV");
      const csvText = await res.text();
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sensor_data_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export CSV failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_#0b1220_0%,_#020617_55%,_#020617_100%)] dark:text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <header className="rounded-2xl border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">IoT Monitoring Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">Realtime Control and Monitoring via MQTT</p>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isConnected
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`} />
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SensorCard
            title="Suhu"
            value={sensor.suhu !== null ? `${sensor.suhu.toFixed(1)} C` : "-"}
            icon={Thermometer}
            color="bg-orange-500"
            isLoading={sensor.suhu === null}
          />
          <SensorCard
            title="Kelembaban"
            value={sensor.kelembaban !== null ? `${sensor.kelembaban.toFixed(1)} %` : "-"}
            icon={Droplets}
            color="bg-sky-500"
            isLoading={sensor.kelembaban === null}
          />
          <SensorCard
            title="Status LDR"
            value={sensor.ldr ?? "-"}
            icon={sensor.ldr === "Gelap" ? Moon : Sun}
            color={sensor.ldr === "Gelap" ? "bg-slate-700" : "bg-yellow-500"}
            isLoading={sensor.ldr === null}
            subtitle="Terang / Gelap"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <TemperatureChart data={chartData} />
          <HumidityChart data={chartData} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mode Control</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manual / Auto</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/90">
                <button
                  onClick={() => onSetMode("MANUAL")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    sensor.mode === "MANUAL"
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => onSetMode("AUTO")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    sensor.mode === "AUTO"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                      : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Auto
                </button>
              </div>

              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sensor.mode === "AUTO"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : sensor.mode === "MANUAL"
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                Mode aktif: {sensor.mode ?? "Belum ada data"}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Relay Control</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {sensor.mode === "AUTO" ? "Mode AUTO: Relay terkunci" : "Realtime ON / OFF"}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RelayCard
              label="Relay 1"
              isOn={relays.relay1}
              disabled={sensor.mode === "AUTO"}
              onToggle={() => onToggleRelay("relay1", !relays.relay1)}
            />
            <RelayCard
              label="Relay 2"
              isOn={relays.relay2}
              disabled={sensor.mode === "AUTO"}
              onToggle={() => onToggleRelay("relay2", !relays.relay2)}
            />
            <RelayCard
              label="Relay 3"
              isOn={relays.relay3}
              disabled={sensor.mode === "AUTO"}
              onToggle={() => onToggleRelay("relay3", !relays.relay3)}
            />
            <RelayCard
              label="Relay 4"
              isOn={relays.relay4}
              disabled={sensor.mode === "AUTO"}
              onToggle={() => onToggleRelay("relay4", !relays.relay4)}
            />
          </div>
        </section>

        <SensorHistoryTable rows={historyRows} isLoading={isHistoryLoading} isExporting={isExporting} onExport={onExportCsv} />
      </div>

      {showTempWarning ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-rose-300/70 bg-gradient-to-r from-rose-50/95 via-white/95 to-amber-50/95 p-4 shadow-2xl backdrop-blur animate-fade-in dark:border-rose-500/40 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-rose-900/25">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-base font-bold text-rose-700 dark:text-rose-300">Peringatan Suhu Tinggi</h3>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
                    Critical
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Suhu mencapai <span className="font-semibold">{sensor.suhu?.toFixed(1)}°C</span>. Segera cek perangkat IoT Anda.
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950/40">
                  <div className="h-full w-full animate-pulse bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTempWarning(false)}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
