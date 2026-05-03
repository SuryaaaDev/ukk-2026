import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type InsertBody = {
  suhu?: number;
  kelembaban?: number;
  ldr?: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InsertBody;
    const { suhu, kelembaban, ldr } = body;

    if (!isFiniteNumber(suhu) || !isFiniteNumber(kelembaban) || typeof ldr !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { error } = await supabase.from("sensor_data").insert({
      suhu,
      kelembaban,
      ldr
    });

    if (error) {
      console.error("Failed to save sensor_data:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Sensor data saved:", { suhu, kelembaban, ldr });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unexpected API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("id, suhu, kelembaban, ldr, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch sensor history:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error("Unexpected API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
