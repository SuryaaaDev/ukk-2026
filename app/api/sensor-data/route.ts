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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? Number(limitParam) : 10;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 5000) : 10;

    const { data, error } = await supabase
      .from("sensor_data")
      .select("id, suhu, kelembaban, ldr, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch sensor history:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (format === "csv") {
      const rows = data ?? [];
      const csvHeader = "id,suhu,kelembaban,ldr,created_at\n";
      const csvBody = rows
        .map((row) => {
          const safeLdr = String(row.ldr).replace(/"/g, "\"\"");
          return `${row.id},${row.suhu},${row.kelembaban},"${safeLdr}",${row.created_at}`;
        })
        .join("\n");

      return new Response(csvHeader + csvBody, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=\"sensor_data_${Date.now()}.csv\"`
        }
      });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error("Unexpected API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
