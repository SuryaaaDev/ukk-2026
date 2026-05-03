import type { SensorDataRow } from "@/lib/types";

type SensorHistoryTableProps = {
  rows: SensorDataRow[];
  isLoading: boolean;
};

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

export default function SensorHistoryTable({ rows, isLoading }: SensorHistoryTableProps) {
  return (
    <section className="rounded-2xl bg-panel p-5 shadow-glow">
      <h2 className="mb-4 text-lg font-semibold text-white">Riwayat Sensor (10 Terbaru)</h2>

      {isLoading ? (
        <p className="text-sm text-slate-300">Loading data database...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-300">Belum ada data tersimpan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-300">
              <tr className="border-b border-slate-700">
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Suhu (C)</th>
                <th className="px-3 py-2">Kelembaban (%)</th>
                <th className="px-3 py-2">LDR</th>
              </tr>
            </thead>
            <tbody className="text-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-800/80">
                  <td className="px-3 py-2">{formatDateTime(row.created_at)}</td>
                  <td className="px-3 py-2">{row.suhu.toFixed(1)}</td>
                  <td className="px-3 py-2">{row.kelembaban.toFixed(1)}</td>
                  <td className="px-3 py-2">{row.ldr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
