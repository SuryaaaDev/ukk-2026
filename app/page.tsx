"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MqttClient } from "mqtt";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "@/components/Card";
import RelayControl from "@/components/RelayControl";
import SensorHistoryTable from "@/components/SensorHistoryTable";
import { connectMqtt, initialSensorState, publishRelay, RelayKey, SensorState } from "@/lib/mqtt";
import type { SensorDataRow } from "@/lib/types";

type ChartPoint = {
  time: string;
  suhu: number | null;
  kelembaban: number | null;
};

function getTemperatureIndicator(temp: number | null): string {
  if (temp === null) return "bg-slate-500";
  if (temp >= 20 && temp <= 25) return "bg-emerald-400";
  if (temp >= 26 && temp <= 30) return "bg-yellow-400";
  return "bg-rose-500";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [sensor, setSensor] = useState<SensorState>(initialSensorState);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [history, setHistory] = useState<SensorDataRow[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const clientRef = useRef<MqttClient | null>(null);

  const fetchSensorHistory = async (showLoading = false) => {
    if (showLoading) setIsHistoryLoading(true);
    try {
      const res = await fetch("/api/sensor-data", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch sensor history:", res.status, body.error);
        return;
      }
      const body = (await res.json()) as { data: SensorDataRow[] };
      setHistory(body.data ?? []);
    } catch (error) {
      console.error("Failed loading sensor history (network):", error);
    } finally {
      if (showLoading) setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    const client = connectMqtt(setIsConnected, setSensor, () => {
      void fetchSensorHistory(false);
    });
    clientRef.current = client;

    return () => {
      client.end(true);
    };
  }, []);

  useEffect(() => {
    void fetchSensorHistory(true);
    const interval = setInterval(() => {
      void fetchSensorHistory(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasData = sensor.suhu !== null || sensor.kelembaban !== null;
    if (!hasData) return;

    const point: ChartPoint = {
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }),
      suhu: sensor.suhu,
      kelembaban: sensor.kelembaban
    };

    setChartData((prev) => [...prev.slice(-19), point]);
  }, [sensor.suhu, sensor.kelembaban]);

  const relays = useMemo(
    () => ({
      relay1: sensor.relay1,
      relay2: sensor.relay2,
      relay3: sensor.relay3,
      relay4: sensor.relay4
    }),
    [sensor.relay1, sensor.relay2, sensor.relay3, sensor.relay4]
  );

  const hasSuhu = sensor.suhu !== null;
  const hasKelembaban = sensor.kelembaban !== null;
  const hasLdr = sensor.ldr !== null;
  const latestDbData = history[0] ?? null;

  const onToggleRelay = (relay: RelayKey, next: boolean) => {
    setSensor((prev) => ({ ...prev, [relay]: next }));
    publishRelay(clientRef.current, relay, next);
  };

  const onToggleAll = (next: boolean) => {
    setSensor((prev) => ({
      ...prev,
      relay1: next,
      relay2: next,
      relay3: next,
      relay4: next
    }));
    publishRelay(clientRef.current, "allrelay", next);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">IoT Monitoring Dashboard</h1>
            <p className="text-sm text-slate-300">Next.js App Router + HiveMQ Cloud (WebSocket)</p>
          </div>
          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isConnected ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
            }`}
          >
            MQTT: {isConnected ? "Connected" : "Disconnected"}
          </span>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Suhu"
            value={hasSuhu ? `${sensor.suhu?.toFixed(1)} C` : "-"}
            isLoading={!hasSuhu}
            indicatorClassName={getTemperatureIndicator(sensor.suhu)}
          />
          <Card
            title="Kelembaban"
            value={hasKelembaban ? `${sensor.kelembaban?.toFixed(1)} %` : "-"}
            isLoading={!hasKelembaban}
            indicatorClassName="bg-cyan-400"
          />
          <Card
            title="Status LDR"
            value={hasLdr ? sensor.ldr ?? "-" : "-"}
            isLoading={!hasLdr}
            indicatorClassName={sensor.ldr === "Gelap" ? "bg-indigo-400" : "bg-amber-300"}
          />
        </section>

        <RelayControl relays={relays} onToggleRelay={onToggleRelay} onToggleAll={onToggleAll} />

        <section className="rounded-2xl bg-panel p-5 shadow-glow">
          <h2 className="mb-3 text-lg font-semibold text-white">Data Terakhir Dari Database</h2>
          {isHistoryLoading ? (
            <p className="text-sm text-slate-300">Loading data database...</p>
          ) : !latestDbData ? (
            <p className="text-sm text-slate-300">Belum ada data tersimpan.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-800/80 p-3">
                <p className="text-xs text-slate-300">Suhu</p>
                <p className="text-xl font-bold text-white">{latestDbData.suhu.toFixed(1)} C</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3">
                <p className="text-xs text-slate-300">Kelembaban</p>
                <p className="text-xl font-bold text-white">{latestDbData.kelembaban.toFixed(1)} %</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3">
                <p className="text-xs text-slate-300">LDR</p>
                <p className="text-xl font-bold text-white">{latestDbData.ldr}</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3 sm:col-span-3">
                <p className="text-xs text-slate-300">Waktu Simpan</p>
                <p className="text-sm font-semibold text-white">{formatDateTime(latestDbData.created_at)}</p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-panel p-5 shadow-glow">
          <h2 className="mb-4 text-lg font-semibold text-white">Chart Realtime</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#cbd5e1" tick={{ fontSize: 11 }} />
                <YAxis stroke="#cbd5e1" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="suhu" stroke="#f43f5e" strokeWidth={2} dot={false} name="Suhu (C)" />
                <Line
                  type="monotone"
                  dataKey="kelembaban"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  name="Kelembaban (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <SensorHistoryTable rows={history} isLoading={isHistoryLoading} />
      </div>
    </main>
  );
}
