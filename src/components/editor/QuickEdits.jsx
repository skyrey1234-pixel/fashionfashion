import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULT_EDITS = [
  "Show me the back",
  "Make it oversized",
  "Make it more luxury",
  "Make it more streetwear",
  "Add silver hardware",
  "Simplify it",
  "Add more detail",
  "Create matching pants",
];

export default function QuickEdits({ onPick, disabled, designContext }) {
  const [edits, setEdits] = useState(DEFAULT_EDITS);
  const [loading, setLoading] = useState(false);

  const fetchMore = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a fashion design assistant. The user is iterating on this design: "${designContext || "a clothing design"}".
Suggest 8 fresh, specific, short edit ideas (3-6 words each) they could ask for next — colour changes, silhouette tweaks, fabric swaps, details, trims, styling variations. Make them different from these already-shown ideas: ${edits.join(", ")}.`,
        response_json_schema: {
          type: "object",
          properties: { suggestions: { type: "array", items: { type: "string" } } },
        },
      });
      if (res?.suggestions?.length) setEdits(res.suggestions.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {edits.map((e) => (
        <button
          key={e}
          onClick={() => onPick(e)}
          disabled={disabled}
          className="text-[11px] rounded-full border border-stone-300 px-3 py-1.5 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-40"
        >
          {e}
        </button>
      ))}
      <button
        onClick={fetchMore}
        disabled={disabled || loading}
        className="flex items-center gap-1.5 text-[11px] rounded-full border border-amber-800/40 px-3 py-1.5 text-amber-800 hover:border-amber-800 transition-colors disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        More ideas
      </button>
    </div>
  );
}