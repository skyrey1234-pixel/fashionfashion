import React from "react";
import { MEASUREMENT_FIELDS } from "@/lib/buildEngine";

export default function MeasurementsForm({ values, onChange }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-1">Body measurements (inches, optional)</p>
      <p className="text-xs text-stone-500 mb-3">
        Enter what you know — anything left blank uses standard measurements for your target size.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MEASUREMENT_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-stone-600">{f.label}</span>
            <input
              type="number"
              step="0.25"
              min="0"
              value={values[f.key] ?? ""}
              onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
              placeholder="in"
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-900 transition-colors"
            />
          </label>
        ))}
      </div>
    </div>
  );
}