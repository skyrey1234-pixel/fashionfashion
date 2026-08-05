import { base44 } from "@/api/base44Client";

export const FIT_OPTIONS = [
  { value: "compression", label: "Compression", example: "Tight stretch garments" },
  { value: "fitted", label: "Fitted", example: "Body-following dress or shirt" },
  { value: "regular", label: "Regular", example: "Everyday clothing" },
  { value: "relaxed", label: "Relaxed", example: "Loose streetwear" },
  { value: "oversized", label: "Oversized", example: "Dramatic skater or layered look" },
];

export const MEASUREMENT_FIELDS = [
  { key: "chest", label: "Chest / Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "shoulder_width", label: "Shoulder width" },
  { key: "back_length", label: "Back length" },
  { key: "arm_length", label: "Arm length" },
  { key: "bicep", label: "Bicep" },
  { key: "wrist", label: "Wrist" },
  { key: "inseam", label: "Inseam" },
  { key: "rise", label: "Rise" },
  { key: "thigh", label: "Thigh" },
  { key: "neck", label: "Neck" },
  { key: "garment_length", label: "Garment length" },
];

export const BUILD_STATUSES = [
  { value: "ai_generated", label: "AI starting pattern" },
  { value: "patternmaker_reviewed", label: "Patternmaker reviewed" },
  { value: "sample_tested", label: "Sample tested" },
  { value: "production_approved", label: "Production approved" },
];

export async function generateBuildPlan({ description, garment_type, fit, fabric, target_size, measurements }) {
  const measured = Object.entries(measurements || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v} in`)
    .join(", ");

  const context = `You are an expert patternmaker and garment technologist. Create a practical, realistic build plan for this garment.

Design description: ${description}
Garment type: ${garment_type}
Intended fit: ${fit}
Main fabric: ${fabric}
Target size: ${target_size}
Body measurements (inches): ${measured || "not provided — use standard body measurements for the target size"}

Be specific and honest — this is an AI-generated starting pattern that must be reviewed by a patternmaker and sample tested before production.`;

  const patternPrompt = `${context}

Produce:
1. pieces — every pattern piece needed to build this garment (fronts, backs, sleeves, collar/hood, waistband, cuffs, pockets, lining, facing, interfacing — only what this design actually needs). For each: quantity to cut, whether it is cut on the fold, whether it is a mirrored pair, grainline direction, seam allowance, notch placement, and a short note.
2. ease — for each relevant body measurement, the recommended finished garment measurement range for the intended fit (e.g. body chest 40" → finished 46–50" for oversized), with a one-line reason.
3. yardage — estimated main fabric, lining, and interfacing yardage for ONE garment (state the assumed fabric width), plus a note covering print/nap direction and a recommended ~15% test allowance.
4. materials — a complete bill of materials shopping list: fabric, lining, interfacing, thread, zippers/hardware, trims, labels, with quantities.`;

  const constructionPrompt = `${context}

Produce:
1. steps — the correct construction order (8–16 steps, e.g. interfacing → shoulder seams → facing → sleeves → side seams → pockets → closures → lining → hem → press → inspect). For each: what to do, stitch type, seam allowance, machine setting, and needle/thread recommendation where relevant.
2. difficulty — a 1–10 construction difficulty score with reasons, required skill level, and estimated sewing hours.`;

  const [patternPart, constructionPart] = await Promise.all([
    base44.integrations.Core.InvokeLLM({
      prompt: patternPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          pieces: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: { type: "number" },
                cut_on_fold: { type: "boolean" },
                mirrored: { type: "boolean" },
                grainline: { type: "string" },
                seam_allowance: { type: "string" },
                notches: { type: "string" },
                notes: { type: "string" },
              },
            },
          },
          ease: {
            type: "array",
            items: {
              type: "object",
              properties: {
                measurement: { type: "string" },
                body_value: { type: "string" },
                finished_range: { type: "string" },
                note: { type: "string" },
              },
            },
          },
          yardage: {
            type: "object",
            properties: {
              main_yards: { type: "string" },
              lining_yards: { type: "string" },
              interfacing_yards: { type: "string" },
              fabric_width: { type: "string" },
              notes: { type: "string" },
            },
          },
          materials: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                quantity: { type: "string" },
                notes: { type: "string" },
              },
            },
          },
        },
      },
    }),
    base44.integrations.Core.InvokeLLM({
      prompt: constructionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                detail: { type: "string" },
                stitch_type: { type: "string" },
                seam_allowance: { type: "string" },
                machine_setting: { type: "string" },
                needle_thread: { type: "string" },
              },
            },
          },
          difficulty: {
            type: "object",
            properties: {
              score: { type: "number" },
              skill_level: { type: "string" },
              estimated_hours: { type: "string" },
              reasons: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    }),
  ]);

  return { ...patternPart, ...constructionPart };
}