type CardProps = {
  title: string;
  value: string;
  isLoading?: boolean;
  indicatorClassName?: string;
};

export default function Card({ title, value, isLoading = false, indicatorClassName = "bg-slate-500" }: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-glow dark:backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">{title}</h3>
        <span className={`h-2.5 w-2.5 rounded-full ${indicatorClassName}`} />
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{isLoading ? "Loading..." : value}</p>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/20" />
    </div>
  );
}
