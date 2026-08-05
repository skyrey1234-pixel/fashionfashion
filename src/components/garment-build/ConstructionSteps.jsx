import React from "react";

export default function ConstructionSteps({ steps }) {
  return (
    <ol className="space-y-3">
      {(steps || []).map((s, i) => (
        <li key={i} className="bg-white/70 border border-stone-200 rounded-2xl p-5 flex gap-4">
          <span className="font-display text-2xl text-amber-800 leading-none shrink-0 w-8">{i + 1}</span>
          <div className="min-w-0">
            <p className="text-sm text-stone-900 font-medium">{s.title}</p>
            {s.detail && <p className="text-xs text-stone-600 mt-1">{s.detail}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-stone-500">
              {s.stitch_type && <span><span className="text-stone-400">Stitch:</span> {s.stitch_type}</span>}
              {s.seam_allowance && <span><span className="text-stone-400">SA:</span> {s.seam_allowance}</span>}
              {s.machine_setting && <span><span className="text-stone-400">Machine:</span> {s.machine_setting}</span>}
              {s.needle_thread && <span><span className="text-stone-400">Needle/thread:</span> {s.needle_thread}</span>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}