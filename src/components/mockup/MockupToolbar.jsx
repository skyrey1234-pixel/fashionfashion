import React, { useRef } from "react";
import { ImagePlus, Type, Download, Save, Loader2 } from "lucide-react";

const btn =
  "flex items-center gap-1.5 text-[11px] uppercase tracking-widest border border-stone-300 rounded-full px-4 py-2 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-40";

export default function MockupToolbar({ onAddImage, onAddText, onDownload, onSave, uploading, saving, downloading }) {
  const fileRef = useRef(null);

  return (
    <div className="flex flex-wrap gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAddImage(file);
          e.target.value = "";
        }}
      />
      <button className={btn} onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />} Add image
      </button>
      <button className={btn} onClick={onAddText}>
        <Type className="w-3.5 h-3.5" /> Add text
      </button>
      <button className={btn} onClick={onDownload} disabled={downloading}>
        {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Download
      </button>
      <button
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest rounded-full px-4 py-2 bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors disabled:opacity-40"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
      </button>
    </div>
  );
}