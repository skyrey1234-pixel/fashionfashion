import React from "react";

const EDITS = [
  "Show me the back",
  "Make it oversized",
  "Make it more luxury",
  "Make it more streetwear",
  "Add silver hardware",
  "Simplify it",
  "Add more detail",
  "Create matching pants",
];

export default function QuickEdits({ onPick, disabled }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {EDITS.map((e) => (
        <button
          key={e}
          onClick={() => onPick(e)}
          disabled={disabled}
          className="text-[11px] rounded-full border border-stone-300 px-3 py-1.5 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-40"
        >
          {e}
        </button>
      ))}
    </div>
  );
}