import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ChatMessage from "@/components/studio/ChatMessage";
import ChatInput from "@/components/studio/ChatInput";
import TemplateChips from "@/components/studio/TemplateChips";
import WorkingIndicator from "@/components/studio/WorkingIndicator";
import FabricSelector from "@/components/studio/FabricSelector";
import { createConcept, renderViews } from "@/lib/designEngine";
import { VIEW_TYPES } from "@/lib/viewTypes";

export default function Studio() {
  const [messages, setMessages] = useState([]);
  const [working, setWorking] = useState(null);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, working]);

  const addMessage = (msg) => setMessages((m) => [...m, msg]);

  const handleSend = async (text, files = []) => {
    addMessage({ role: "user", text, attachments: files.map((f) => ({ name: f.name })) });

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
    const spec = await createConcept({ text, fileUrls, selectedFabrics });

    addMessage({ role: "assistant", text: `${spec.summary}\n\nLet me sketch "${spec.name}" for you…` });
    setWorking("Sketching your design…");
    const sketch = await base44.integrations.Core.GenerateImage({
      prompt: spec.sketch_prompt,
      ...(imageUrls.length > 0 ? { existing_image_urls: imageUrls } : {}),
    });

    setWorking("Shooting every angle in each fabric…");
    const fabricsSpec =
      selectedFabrics.length > 0 ? spec.fabrics.slice(0, selectedFabrics.length) : spec.fabrics.slice(0, 2);
    const renders = await renderViews({
      fabricsSpec,
      sketchUrl: sketch.url,
      selectedFabrics,
      views: VIEW_TYPES,
      version: 1,
    });

    setWorking("Opening your design studio…");
    const project = await base44.entities.DesignProject.create({
      name: spec.name,
      original_prompt: text,
      description: spec.summary,
      selected_fabric_ids: selectedFabrics.map((f) => f.id),
      cover_url: renders[0]?.url,
      status: "active",
    });
    const version = await base44.entities.DesignVersion.create({
      project_id: project.id,
      version_number: 1,
      label: "Original design",
      edit_prompt: text,
      sketch_url: sketch.url,
      renders,
      locked_attributes: [],
    });
    await base44.entities.DesignProject.update(project.id, { current_version_id: version.id });
    await base44.entities.DesignMessage.bulkCreate([
      { project_id: project.id, version_id: version.id, role: "user", text },
      {
        project_id: project.id,
        version_id: version.id,
        role: "assistant",
        text: `${spec.summary}\n\nVersion 1 of "${spec.name}" is ready. Tell me what to change and I'll keep everything else exactly the same.`,
      },
      ...(spec.styling_advice || spec.variations?.length
        ? [
            {
              project_id: project.id,
              version_id: version.id,
              role: "assistant",
              text: `${spec.styling_advice || ""}${
                spec.variations?.length ? "\n\nWant to explore a variation? Tap one below or describe your own." : ""
              }`.trim(),
              suggestions: spec.variations || [],
            },
          ]
        : []),
    ]);

    setWorking(null);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4">
      <div className="flex-1 py-8 space-y-5">
        {messages.length === 0 && (
          <div className="text-center pt-16 pb-10">
            <p className="font-display text-4xl md:text-5xl text-stone-900 mb-4">Design your next piece</p>
            <p className="text-stone-500 text-sm max-w-md mx-auto mb-10">
              Tell me what you dream of wearing — I'll sketch it, shoot it in every angle, then keep refining it with you.
            </p>
            <TemplateChips onPick={handleSend} disabled={!!working} />
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role}>
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