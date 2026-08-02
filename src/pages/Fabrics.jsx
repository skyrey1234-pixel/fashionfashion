import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import FabricForm from "@/components/fabrics/FabricForm";
import FabricCard from "@/components/fabrics/FabricCard";
import { Loader2 } from "lucide-react";

export default function Fabrics() {
  const qc = useQueryClient();
  const { data: fabrics = [], isLoading } = useQuery({
    queryKey: ["fabrics"],
    queryFn: () => base44.entities.Fabric.list("-created_date"),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["fabrics"] });

  const remove = async (id) => {
    await base44.entities.Fabric.delete(id);
    refresh();
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-10">
      <p className="font-display text-4xl text-stone-900 mb-2">Fabric Library</p>
      <p className="text-stone-500 text-sm mb-8">
        Upload swatches or describe fabrics and patterns — then pick them in the studio to control your renders.
      </p>
      <div className="mb-10">
        <FabricForm onSaved={refresh} />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : fabrics.length === 0 ? (
        <p className="text-center text-stone-400 text-sm py-12 italic">Your library is empty — add your first fabric above.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fabrics.map((f) => (
            <FabricCard key={f.id} fabric={f} onDelete={() => remove(f.id)} />
          ))}
        </div>
      )}
    </div>
  );
}