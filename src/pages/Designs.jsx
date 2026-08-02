import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Designs() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.DesignProject.list("-updated_date"),
  });

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-10">
      <p className="font-display text-4xl text-stone-900 mb-2">My Designs</p>
      <p className="text-stone-500 text-sm mb-10">Your personal collection — every piece stays open for editing.</p>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      )}

      {!isLoading && (!projects || projects.length === 0) && (
        <div className="text-center py-20 border border-dashed border-stone-300 rounded-2xl">
          <p className="text-stone-500 mb-4">No designs yet.</p>
          <Link to="/" className="text-sm underline underline-offset-4 text-stone-900 hover:text-amber-800 transition-colors">
            Start designing in the Studio →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/project/${p.id}`}
              className="block bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {p.cover_url && <Image src={p.cover_url} alt={p.name} className="w-full aspect-[3/4]" />}
              <div className="p-5">
                <p className="font-display text-lg text-stone-900">{p.name}</p>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{p.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}