import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ChatMessage from "@/components/studio/ChatMessage";
import ChatInput from "@/components/studio/ChatInput";
import TemplateChips from "@/components/studio/TemplateChips";
import DesignResult from "@/components/studio/DesignResult";
import WorkingIndicator from "@/components/studio/WorkingIndicator";
import FabricSelector from "@/components/studio/FabricSelector";
import { VIEW_TYPES } from "@/lib/viewTypes";

export default function Studio() {
  const [messages, setMessages] = useState([]);
  const [working, setWorking] = useState(null);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, working]);

  const addMessage = (msg) => setMessages((m) => [...m, msg]);

  const handleSend = async (text, files = []) => {
    addMessage({ role: "user", text, attachments: files.map((f) => ({ name: f.name, isImage: f.type.startsWith("image/") })) });

    let fileUrls = [];
    let imageUrls = [];
    if (files.length > 0) {
      setWorking("Studying your references…");
      const uploads = await Promise.all(
        files.map(async (f) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
          return { url: file_url, isImage: f.type.startsWith("image/") };
        })
      );
      fileUrls = uploads.map((u) => u.url);
      imageUrls = uploads.filter((u) => u.isImage).map((u) => u.url);
    }
    setWorking("Interpreting your vision…");

    const spec = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a world-class fashion designer AI. A client asked for this garment: "${text}".
${fileUrls.length > 0 ? "The client attached reference files — photos of clothing to edit or redesign, and/or documents with specs and notes. Study them carefully and base the design on them, applying the client's requested changes." : ""}
Create a design concept. Respond with:
- name: a chic, short name for the piece (max 5 words)
- summary: 2-3 sentences describing the design (silhouette, details, mood) written warmly to the client
- sketch_prompt: a detailed prompt for generating a black-and-white fashion illustration sketch of this exact garment on a croquis figure, pencil/ink style, white background
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

    addMessage({ role: "assistant", text: `${spec.summary}\n\nLet me sketch "${spec.name}" for you…` });
    setWorking("Sketching your design…");

    const sketch = await base44.integrations.Core.GenerateImage({
      prompt: spec.sketch_prompt,
      ...(imageUrls.length > 0 ? { existing_image_urls: imageUrls } : {}),
    });

    setWorking("Shooting every angle in each fabric…");
    const chosen = selectedFabrics.length > 0 ? spec.fabrics.slice(0, selectedFabrics.length) : spec.fabrics.slice(0, 2);
    const jobs = chosen.flatMap((f, i) =>
      VIEW_TYPES.map((v) => ({ f, v, swatch: selectedFabrics[i]?.swatch_url }))
    );
    const renders = await Promise.all(
      jobs.map(async ({ f, v, swatch }) => {
        const prompt = `${v.prompt}. Garment: ${f.render_prompt}. The first reference image is the design sketch — keep the garment identical to it.${
          swatch ? " The second reference image is the exact fabric swatch — match its texture, pattern, weave and colour precisely." : ""
        }${v.id === "technical_flat" ? "" : " Soft professional studio lighting, neutral background."}`;
        const existing = swatch ? [sketch.url, swatch] : [sketch.url];
        const img = await base44.integrations.Core.GenerateImage({ prompt, existing_image_urls: existing });
        return {
          fabric: f.fabric,
          url: img.url,
          view_type: v.label,
          colorway: f.colorway || "",
          version: 1,
          settings: { prompt, swatch_url: swatch || "", sketch_url: sketch.url },
        };
      })
    );

    const design = await base44.entities.Design.create({
      name: spec.name,
      description: spec.summary,
      sketch_url: sketch.url,
      renders,
    });

    setWorking(null);
    addMessage({ role: "assistant", design });
    addMessage({ role: "assistant", text: "Saved to your collection. Want to try another piece, or a variation of this one?" });
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4">
      <div className="flex-1 py-8 space-y-5">
        {messages.length === 0 && (
          <div className="text-center pt-16 pb-10">
            <p className="font-display text-4xl md:text-5xl text-stone-900 mb-4">Design your next piece</p>
            <p className="text-stone-500 text-sm max-w-md mx-auto mb-10">
              Tell me what you dream of wearing — I'll sketch it, then bring it to life in different fabrics.
            </p>
            <TemplateChips onPick={handleSend} disabled={!!working} />
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role}>
            {m.design ? (
              <DesignResult design={m.design} />
            ) : (
              <div>
                <span className="whitespace-pre-line">{m.text}</span>
                {m.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.attachments.map((a, j) => (
                      <span key={j} className="text-[11px] bg-stone-700 rounded-full px-2.5 py-0.5">
                        📎 {a.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ChatMessage>
        ))}
        {working && (
          <ChatMessage role="assistant">
            <WorkingIndicator stage={working} />
          </ChatMessage>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="sticky bottom-0 pb-6 pt-2 bg-gradient-to-t from-[#faf8f4] via-[#faf8f4] to-transparent">
        <FabricSelector selected={selectedFabrics} setSelected={setSelectedFabrics} disabled={!!working} />
        <ChatInput onSend={handleSend} disabled={!!working} />
      </div>
    </div>
  );
}