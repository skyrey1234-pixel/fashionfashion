import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Upload, Loader2 } from "lucide-react";

export default function FabricForm({ onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [swatchUrl, setSwatchUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const upload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setSwatchUrl(file_url);
    setUploading(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await base44.entities.Fabric.create({ name: name.trim(), description: description.trim(), swatch_url: swatchUrl });
    setName("");
    setDescription("");
    setSwatchUrl("");
    setSaving(false);
    onSaved?.();
  };

  return (
    <form onSubmit={save} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
      <p className="font-display text-xl text-stone-900">Add a fabric</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Fabric name — e.g. Ivory Silk Charmeuse"
        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-900"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Texture, weight, sheen, pattern… (optional)"
        rows={2}
        className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-900 resize-none"
      />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 border border-stone-300 rounded-full px-4 py-2 transition-colors"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {swatchUrl ? "Replace swatch" : "Upload swatch"}
        </button>
        {swatchUrl && <Image src={swatchUrl} alt="Swatch" className="w-12 h-12 rounded-lg" />}
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="ml-auto rounded-full bg-stone-900 text-stone-50 text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-amber-800 transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Add to library"}
        </button>
      </div>
    </form>
  );
}