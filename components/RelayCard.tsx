import { Power } from "lucide-react";

type RelayCardProps = {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function RelayCard({ label, isOn, onToggle, disabled = false }: RelayCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/70">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isOn ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" : "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 dark:from-slate-700 dark:via-slate-600 dark:to-slate-500"
        }`}
      />
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">{label}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isOn ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          }`}
        >
          {isOn ? "ON" : "OFF"}
        </span>
      </div>

      <button
        onClick={onToggle}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          disabled
            ? "cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            :
          isOn
            ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-950 hover:brightness-105"
            : "bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 hover:brightness-110 dark:from-slate-200 dark:to-slate-300 dark:text-slate-800"
        }`}
      >
        <Power className="h-4 w-4" />
        {isOn ? "Turn OFF" : "Turn ON"}
      </button>
    </article>
  );
}
