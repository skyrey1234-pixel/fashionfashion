import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

const slug = (s) => (s || "design").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function downloadUrl(url, filename) {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export default function ExportImages({ projectName, version, disabled }) {
  const [busy, setBusy] = useState(false);

  const files = [
    ...(version.sketch_url ? [{ url: version.sketch_url, name: "sketch" }] : []),
    ...(version.renders || []).map((r) => ({ url: r.url, name: `${r.fabric}-${r.view_type}` })),
  ].filter((f) => f.url);

  const handleExport = async () => {
    setBusy(true);
    const base = `${slug(projectName)}-v${version.version_number}`;
    for (const [i, f] of files.entries()) {
      await downloadUrl(f.url, `${base}-${slug(f.name)}.png`);
      if (i < files.length - 1) await new Promise((r) => setTimeout(r, 350));
    }
    setBusy(false);
  };

  if (files.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      disabled={disabled || busy}
      className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors disabled:opacity-40"
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      {busy ? "Downloading…" : `Download images (${files.length})`}
    </button>
  );
}