import React from "react";
import { Loader2 } from "lucide-react";

export default function WorkingIndicator({ stage }) {
  return (
    <div className="flex items-center gap-3 text-stone-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
      <span className="italic">{stage}</span>
    </div>
  );
}