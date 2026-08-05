import React from "react";

export default function EaseTable({ ease, fit }) {
  return (
    <div className="bg-white/70 border border-stone-200 rounded-2xl overflow-hidden">
      <p className="text-xs text-stone-500 px-5 pt-4">
        A body measurement is not a garment measurement — these are the recommended finished garment measurements for a{" "}
        <span className="text-stone-900">{fit}</span> fit.
      </p>
      <table className="w-full text-sm mt-3">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-stone-400 border-b border-stone-200">
            <th className="text-left font-normal px-5 py-2">Measurement</th>
            <th className="text-left font-normal px-3 py-2">Body</th>
            <th className="text-left font-normal px-3 py-2">Finished garment</th>
            <th className="text-left font-normal px-3 py-2 hidden sm:table-cell">Why</th>
          </tr>
        </thead>
        <tbody>
          {(ease || []).map((e, i) => (
            <tr key={i} className="border-b border-stone-100 last:border-0">
              <td className="px-5 py-2.5 text-stone-900">{e.measurement}</td>
              <td className="px-3 py-2.5 text-stone-600">{e.body_value}</td>
              <td className="px-3 py-2.5 text-amber-800">{e.finished_range}</td>
              <td className="px-3 py-2.5 text-xs text-stone-500 hidden sm:table-cell">{e.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}