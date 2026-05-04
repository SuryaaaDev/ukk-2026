type LoadingScreenProps = {
  text?: string;
};

export default function LoadingScreen({ text = "Connecting IoT..." }: LoadingScreenProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="modern-loading-bg absolute inset-0" />
      <div className="modern-loading-orb modern-loading-orb-a" />
      <div className="modern-loading-orb modern-loading-orb-b" />

      <div className="relative w-[360px] overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400" />
        <div className="mb-6 flex justify-center">
          <div className="modern-loader-ring">
            <div className="modern-loader-core" />
          </div>
        </div>

        <div className="mb-5 flex items-end justify-center gap-1.5">
          <span className="modern-loader-bar modern-loader-bar-1" />
          <span className="modern-loader-bar modern-loader-bar-2" />
          <span className="modern-loader-bar modern-loader-bar-3" />
          <span className="modern-loader-bar modern-loader-bar-4" />
          <span className="modern-loader-bar modern-loader-bar-5" />
        </div>

        <p className="modern-loading-text text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{text}</p>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">Menyinkronkan sensor dan relay secara realtime</p>
      </div>
    </div>
  );
}
