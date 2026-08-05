import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, Camera, Lasso, Hammer } from "lucide-react";
import RenderGallery from "@/components/studio/RenderGallery";
import VersionHistory from "@/components/editor/VersionHistory";
import EditorChat from "@/components/editor/EditorChat";
import QuickEdits from "@/components/editor/QuickEdits";
import RegionEditor from "@/components/editor/RegionEditor";
import ExportImages from "@/components/editor/ExportImages";
import { renderEdit, renderRegionEdit, renderRemainingViews } from "@/lib/designEngine";
import { useToast } from "@/components/ui/use-toast";

export default function DesignEditor() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [working, setWorking] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [regionOpen, setRegionOpen] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => base44.entities.DesignProject.get(id),
  });
  const { data: versions } = useQuery({
    queryKey: ["versions", id],
    queryFn: () => base44.entities.DesignVersion.filter({ project_id: id }, "version_number"),
  });
  const { data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => base44.entities.DesignMessage.filter({ project_id: id }, "created_date"),
  });

  if (!project || !versions || !messages) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const current = versions.find((v) => v.id === project.current_version_id) || versions[versions.length - 1];
  const viewing = versions.find((v) => v.id === viewingId) || current;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["project", id] });
    qc.invalidateQueries({ queryKey: ["versions", id] });
    qc.invalidateQueries({ queryKey: ["messages", id] });
  };

  const commitVersion = async ({ text, renders, nextNumber }) => {
    const version = await base44.entities.DesignVersion.create({
      project_id: id,
      parent_version_id: current.id,
      version_number: nextNumber,
      label: text,
      edit_prompt: text,
      sketch_url: current.sketch_url,
      renders,
      locked_attributes: current.locked_attributes || [],
    });
    await base44.entities.DesignProject.update(id, { current_version_id: version.id, cover_url: renders[0]?.url });
    await base44.entities.DesignMessage.create({
      project_id: id,
      version_id: version.id,
      role: "assistant",
      text: `Version ${nextNumber} is ready — I changed only what you asked and kept everything else intact.`,
    });
    setViewingId(version.id);
    setWorking(null);
    refresh();
  };

  const handleGenerationError = async (err) => {
    setWorking(null);
    const message = err?.friendly
      ? err.message
      : "Something went wrong while generating the images. Please try again.";
    toast({ variant: "destructive", title: "Couldn't create this version", description: message });
    await base44.entities.DesignMessage.create({
      project_id: id,
      version_id: current.id,
      role: "assistant",
      text: `I couldn't complete that edit — ${message}`,
    });
    refresh();
  };

  const handleEdit = async (text) => {
    await base44.entities.DesignMessage.create({ project_id: id, version_id: current.id, role: "user", text });
    refresh();
    const nextNumber = Math.max(...versions.map((v) => v.version_number)) + 1;
    setWorking(`Creating V${nextNumber}…`);
    try {
      const renders = await renderEdit({
        renders: current.renders || [],
        instruction: text,
        lockedAttributes: current.locked_attributes || [],
        version: nextNumber,
      });
      await commitVersion({ text, renders, nextNumber });
    } catch (err) {
      await handleGenerationError(err);
    }
  };

  const handleRegionEdit = async ({ instruction, annotatedUrl, fabric }) => {
    const text = `Change only the circled area: ${instruction}`;
    await base44.entities.DesignMessage.create({ project_id: id, version_id: current.id, role: "user", text });
    refresh();
    const nextNumber = Math.max(...versions.map((v) => v.version_number)) + 1;
    setWorking(`Editing the marked area — creating V${nextNumber}…`);
    try {
      const renders = await renderRegionEdit({
        renders: current.renders || [],
        instruction,
        annotatedUrl,
        fabric,
        lockedAttributes: current.locked_attributes || [],
        version: nextNumber,
      });
      await commitVersion({ text, renders, nextNumber });
    } catch (err) {
      await handleGenerationError(err);
    }
  };

  const regionTargets = [...new Set((current.renders || []).map((r) => r.fabric))]
    .map((f) => {
      const group = (current.renders || []).filter((r) => r.fabric === f);
      return group.find((r) => r.view_type === "Front") || group[0];
    })
    .filter(Boolean);

  const handleRestore = async (v) => {
    await base44.entities.DesignProject.update(id, { current_version_id: v.id, cover_url: v.renders?.[0]?.url });
    setViewingId(v.id);
    refresh();
  };

  const handleAllAngles = async () => {
    setWorking("Shooting the remaining angles…");
    try {
      const extra = await renderRemainingViews({ renders: viewing.renders || [], version: viewing.version_number });
      await base44.entities.DesignVersion.update(viewing.id, { renders: [...(viewing.renders || []), ...extra] });
      setWorking(null);
      refresh();
    } catch (err) {
      await handleGenerationError(err);
    }
  };

  const missingAngles = (viewing.renders || []).some((r) => r.view_type === "Front") &&
    new Set((viewing.renders || []).map((r) => r.view_type)).size < 8;

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="font-display text-3xl text-stone-900">{project.name}</p>
          <p className="text-xs text-stone-500 mt-1">{project.description}</p>
        </div>
        <span className="text-[11px] uppercase tracking-widest text-amber-800">Version {viewing.version_number}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-5">
          {viewing.renders?.length > 0 ? (
            <RenderGallery renders={viewing.renders} />
          ) : (
            <p className="text-sm text-stone-500">No renders in this version.</p>
          )}
          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => setRegionOpen(true)}
              disabled={!!working || regionTargets.length === 0}
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors disabled:opacity-40"
            >
              <Lasso className="w-3.5 h-3.5" /> Edit an area
            </button>
            <ExportImages projectName={project.name} version={viewing} disabled={!!working} />
            <Link
              to={`/project/${id}/build`}
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors"
            >
              <Hammer className="w-3.5 h-3.5" /> Build mode
            </Link>
          </div>
          <RegionEditor open={regionOpen} onOpenChange={setRegionOpen} targets={regionTargets} onSubmit={handleRegionEdit} />
          {missingAngles && (
            <button
              onClick={handleAllAngles}
              disabled={!!working}
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors disabled:opacity-40"
            >
              <Camera className="w-3.5 h-3.5" /> Generate all angles for this version
            </button>
          )}
          <VersionHistory
            versions={versions}
            currentId={current.id}
            viewingId={viewing.id}
            onView={setViewingId}
            onRestore={handleRestore}
          />
          <Link to="/designs" className="inline-block text-xs underline underline-offset-4 text-stone-500 hover:text-stone-900">
            ← All projects
          </Link>
        </div>

        <div className="lg:h-[70vh] lg:sticky lg:top-6 bg-white/60 rounded-2xl border border-stone-200 p-4 flex flex-col">
          <EditorChat messages={messages} working={working} onSend={handleEdit} />
          <div className="pt-3">
            <QuickEdits onPick={handleEdit} disabled={!!working} />
          </div>
        </div>
      </div>
    </div>
  );
}