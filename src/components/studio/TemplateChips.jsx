import React from "react";
import { motion } from "framer-motion";

const TEMPLATES = [
  "A flowing silk evening gown with an open back",
  "An oversized streetwear hoodie with bold embroidery",
  "A tailored double-breasted blazer for women",
  "A bohemian summer maxi dress with floral prints",
  "A minimalist trench coat with clean lines",
  "A denim jacket with hand-painted art on the back",
];

export default function TemplateChips({ onPick, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {TEMPLATES.map((t, i) => (
        <motion.button
          key={t}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
          disabled={disabled}
          onClick={() => onPick(t)}
          className="px-4 py-2 rounded-full border border-stone-300 bg-white/60 text-xs text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors duration-300 disabled:opacity-40"
        >
          {t}
        </motion.button>
      ))}
    </div>
  );
}