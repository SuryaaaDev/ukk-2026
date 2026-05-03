import { RelayKey } from "@/lib/mqtt";

type RelayState = Record<RelayKey, boolean>;

type RelayControlProps = {
  relays: RelayState;
  onToggleRelay: (relay: RelayKey, next: boolean) => void;
  onToggleAll: (next: boolean) => void;
};

function RelayButton({
  label,
  isOn,
  onClick
}: {
  label: string;
  isOn: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
        isOn
          ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          : "bg-slate-700 text-slate-100 hover:bg-slate-600"
      }`}
    >
      {label}: {isOn ? "ON" : "OFF"}
    </button>
  );
}

export default function RelayControl({ relays, onToggleRelay, onToggleAll }: RelayControlProps) {
  const allOn = Object.values(relays).every(Boolean);

  return (
    <div className="rounded-2xl bg-panel p-5 shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Kontrol Relay</h3>
        <button
          onClick={() => onToggleAll(!allOn)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            allOn ? "bg-rose-500 text-white hover:bg-rose-400" : "bg-cyan-400 text-cyan-950 hover:bg-cyan-300"
          }`}
        >
          ALL: {allOn ? "OFF" : "ON"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <RelayButton label="Relay 1" isOn={relays.relay1} onClick={() => onToggleRelay("relay1", !relays.relay1)} />
        <RelayButton label="Relay 2" isOn={relays.relay2} onClick={() => onToggleRelay("relay2", !relays.relay2)} />
        <RelayButton label="Relay 3" isOn={relays.relay3} onClick={() => onToggleRelay("relay3", !relays.relay3)} />
        <RelayButton label="Relay 4" isOn={relays.relay4} onClick={() => onToggleRelay("relay4", !relays.relay4)} />
      </div>
    </div>
  );
}
