"use client";

import mqtt, { IClientOptions, MqttClient } from "mqtt";

export type RelayKey = "relay1" | "relay2" | "relay3" | "relay4";

export type SensorState = {
  suhu: number | null;
  kelembaban: number | null;
  ldr: string | null;
  relay1: boolean;
  relay2: boolean;
  relay3: boolean;
  relay4: boolean;
};

export const initialSensorState: SensorState = {
  suhu: null,
  kelembaban: null,
  ldr: null,
  relay1: false,
  relay2: false,
  relay3: false,
  relay4: false
};

const MQTT_URL = `wss://${process.env.NEXT_PUBLIC_MQTT_HOST ?? "13ed109aa60347fb81c928d7e6d47baa.s1.eu.hivemq.cloud"}:${process.env.NEXT_PUBLIC_MQTT_PORT ?? "8884"}/mqtt`;

const MQTT_OPTIONS: IClientOptions = {
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME ?? "Surya_Gunsetya_Saputra",
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD ?? "UKKsurya2026",
  reconnectPeriod: 3000,
  connectTimeout: 15000,
  clean: true,
  protocolVersion: 4
};

const SUBSCRIBE_TOPICS: string[] = [
  "iot/suhu",
  "iot/kelembaban",
  "iot/ldr",
  "iot/relay1",
  "iot/relay2",
  "iot/relay3",
  "iot/relay4"
];

export const PUBLISH_TOPICS: Record<RelayKey | "allrelay", string> = {
  relay1: "iot/relay1/set",
  relay2: "iot/relay2/set",
  relay3: "iot/relay3/set",
  relay4: "iot/relay4/set",
  allrelay: "iot/allrelay/set"
};

export function connectMqtt(
  onConnectionChange: (connected: boolean) => void,
  onData: (updater: (prev: SensorState) => SensorState) => void,
  onSavedToDatabase?: () => void
): MqttClient {
  const client = mqtt.connect(MQTT_URL, MQTT_OPTIONS);
  const pending = {
    suhu: null as number | null,
    kelembaban: null as number | null,
    ldr: null as string | null
  };
  let lastInsertSignature = "";
  let lastInsertAt = 0;
  let isSaving = false;
  const INSERT_COOLDOWN_MS = 5000;

  async function tryPersistReading() {
    if (pending.suhu === null || pending.kelembaban === null || pending.ldr === null || isSaving) return;

    const signature = `${pending.suhu}|${pending.kelembaban}|${pending.ldr}`;
    const now = Date.now();
    if (signature === lastInsertSignature) return;
    if (now - lastInsertAt < INSERT_COOLDOWN_MS) return;

    isSaving = true;
    try {
      const res = await fetch("/api/sensor-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suhu: pending.suhu,
          kelembaban: pending.kelembaban,
          ldr: pending.ldr
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Failed to insert sensor data");
      }

      lastInsertSignature = signature;
      lastInsertAt = now;
      onSavedToDatabase?.();
      console.log("Sensor data persisted to database:", signature);
    } catch (error) {
      console.error("Failed persisting sensor data:", error);
    } finally {
      isSaving = false;
    }
  }

  client.on("connect", () => {
    onConnectionChange(true);
    client.subscribe(SUBSCRIBE_TOPICS);
  });

  client.on("reconnect", () => {
    onConnectionChange(false);
  });

  client.on("close", () => {
    onConnectionChange(false);
  });

  client.on("error", () => {
    onConnectionChange(false);
  });

  client.on("message", (topic, payload) => {
    const value = payload.toString().trim();

    onData((prev) => {
      switch (topic) {
        case "iot/suhu":
          pending.suhu = Number(value);
          void tryPersistReading();
          return { ...prev, suhu: Number(value) };
        case "iot/kelembaban":
          pending.kelembaban = Number(value);
          void tryPersistReading();
          return { ...prev, kelembaban: Number(value) };
        case "iot/ldr": {
          const normalized = value.toUpperCase();
          const ldrStatus = normalized === "1" || normalized === "GELAP" ? "Gelap" : "Terang";
          pending.ldr = ldrStatus;
          void tryPersistReading();
          return { ...prev, ldr: ldrStatus };
        }
        case "iot/relay1":
          return { ...prev, relay1: value.toUpperCase() === "ON" || value === "1" };
        case "iot/relay2":
          return { ...prev, relay2: value.toUpperCase() === "ON" || value === "1" };
        case "iot/relay3":
          return { ...prev, relay3: value.toUpperCase() === "ON" || value === "1" };
        case "iot/relay4":
          return { ...prev, relay4: value.toUpperCase() === "ON" || value === "1" };
        default:
          return prev;
      }
    });
  });

  return client;
}

export function publishRelay(client: MqttClient | null, relay: RelayKey | "allrelay", isOn: boolean) {
  if (!client || !client.connected) return;
  client.publish(PUBLISH_TOPICS[relay], isOn ? "ON" : "OFF");
}
