import React from "react";
import { RotateCcw, Check } from "lucide-react";

export default function VersionHistory({ versions, currentId, viewingId, onView, onRestore }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-2">Version History</p>
      {versions.map((v) => {
        const active = v.id === viewingId;
        return (
          <div
            key={v.id}
            className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
              active ? "border-stone-900 bg-white" : "border-stone-200 hover:border-stone-400"
            }`}
          >
            <button onClick={() => onView(v.id)} className="flex-1 text-left">
              <p className="text-xs text-stone-800">
                V{v.version_number} — {v.label || v.edit_prompt || "Original design"}
              </p>
            </button>
            {v.id === currentId ? (
              <span title="Current version">
                <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              </span>
            ) : (
              <button onClick={() => onRestore(v)} title="Restore this version" className="text-stone-400 hover:text-stone-900 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}