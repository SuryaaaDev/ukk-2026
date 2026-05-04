import type { LucideIcon } from "lucide-react";

type SensorCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  isLoading?: boolean;
  subtitle?: string;
};

export default function SensorCard({ title, value, icon: Icon, color, isLoading = false, subtitle }: SensorCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 opacity-80" />
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</p>
          <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{isLoading ? "Loading..." : value}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        <div className={`rounded-xl p-3 shadow-lg ring-1 ring-black/5 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </article>
  );
}
