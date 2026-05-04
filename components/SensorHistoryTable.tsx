import type { SensorDataRow } from "@/lib/types";

type SensorHistoryTableProps = {
  rows: SensorDataRow[];
  isLoading: boolean;
  isExporting: boolean;
  onExport: () => void;
};

function formatDateTime(value: string) {
  const hasTimezoneInfo = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  const normalized = hasTimezoneInfo ? value : `${value}Z`;
  return new Date(normalized).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export default function SensorHistoryTable({ rows, isLoading, isExporting, onExport }: SensorHistoryTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-glow dark:backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Riwayat Sensor (10 Terbaru)</h2>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-300">Loading data database...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-300">Belum ada data tersimpan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-300">
              <tr className="border-b border-slate-200 dark:border-white/15">
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Suhu (C)</th>
                <th className="px-3 py-2">Kelembaban (%)</th>
                <th className="px-3 py-2">LDR</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
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
