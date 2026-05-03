type CardProps = {
  title: string;
  value: string;
  isLoading?: boolean;
  indicatorClassName?: string;
};

export default function Card({ title, value, isLoading = false, indicatorClassName = "bg-slate-500" }: CardProps) {
  return (
    <div className="rounded-2xl bg-panel p-5 shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wide text-slate-300">{title}</h3>
        <span className={`h-2.5 w-2.5 rounded-full ${indicatorClassName}`} />
      </div>
      <p className="text-3xl font-bold text-white">{isLoading ? "Loading..." : value}</p>
    </div>
  );
}
