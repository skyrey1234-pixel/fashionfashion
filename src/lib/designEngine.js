import { base44 } from "@/api/base44Client";
import { VIEW_TYPES } from "@/lib/viewTypes";

const isSafetyBlock = (err) => /Responsible AI|filtered|safety|violat/i.test(err?.message || "");

/** GenerateImage with an automatic softer-phrasing retry when the safety filter blocks the result. */
async function generateImage(params) {
  try {
    return await base44.integrations.Core.GenerateImage(params);
  } catch (err) {
    if (!isSafetyBlock(err)) throw err;
    try {
      return await base44.integrations.Core.GenerateImage({
        ...params,
        prompt: `Tasteful, professional fashion catalog photograph of a fully clothed model in a modest studio setting. ${params.prompt}`,
      });
    } catch (err2) {
      if (!isSafetyBlock(err2)) throw err2;
      const e = new Error(
        "The image service declined this request even after rephrasing. Please reword your edit — avoid body-related or suggestive terms — and try again."
      );
      e.friendly = true;
      throw e;
    }
  }
}

export const PRESERVE =
  "Preserve the garment's silhouette, colours, proportions, model, pose, background and every unchanged detail exactly as in the reference image. Modify only the requested elements.";

/** Ask the LLM for a design concept: name, summary, sketch prompt and fabric render prompts. */
export async function createConcept({ text, fileUrls = [], selectedFabrics = [] }) {
  return base44.integrations.Core.InvokeLLM({
    prompt: `You are a world-class fashion designer AI. A client asked for this garment: "${text}".
${fileUrls.length > 0 ? "The client attached reference files — photos of clothing to edit or redesign, and/or documents with specs and notes. Study them carefully and base the design on them, applying the client's requested changes." : ""}
Create a design concept. Respond with:
- name: a chic, short name for the piece (max 5 words)
- summary: 2-3 sentences describing the design (silhouette, details, mood) written warmly to the client
- sketch_prompt: a detailed prompt for generating a black-and-white fashion illustration sketch of this exact garment on a croquis figure, pencil/ink style, white background
- styling_advice: 2-3 warm sentences of styling advice for the client — what to pair this piece with, occasions, shoes/accessories
- variations: exactly 4 short design variation ideas (4-8 words each) the client could try next, e.g. a different neckline, length, colourway or trim
- fabrics: ${
      selectedFabrics.length > 0
        ? `exactly these ${selectedFabrics.length} fabrics from the client's own library — use their exact names and honor their described texture and pattern: ${selectedFabrics
            .map((f) => `"${f.name}"${f.description ? ` (${f.description})` : ""}`)
            .join(", ")}`
        : `exactly 2 distinct fabrics that suit this piece`
    }, each with "fabric" (the fabric name), "colorway" (a short, evocative colour name for the piece in that fabric) and "render_prompt" (a detailed description of this exact garment made in that fabric — the garment, its construction and its colour only, with no camera angle or framing mentioned, since the angle will be added separately)`,
    response_json_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        summary: { type: "string" },
        sketch_prompt: { type: "string" },
        styling_advice: { type: "string" },
        variations: { type: "array", items: { type: "string" } },
        fabrics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              fabric: { type: "string" },
              colorway: { type: "string" },
              render_prompt: { type: "string" },
            },
          },
        },
      },
    },
    ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
  });
}

/** Render a set of views for each fabric, using the sketch (and optional swatch) as reference. */
export async function renderViews({ fabricsSpec, sketchUrl, selectedFabrics = [], views = VIEW_TYPES, version = 1 }) {
  const jobs = fabricsSpec.flatMap((f, i) =>
    views.map((v) => ({ f, v, swatch: selectedFabrics[i]?.swatch_url }))
  );
  return Promise.all(
    jobs.map(async ({ f, v, swatch }) => {
      const prompt = `${v.prompt}. Garment: ${f.render_prompt}. The first reference image is the design sketch — keep the garment identical to it.${
        swatch ? " The second reference image is the exact fabric swatch — match its texture, pattern, weave and colour precisely." : ""
      }${v.id === "technical_flat" ? "" : " Soft professional studio lighting, neutral background."}`;
      const img = await generateImage({
        prompt,
        existing_image_urls: swatch ? [sketchUrl, swatch] : [sketchUrl],
      });
      return {
        fabric: f.fabric,
        url: img.url,
        view_type: v.label,
        colorway: f.colorway || "",
        version,
        settings: { prompt, swatch_url: swatch || "", sketch_url: sketchUrl },
      };
    })
  );
}

const groupByFabric = (renders) => {
  const fabrics = [...new Set(renders.map((r) => r.fabric))];
  return fabrics.map((fabric) => renders.filter((r) => r.fabric === fabric));
};

const primaryOf = (group) => group.find((r) => r.view_type === "Front") || group[0];

/**
 * Apply an edit instruction to the current version: regenerates the primary (Front)
 * image of each fabric from the current image, preserving everything else.
 */
export async function renderEdit({ renders, instruction, lockedAttributes = [], version, swatchByFabric = {} }) {
  const locks =
    lockedAttributes.length > 0
      ? ` These elements are locked and must stay exactly as they are: ${lockedAttributes.join(", ")}.`
      : "";
  return Promise.all(
    groupByFabric(renders).map(async (group) => {
      const base = primaryOf(group);
      const swatch = swatchByFabric[base.fabric] || base.settings?.swatch_url;
      const prompt = `Edit the garment in the reference image: ${instruction}. ${PRESERVE}${locks}${
        swatch ? " The second reference image is the fabric swatch — keep its texture and colour unless the edit asks otherwise." : ""
      }`;
      const img = await generateImage({
        prompt,
        existing_image_urls: swatch ? [base.url, swatch] : [base.url],
      });
      return {
        fabric: base.fabric,
        url: img.url,
        view_type: "Front",
        colorway: base.colorway || "",
        version,
        settings: { prompt, swatch_url: swatch || "", sketch_url: base.settings?.sketch_url || "" },
      };
    })
  );
}

/**
 * Apply an edit only to a user-marked region. The annotated image carries red brush
 * strokes over the region to change; other fabrics get the same edit from plain text.
 */
export async function renderRegionEdit({ renders, instruction, annotatedUrl, fabric, version, lockedAttributes = [] }) {
  const locks =
    lockedAttributes.length > 0
      ? ` These elements are locked and must stay exactly as they are: ${lockedAttributes.join(", ")}.`
      : "";
  return Promise.all(
    groupByFabric(renders).map(async (group) => {
      const base = primaryOf(group);
      const marked = base.fabric === fabric;
      const prompt = marked
        ? `The reference image is a garment photo with a region marked in bright red brush strokes. Apply this edit ONLY inside the marked region: ${instruction}. Everything outside the marked region must stay pixel-identical, and the red markings themselves must be completely removed from the result. ${PRESERVE}${locks}`
        : `Edit the garment in the reference image: ${instruction} (applied only to that specific area of the garment). ${PRESERVE}${locks}`;
      const img = await generateImage({
        prompt,
        existing_image_urls: [marked ? annotatedUrl : base.url],
      });
      return {
        fabric: base.fabric,
        url: img.url,
        view_type: "Front",
        colorway: base.colorway || "",
        version,
        settings: { prompt, swatch_url: base.settings?.swatch_url || "", sketch_url: base.settings?.sketch_url || "" },
      };
    })
  );
}

export const TURNTABLE_PREFIX = "Turntable ";

/** Generate an evenly-spaced 360° set of frames for one fabric, from its Front image. */
export async function renderTurntable({ base, frames = 12, version }) {
  const step = 360 / frames;
  const angles = Array.from({ length: frames }, (_, i) => Math.round(i * step));
  return Promise.all(
    angles.map(async (angle) => {
      const prompt = `Full-length studio photograph of the exact garment in the reference image, rotated ${angle} degrees clockwise around its vertical axis from the front-facing view (0 degrees is straight-on front, 90 is the right side profile, 180 is the back, 270 is the left side profile). Reproduce the same garment, model, pose, fabric, colours, lighting, framing and background precisely — only the rotation of the viewpoint changes. Soft professional studio lighting, neutral background, subject centred at the same scale in every frame.`;
      const img = await generateImage({ prompt, existing_image_urls: [base.url] });
      return {
        fabric: base.fabric,
        url: img.url,
        view_type: `${TURNTABLE_PREFIX}${angle}°`,
        colorway: base.colorway || "",
        version,
        settings: { prompt, swatch_url: base.settings?.swatch_url || "", sketch_url: base.settings?.sketch_url || "" },
      };
    })
  );
}

/** Fill in every remaining camera angle for a version, using its Front image as the reference. */
export async function renderRemainingViews({ renders, version }) {
  const jobs = groupByFabric(renders).flatMap((group) => {
    const base = primaryOf(group);
    const have = new Set(group.map((r) => r.view_type));
    return VIEW_TYPES.filter((v) => !have.has(v.label)).map((v) => ({ base, v }));
  });
  return Promise.all(
    jobs.map(async ({ base, v }) => {
      const prompt = `${v.prompt}. The reference image shows the exact garment — reproduce the same garment, fabric and colours precisely, only changing the camera angle and framing.${
        v.id === "technical_flat" ? "" : " Soft professional studio lighting, neutral background."
      }`;
      const img = await generateImage({ prompt, existing_image_urls: [base.url] });
      return {
        fabric: base.fabric,
        url: img.url,
        view_type: v.label,
        colorway: base.colorway || "",
        version,
        settings: { prompt, swatch_url: base.settings?.swatch_url || "", sketch_url: base.settings?.sketch_url || "" },
      };
    })
  );
}