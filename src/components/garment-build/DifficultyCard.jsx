import React from "react";

export default function DifficultyCard({ difficulty }) {
  if (!difficulty?.score) return null;
  return (
    <div className="bg-white/70 border border-stone-200 rounded-2xl p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
      <div>
        <p className="font-display text-4xl text-stone-900">
          {difficulty.score}<span className="text-lg text-stone-400">/10</span>
        </p>
        <p className="text-[11px] uppercase tracking-widest text-stone-400">Difficulty</p>
      </div>
      <div className="text-sm text-stone-600 space-y-0.5">
        {difficulty.skill_level && <p><span className="text-stone-400">Skill level:</span> {difficulty.skill_level}</p>}
        {difficulty.estimated_hours && <p><span className="text-stone-400">Est. sewing time:</span> {difficulty.estimated_hours}</p>}
      </div>
      {difficulty.reasons?.length > 0 && (
        <ul className="text-xs text-stone-500 list-disc list-inside space-y-0.5 basis-full sm:basis-auto">
          {difficulty.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}