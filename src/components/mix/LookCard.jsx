import React from "react";
import { Image } from "@/components/ui/image";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LookCard({ look, onDelete, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm"
    >
      <button type="button" onClick={onOpen} className="block w-full cursor-zoom-in">
        <Image src={look.image_url} alt={look.name} className="w-full aspect-[3/4]" />
      </button>
      <div className="px-3 py-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-stone-800 truncate">{look.name}</p>
          <div className="flex gap-1 mt-1.5">
            {(look.pieces || []).slice(0, 5).map((p, i) => (
              <Image key={i} src={p.url} alt={p.label} className="w-7 h-9 rounded border border-stone-200" />
            ))}
          </div>
        </div>
        <button
          onClick={() => onDelete(look)}
          className="shrink-0 p-2 text-stone-400 hover:text-red-800 transition-colors"
          aria-label="Delete look"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}