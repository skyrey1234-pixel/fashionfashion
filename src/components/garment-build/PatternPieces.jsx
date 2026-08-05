import React from "react";

const Badge = ({ children }) => (
  <span className="text-[10px] uppercase tracking-widest bg-stone-100 border border-stone-200 rounded-full px-2.5 py-1 text-stone-600">
    {children}
  </span>
);

export default function PatternPieces({ pieces }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(pieces || []).map((p, i) => (
        <div key={i} className="bg-white/70 border border-stone-200 rounded-2xl p-5">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <p className="font-display text-xl text-stone-900">{p.name}</p>
            {p.quantity != null && (
              <span className="text-[11px] uppercase tracking-widest text-stone-400 shrink-0">Cut {p.quantity}</span>
            )}
          </div>
          {(p.cut_on_fold || p.mirrored) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.cut_on_fold && <Badge>On fold</Badge>}
              {p.mirrored && <Badge>Mirrored pair</Badge>}
            </div>
          )}
          <dl className="space-y-1 text-xs text-stone-600">
            {p.grainline && (
              <div><span className="text-stone-400">Grainline: </span>{p.grainline}</div>
            )}
            {p.seam_allowance && (
              <div><span className="text-stone-400">Seam allowance: </span>{p.seam_allowance}</div>
            )}
            {p.notches && (
              <div><span className="text-stone-400">Notches: </span>{p.notches}</div>
            )}
          </dl>
          {p.notes && <p className="text-xs text-stone-500 mt-2 italic">{p.notes}</p>}
        </div>
      ))}
    </div>
  );
}