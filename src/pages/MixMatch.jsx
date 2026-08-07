import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, Wand2 } from "lucide-react";
import PiecePicker from "@/components/mix/PiecePicker";
import LookCard from "@/components/mix/LookCard";
import ImageLightbox from "@/components/studio/ImageLightbox";
import { TURNTABLE_PREFIX } from "@/lib/designEngine";
import { useToast } from "@/components/ui/use-toast";

export default function MixMatch() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState([]);
  const [creating, setCreating] = useState(false);
  const [variatingId, setVariatingId] = useState(null);
  const [openLookIndex, setOpenLookIndex] = useState(null);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.DesignProject.list("-updated_date"),
  });
  const { data: versions } = useQuery({
    queryKey: ["all-versions"],
    queryFn: () => base44.entities.DesignVersion.list("-created_date", 500),
  });
  const { data: looks } = useQuery({
    queryKey: ["looks"],
    queryFn: () => base44.entities.Look.list("-created_date"),
  });

  if (!projects || !versions || !looks) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const pieces = projects.flatMap((p) => {
    const own = versions.filter((v) => v.project_id === p.id).sort((a, b) => a.version_number - b.version_number);
    const v = versions.find((x) => x.id === p.current_version_id) || own[own.length - 1];
    if (!v?.renders?.length) return [];
    const usable = v.renders.filter((r) => !r.view_type?.startsWith(TURNTABLE_PREFIX));
    return [...new Set(usable.map((r) => r.fabric))]
      .map((f) => {
        const group = usable.filter((r) => r.fabric === f);
        const base = group.find((r) => r.view_type === "Front") || group[0];
        return base ? { url: base.url, label: `${p.name} — ${f}` } : null;
      })
      .filter(Boolean);
  });

  const toggle = (piece) =>
    setSelected((prev) =>
      prev.some((s) => s.url === piece.url) ? prev.filter((s) => s.url !== piece.url) : [...prev, piece]
    );

  const handleCreate = async () => {
    setCreating(true);
    try {
      const img = await base44.integrations.Core.GenerateImage({
        prompt: `Full-length professional fashion photograph of one model wearing and carrying a complete, coordinated outfit combining exactly these pieces, one from each reference image in order: ${selected
          .map((s, i) => `(${i + 1}) ${s.label}`)
          .join(", ")}. Reproduce each piece's exact design, silhouette, fabric, colour and details faithfully from its reference image — do not invent new garments. Soft professional studio lighting, neutral background.`,
        existing_image_urls: selected.map((s) => s.url),
      });
      await base44.entities.Look.create({
        name: selected.map((s) => s.label.split(" — ")[0]).join(" + "),
        pieces: selected,
        image_url: img.url,
      });
      setSelected([]);
      await qc.invalidateQueries({ queryKey: ["looks"] });
      setOpenLookIndex(0); // newest look is first — show it right away
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't style this look",
        description: "Something went wrong while combining the pieces. Please try again.",
      });
    }
    setCreating(false);
  };

  const handleMore = async (look) => {
    setVariatingId(look.id);
    try {
      const img = await base44.integrations.Core.GenerateImage({
        prompt: `Full-length professional fashion photograph of one model wearing the exact same complete outfit shown in the reference image — reproduce every garment's design, silhouette, fabric, colour and details faithfully. Change only the model's pose, camera angle and styling attitude for a fresh editorial shot. Soft professional studio lighting, neutral background.`,
        existing_image_urls: [look.image_url],
      });
      await base44.entities.Look.create({
        name: `${look.name} — variation`,
        pieces: look.pieces || [],
        image_url: img.url,
      });
      await qc.invalidateQueries({ queryKey: ["looks"] });
      setOpenLookIndex(0); // show the fresh variation
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't generate a variation",
        description: "Something went wrong. Please try again.",
      });
    }
    setVariatingId(null);
  };

  const handleDelete = async (look) => {
    await base44.entities.Look.delete(look.id);
    qc.invalidateQueries({ queryKey: ["looks"] });
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-10 pb-28">
      <p className="font-display text-4xl text-stone-900 mb-2">Mix &amp; Match</p>
      <p className="text-stone-500 text-sm mb-8">
        Pick pieces from your designs — a top with pants, a purse with shoes — and I'll style them into one complete look.
      </p>

      {pieces.length === 0 ? (
        <p className="text-sm text-stone-500 py-12 text-center border border-dashed border-stone-300 rounded-2xl">
          Design a few pieces in the Studio first — they'll show up here to mix and match.
        </p>
      ) : (
        <PiecePicker pieces={pieces} selected={selected} onToggle={toggle} />
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-stone-900 text-stone-50 rounded-full pl-5 pr-2 py-2 shadow-xl">
          <span className="text-sm whitespace-nowrap">{selected.length} piece{selected.length > 1 ? "s" : ""}</span>
          <button
            onClick={handleCreate}
            disabled={creating || selected.length < 2}
            className="flex items-center gap-1.5 text-sm rounded-full px-4 py-2 bg-amber-800 hover:bg-amber-700 transition-colors disabled:opacity-40"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {creating ? "Styling your look…" : "Style this look"}
          </button>
        </div>
      )}

      {looks.length > 0 && (
        <div className="mt-12">
          <p className="font-display text-2xl text-stone-900 mb-4">Your Looks</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {looks.map((look, i) => (
              <LookCard
                key={look.id}
                look={look}
                onDelete={handleDelete}
                onOpen={() => setOpenLookIndex(i)}
                onMore={handleMore}
                generating={variatingId === look.id}
                disabled={!!variatingId}
              />
            ))}
          </div>
          <ImageLightbox
            items={looks.map((l) => ({ url: l.image_url, label: l.name }))}
            index={openLookIndex}
            onClose={() => setOpenLookIndex(null)}
            onNavigate={setOpenLookIndex}
            renderAction={(i) => (
              <button
                onClick={() => handleMore(looks[i])}
                disabled={!!variatingId}
                className="flex items-center gap-2 text-sm rounded-full px-5 py-2.5 bg-stone-900 text-stone-50 hover:bg-amber-800 transition-colors disabled:opacity-40"
              >
                {variatingId === looks[i].id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {variatingId === looks[i].id ? "Generating another look…" : "Generate more like this"}
              </button>
            )}
          />
        </div>
      )}
    </div>
  );
}