"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type RelayId = "relay1" | "relay2" | "relay3" | "relay4";

type RelayLayout = {
  id: RelayId;
  label: string;
  x: number;
  y: number;
};

const center = { x: 50, y: 50 };

const relayLayouts: RelayLayout[] = [
  { id: "relay1", label: "Relay 1", x: 50, y: 16 },
  { id: "relay2", label: "Relay 2", x: 84, y: 50 },
  { id: "relay3", label: "Relay 3", x: 50, y: 84 },
  { id: "relay4", label: "Relay 4", x: 16, y: 50 }
];

function ESP32Card() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.84, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
      className="relative z-30 w-[320px] rounded-2xl border border-cyan-300/25 bg-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_32px_rgba(56,189,248,0.22)] backdrop-blur-xl"
    >
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-cyan-300/10 via-transparent to-blue-300/10" />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/90">Main Controller</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">ESP32 Device</h2>
        <p className="mt-2 text-sm text-slate-300">Realtime MQTT communication</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["WiFi", "Connected"],
            ["Mode", "Manual"],
            ["Signal", "Stable"]
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-white/10 bg-slate-900/45 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{k}</p>
              <p className="mt-1 text-xs font-semibold text-cyan-200">{v}</p>
            </div>
          ))}
        </div>

        <motion.div
          className="mt-4 h-1.5 w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-orange-400"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

function RelayCard({
  relay,
  isOn,
  delay,
  onToggle
}: {
  relay: RelayLayout;
  isOn: boolean;
  delay: number;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, delay, ease: "easeInOut" }}
      className="absolute z-20 w-52 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${relay.x}%`, top: `${relay.y}%` }}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.8 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-xl border border-white/15 bg-white/10 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-blue-300/14 via-transparent to-cyan-300/8" />

        <div className="relative flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{relay.label}</p>
          <motion.span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: isOn ? "#22c55e" : "#64748b",
              boxShadow: isOn ? "0 0 10px #22c55e, 0 0 20px #22c55e" : "none"
            }}
            animate={{ opacity: isOn ? [0.5, 1, 0.5] : 0.55 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <p className={`relative mt-1 text-xs ${isOn ? "text-emerald-300" : "text-slate-400"}`}>Status: {isOn ? "ON" : "OFF"}</p>

        <div className="relative mt-3 grid grid-cols-2 gap-2">
          <div className="h-7 rounded-md border border-cyan-200/25 bg-slate-900/45" />
          <div className="h-7 rounded-md border border-cyan-200/25 bg-slate-900/45" />
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={`relative mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold transition ${
            isOn
              ? "bg-gradient-to-r from-emerald-300 to-cyan-300 text-slate-900"
              : "bg-slate-800/80 text-slate-200 hover:bg-slate-700"
          }`}
        >
          {isOn ? "Turn OFF" : "Turn ON"}
        </button>
      </motion.div>
    </motion.div>
  );
}

function ConnectionLine({ to, isOn, drawDelay }: { to: { x: number; y: number }; isOn: boolean; drawDelay: number }) {
  return (
    <>
      <motion.line
        x1={center.x}
        y1={center.y}
        x2={to.x}
        y2={to.y}
        stroke="url(#lineGlowGradient)"
        strokeWidth={isOn ? 1.8 : 1.2}
        strokeLinecap="round"
        strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: isOn ? 1 : 0.35,
          strokeDashoffset: isOn ? [0, -56] : [0, -18]
        }}
        transition={{
          pathLength: { duration: 0.5, delay: drawDelay, ease: "easeInOut" },
          opacity: { duration: 0.25, delay: drawDelay },
          strokeDashoffset: { duration: isOn ? 1.25 : 2.2, repeat: Infinity, ease: "linear" }
        }}
        style={{ filter: isOn ? "drop-shadow(0 0 10px rgba(56,189,248,0.85))" : "drop-shadow(0 0 3px rgba(100,116,139,0.35))" }}
      />

      {isOn ? (
        <motion.circle
          r="0.9"
          fill="#fb923c"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], cx: [center.x, to.x], cy: [center.y, to.y] }}
          transition={{ duration: 1.35, delay: drawDelay + 0.1, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(251,146,60,0.95))" }}
        />
      ) : null}
    </>
  );
}

export default function Page() {
  const [relayStates, setRelayStates] = useState<Record<RelayId, boolean>>({
    relay1: true,
    relay2: false,
    relay3: true,
    relay4: false
  });

  const activeCount = useMemo(() => Object.values(relayStates).filter(Boolean).length, [relayStates]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_15%,#111f36_0%,#0a1222_45%,#060c18_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.12),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:46px_46px]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8">
        <div className="absolute top-8 z-30 rounded-full border border-cyan-300/20 bg-slate-900/60 px-4 py-2 text-xs tracking-[0.16em] text-cyan-200 backdrop-blur">
          IoT Monitoring Dashboard
        </div>

        <div className="relative h-[700px] w-full max-w-6xl rounded-3xl border border-white/10 bg-slate-950/45 shadow-[0_0_88px_rgba(56,189,248,0.12)] backdrop-blur-xl">
          <svg viewBox="0 0 100 100" className="absolute inset-0 z-10 h-full w-full">
            <defs>
              <linearGradient id="lineGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="55%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>

            {relayLayouts.map((relay, idx) => (
              <ConnectionLine key={relay.id} to={{ x: relay.x, y: relay.y }} isOn={relayStates[relay.id]} drawDelay={0.55 + idx * 0.22} />
            ))}
          </svg>

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <ESP32Card />
          </div>

          {relayLayouts.map((relay, idx) => (
            <RelayCard
              key={relay.id}
              relay={relay}
              isOn={relayStates[relay.id]}
              delay={1.4 + idx * 0.18}
              onToggle={() => setRelayStates((prev) => ({ ...prev, [relay.id]: !prev[relay.id] }))}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 2, ease: "easeInOut" }}
            className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 backdrop-blur"
          >
            Active Relays: <span className="font-semibold text-cyan-300">{activeCount}/4</span>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
