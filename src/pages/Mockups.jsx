import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Trash2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import ProductPicker from "@/components/mockup/ProductPicker";
import { getProduct } from "@/lib/mockupProducts";

export default function Mockups() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: designs } = useQuery({
    queryKey: ["mockups"],
    queryFn: () => base44.entities.MockupDesign.list("-updated_date"),
  });

  if (!designs) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const handleDelete = async (d) => {
    await base44.entities.MockupDesign.delete(d.id);
    qc.invalidateQueries({ queryKey: ["mockups"] });
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-10">
      <p className="font-display text-4xl text-stone-900 mb-2">Mockup Studio</p>
      <p className="text-stone-500 text-sm mb-8">
        Pick a blank garment, then drop your own pictures and text anywhere on it.
      </p>

      <ProductPicker onPick={(pid) => navigate(`/mockups/new?product=${pid}`)} />

      {designs.length > 0 && (
        <div className="mt-12">
          <p className="font-display text-2xl text-stone-900 mb-4">Your Mockups</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {designs.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm">
                <Link to={`/mockups/${d.id}`}>
                  <Image
                    src={d.preview_url || getProduct(d.product_id).image}
                    alt={d.name}
                    className="w-full aspect-square"
                    fittingType="fit"
                  />
                </Link>
                <div className="px-3 py-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-stone-800 truncate">{d.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400">{getProduct(d.product_id).name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(d)}
                    className="shrink-0 p-2 text-stone-400 hover:text-red-800 transition-colors"
                    aria-label="Delete mockup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}