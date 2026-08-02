import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { motion } from "framer-motion";

export default function VersionCard({ version, projectId, isCurrent }) {
  const cover =
    version.renders?.find((r) => r.view_type === "Front")?.url ||
    version.renders?.[0]?.url ||
    version.sketch_url;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to={`/project/${projectId}`}
        className="block bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="relative">
          {cover ? (
            <Image src={cover} alt={`Version ${version.version_number}`} className="w-full aspect-[3/4]" />
          ) : (
            <div className="w-full aspect-[3/4] bg-stone-100" />
          )}
          {isCurrent && (
            <span className="absolute top-2 right-2 text-[10px] uppercase tracking-widest bg-stone-900/80 text-stone-50 rounded-full px-2 py-0.5">
              Current
            </span>
          )}
        </div>
        <div className="px-3 py-2.5 border-t border-stone-100">
          <p className="text-[11px] uppercase tracking-widest text-amber-800">V{version.version_number}</p>
          <p className="text-xs text-stone-600 truncate mt-0.5">
            {version.label || version.edit_prompt || "Original design"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}