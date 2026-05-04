import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

type ChartPoint = {
  time: string;
  suhu: number | null;
  kelembaban: number | null;
};

type HumidityChartProps = {
  data: ChartPoint[];
};

export default function HumidityChart({ data }: HumidityChartProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition dark:border-white/10 dark:bg-slate-900/80">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Chart Kelembaban</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line isAnimationActive type="monotone" dataKey="kelembaban" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}