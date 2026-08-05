import React from "react";

export default function MaterialsList({ yardage, materials }) {
  const yardRows = [
    { label: "Main fabric", value: yardage?.main_yards },
    { label: "Lining", value: yardage?.lining_yards },
    { label: "Interfacing", value: yardage?.interfacing_yards },
    { label: "Fabric width", value: yardage?.fabric_width },
  ].filter((r) => r.value);

  return (
    <div className="space-y-5">
      <div className="bg-white/70 border border-stone-200 rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-3">Yardage estimate</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {yardRows.map((r) => (
            <div key={r.label}>
              <p className="font-display text-2xl text-stone-900">{r.value}</p>
              <p className="text-xs text-stone-500">{r.label}</p>
            </div>
          ))}
        </div>
        {yardage?.notes && <p className="text-xs text-stone-500 mt-3 italic">{yardage.notes}</p>}
      </div>

      <div className="bg-white/70 border border-stone-200 rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-3">Bill of materials — shopping list</p>
        <ul className="divide-y divide-stone-100">
          {(materials || []).map((m, i) => (
            <li key={i} className="py-2.5 flex items-baseline justify-between gap-4">
              <div>
                <p className="text-sm text-stone-900">{m.item}</p>
                {m.notes && <p className="text-xs text-stone-500">{m.notes}</p>}
              </div>
              {m.quantity && <span className="text-sm text-amber-800 shrink-0">{m.quantity}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}