import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function VersionCard({ version, projectId, isCurrent, selectMode, selected, onToggle }) {
  const cover =
    version.renders?.find((r) => r.view_type === "Front")?.url ||
    version.renders?.[0]?.url ||
    version.sketch_url;

  const inner = (
    <>
      <div className="relative">
        {cover ? (
          <Image src={cover} alt={`Version ${version.version_number}`} className="w-full aspect-[3/4]" />
        ) : (
          <div className="w-full aspect-[3/4] bg-stone-100" />
        )}
        {isCurrent && !selectMode && (
          <span className="absolute top-2 right-2 text-[10px] uppercase tracking-widest bg-stone-900/80 text-stone-50 rounded-full px-2 py-0.5">
            Current
          </span>
        )}
        {selectMode && (
          <span
            className={`absolute top-2 right-2 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
              selected ? "bg-stone-900 border-stone-900 text-stone-50" : "bg-white/90 border-stone-300"
            }`}
          >
            {selected && <Check className="w-4 h-4" />}
          </span>
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-stone-100">
        <p className="text-[11px] uppercase tracking-widest text-amber-800">V{version.version_number}</p>
        <p className="text-xs text-stone-600 truncate mt-0.5">
          {version.label || version.edit_prompt || "Original design"}
        </p>
      </div>
    </>
  );

  const cls = `block w-full text-left bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-300 ${
    selectMode && selected ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200/80 hover:shadow-md"
  }`;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {selectMode ? (
        <button onClick={() => onToggle(version.id)} className={cls}>
          {inner}
        </button>
      ) : (
        <Link to={`/project/${projectId}`} className={cls}>
          {inner}
        </Link>
      )}
    </motion.div>
  );
}