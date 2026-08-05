import React from "react";
import { BUILD_STATUSES } from "@/lib/buildEngine";
import { AlertTriangle } from "lucide-react";

export default function StatusStepper({ status, onAdvance, disabled }) {
  const idx = BUILD_STATUSES.findIndex((s) => s.value === status);
  const next = BUILD_STATUSES[idx + 1];

  return (
    <div className="bg-white/70 border border-stone-200 rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-2">
        {BUILD_STATUSES.map((s, i) => (
          <React.Fragment key={s.value}>
            {i > 0 && <span className="text-stone-300 text-xs">→</span>}
            <span
              className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                i === idx
                  ? "bg-stone-900 text-stone-50 border-stone-900"
                  : i < idx
                  ? "bg-stone-100 text-stone-500 border-stone-200"
                  : "text-stone-300 border-stone-200"
              }`}
            >
              {s.label}
            </span>
          </React.Fragment>
        ))}
        {next && (
          <button
            onClick={() => onAdvance(next.value)}
            disabled={disabled}
            className="ml-auto text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors disabled:opacity-40"
          >
            Mark “{next.label}”
          </button>
        )}
      </div>
      {status !== "production_approved" && (
        <p className="flex items-start gap-1.5 text-[11px] text-stone-400 mt-2.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          This is an AI-generated starting pattern. It is not ready for production until it has been reviewed by a
          patternmaker and tested on a physical sample.
        </p>
      )}
    </div>
  );
}