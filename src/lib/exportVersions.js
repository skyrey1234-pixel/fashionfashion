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