import React, { useState } from "react";
import { Loader2, Hammer } from "lucide-react";
import { FIT_OPTIONS } from "@/lib/buildEngine";
import MeasurementsForm from "@/components/garment-build/MeasurementsForm";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function BuildSetup({ defaults, generating, onGenerate, onCancel }) {
  const [form, setForm] = useState({
    garment_type: defaults?.garment_type || "",
    fit: defaults?.fit || "regular",
    fabric: defaults?.fabric || "",
    target_size: defaults?.target_size || "M",
    measurements: defaults?.measurements || {},
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const canSubmit = form.garment_type.trim() && form.fabric.trim() && !generating;

  const submit = () => {
    const measurements = Object.fromEntries(
      Object.entries(form.measurements)
        .filter(([, v]) => v !== "" && v != null)
        .map(([k, v]) => [k, parseFloat(v)])
        .filter(([, v]) => !Number.isNaN(v))
    );
    onGenerate({ ...form, garment_type: form.garment_type.trim(), fabric: form.fabric.trim(), measurements });
  };

  const chip = (active) =>
    `text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
      active ? "bg-stone-900 text-stone-50 border-stone-900" : "border-stone-300 text-stone-500 hover:border-stone-900"
    }`;

  return (
    <div className="bg-white/70 border border-stone-200 rounded-2xl p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-stone-400">Garment type</span>
          <input
            value={form.garment_type}
            onChange={(e) => set({ garment_type: e.target.value })}
            placeholder="e.g. Cropped bomber jacket"
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-900 transition-colors"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-stone-400">Main fabric</span>
          <input
            value={form.fabric}
            onChange={(e) => set({ fabric: e.target.value })}
            placeholder="e.g. Heavyweight black cotton twill"
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-900 transition-colors"
          />
        </label>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-2">Intended fit</p>
        <div className="flex flex-wrap gap-2">
          {FIT_OPTIONS.map((f) => (
            <button key={f.value} onClick={() => set({ fit: f.value })} className={chip(form.fit === f.value)} title={f.example}>
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-1.5 italic">{FIT_OPTIONS.find((f) => f.value === form.fit)?.example}</p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-2">Target size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} onClick={() => set({ target_size: s })} className={chip(form.target_size === s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <MeasurementsForm values={form.measurements} onChange={(m) => set({ measurements: m })} />

      <div className="flex items-center gap-4">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-full bg-stone-900 text-stone-50 px-6 py-3 text-sm hover:bg-amber-800 transition-colors disabled:opacity-30 flex items-center gap-2"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hammer className="w-4 h-4" />}
          {generating ? "Drafting your build plan…" : "Generate build plan"}
        </button>
        {onCancel && !generating && (
          <button onClick={onCancel} className="text-xs underline underline-offset-4 text-stone-500 hover:text-stone-900">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}