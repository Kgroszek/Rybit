export function MapPreview() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute left-5 top-5 z-10 space-y-3">
        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm">
          +
        </button>

        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm">
          −
        </button>
      </div>

      <button className="absolute right-5 top-5 z-10 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm">
        Filtruj łowiska
      </button>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,#dbeafe_1px,transparent_1px),linear-gradient(#dbeafe_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="absolute left-[22%] top-[18%] flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white shadow-lg">
        3
      </div>

      <div className="absolute left-[48%] top-[28%] flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-lg">
        ●
      </div>

      <div className="absolute left-[70%] top-[58%] flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white shadow-lg">
        4
      </div>

      <div className="absolute left-[78%] top-[30%] flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white shadow-lg">
        5
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-2xl bg-white/80 px-5 py-3 text-center shadow-sm backdrop-blur">
        <p className="text-lg font-bold">Mapa łowisk</p>

        <p className="text-sm text-slate-500">
          Tutaj później dodamy prawdziwą mapę
        </p>
      </div>
    </div>
  );
}