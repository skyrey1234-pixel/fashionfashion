import React, { useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import MockupCanvas from "@/components/mockup/MockupCanvas";
import LayerControls from "@/components/mockup/LayerControls";
import MockupToolbar from "@/components/mockup/MockupToolbar";
import { getProduct } from "@/lib/mockupProducts";
import { useToast } from "@/components/ui/use-toast";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function MockupEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef(null);

  const [name, setName] = useState("Untitled mockup");
  const [productId, setProductId] = useState(params.get("product") || "tee-white");
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loaded, setLoaded] = useState(!id);

  useQuery({
    queryKey: ["mockup", id],
    enabled: !!id,
    queryFn: async () => {
      const d = await base44.entities.MockupDesign.get(id);
      setName(d.name);
      setProductId(d.product_id);
      setLayers(d.layers || []);
      setLoaded(true);
      return d;
    },
  });

  if (!loaded) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const product = getProduct(productId);
  const selected = layers.find((l) => l.id === selectedId) || null;

  const updateLayer = (layerId, patch) =>
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, ...patch } : l)));

  const handleAddImage = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const layer = {
      id: uid(),
      type: "image",
      url: file_url,
      x: product.print_area.x + product.print_area.width / 2,
      y: product.print_area.y + product.print_area.height / 2,
      width: 25,
      rotation: 0,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
    setUploading(false);
  };

  const handleAddText = () => {
    const layer = {
      id: uid(),
      type: "text",
      text: "Your text",
      x: product.print_area.x + product.print_area.width / 2,
      y: product.print_area.y + product.print_area.height / 2,
      width: 28,
      rotation: 0,
      color: "#1c1917",
      font: "var(--font-heading)",
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  };

  const capture = async () => {
    setSelectedId(null);
    await new Promise((r) => setTimeout(r, 60));
    return html2canvas(canvasRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await capture();
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
    } catch {
      toast({ variant: "destructive", title: "Couldn't download", description: "Please try again." });
    }
    setDownloading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const canvas = await capture();
      const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: new File([blob], "mockup.png", { type: "image/png" }),
      });
      const payload = { name, product_id: productId, layers, preview_url: file_url };
      if (id) await base44.entities.MockupDesign.update(id, payload);
      else await base44.entities.MockupDesign.create(payload);
      navigate("/mockups");
    } catch {
      toast({ variant: "destructive", title: "Couldn't save", description: "Please try again." });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="font-display text-3xl h-auto border-0 px-0 shadow-none focus-visible:ring-0 bg-transparent mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-5">
          <MockupCanvas
            product={product}
            layers={layers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={updateLayer}
            canvasRef={canvasRef}
          />
          <MockupToolbar
            onAddImage={handleAddImage}
            onAddText={handleAddText}
            onDownload={handleDownload}
            onSave={handleSave}
            uploading={uploading}
            saving={saving}
            downloading={downloading}
          />
          <Link to="/mockups" className="inline-block text-xs underline underline-offset-4 text-stone-500 hover:text-stone-900">
            ← All mockups
          </Link>
        </div>

        <div className="bg-white/60 rounded-2xl border border-stone-200 p-4 lg:sticky lg:top-6 lg:self-start">
          <p className="text-[11px] uppercase tracking-widest text-amber-800 mb-4">Element</p>
          <LayerControls
            layer={selected}
            onChange={(patch) => updateLayer(selectedId, patch)}
            onDelete={() => {
              setLayers((prev) => prev.filter((l) => l.id !== selectedId));
              setSelectedId(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}