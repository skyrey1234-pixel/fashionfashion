import { jsPDF } from "jspdf";
import { buildZip } from "@/lib/zip";

const slug = (s) => (s || "image").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const toPngBytes = async (url) => {
  const res = await fetch(url + (url.includes("?") ? "&" : "?") + "cors=1");
  const bitmap = await createImageBitmap(await res.blob());
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  return new Uint8Array(await blob.arrayBuffer());
};

/** Export selected versions as a ZIP of PNGs — every render (and sketch) of every version. */
export async function exportVersionsZip(items) {
  const files = [];
  for (const { version, projectName } of items) {
    const images = [
      ...(version.sketch_url ? [{ url: version.sketch_url, caption: "sketch" }] : []),
      ...(version.renders || []).map((r) => ({ url: r.url, caption: [r.fabric, r.view_type].filter(Boolean).join(" ") })),
    ];
    for (let i = 0; i < images.length; i++) {
      const data = await toPngBytes(images[i].url);
      files.push({ name: `${slug(projectName)}/v${version.version_number}/${slug(images[i].caption)}-${i + 1}.png`, data });
    }
  }
  const blob = buildZip(files);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "couture-designs.zip";
  a.click();
  URL.revokeObjectURL(a.href);
}

const toDataUrl = async (url) => {
  const res = await fetch(url + (url.includes("?") ? "&" : "?") + "cors=1");
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

/** Export selected versions (with all their renders) as a single PDF lookbook. */
export async function exportVersionsPdf(items) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 40;
  let first = true;

  for (const { version, projectName } of items) {
    const images = version.renders?.length
      ? version.renders.map((r) => ({ url: r.url, caption: `${r.view_type || ""} — ${r.fabric || ""}` }))
      : version.sketch_url
        ? [{ url: version.sketch_url, caption: "Sketch" }]
        : [];
    for (const img of images) {
      if (!first) pdf.addPage();
      first = false;
      pdf.setFont("times", "normal");
      pdf.setFontSize(18);
      pdf.setTextColor(30);
      pdf.text(`${projectName} — Version ${version.version_number}`, margin, margin + 6);
      pdf.setFontSize(10);
      pdf.setTextColor(120);
      pdf.text(img.caption, margin, margin + 24);

      const dataUrl = await toDataUrl(img.url);
      const props = pdf.getImageProperties(dataUrl);
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2 - 50;
      const scale = Math.min(maxW / props.width, maxH / props.height);
      const w = props.width * scale;
      const h = props.height * scale;
      pdf.addImage(dataUrl, "PNG", (pageW - w) / 2, margin + 44, w, h);
    }
  }
  pdf.save("couture-designs.pdf");
}