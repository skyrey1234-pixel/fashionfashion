import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Loader2, CheckSquare } from "lucide-react";
import VersionCard from "@/components/gallery/VersionCard";
import BulkActionBar from "@/components/gallery/BulkActionBar";
import { exportVersionsPdf } from "@/lib/exportVersions";

export default function Gallery() {
  const queryClient = useQueryClient();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.DesignProject.list("-updated_date"),
  });
  const { data: versions, isLoading: loadingVersions } = useQuery({
    queryKey: ["all-versions"],
    queryFn: () => base44.entities.DesignVersion.list("-created_date", 500),
  });

  if (loadingProjects || loadingVersions) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const byProject = (projects || [])
    .map((p) => ({
      project: p,
      versions: (versions || [])
        .filter((v) => v.project_id === p.id)
        .sort((a, b) => a.version_number - b.version_number),
    }))
    .filter((g) => g.versions.length > 0);

  const toggle = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const selectedItems = byProject.flatMap(({ project, versions }) =>
    versions.filter((v) => selectedIds.has(v.id)).map((version) => ({ version, projectName: project.name }))
  );

  const handleExport = async () => {
    setExporting(true);
    await exportVersionsPdf(selectedItems);
    setExporting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => base44.entities.DesignVersion.delete(id)));
    // If a project's current version was deleted, point it at its latest remaining version
    await Promise.all(
      byProject
        .filter(({ project }) => selectedIds.has(project.current_version_id))
        .map(({ project, versions }) => {
          const remaining = versions.filter((v) => !selectedIds.has(v.id));
          const latest = remaining[remaining.length - 1];
          return base44.entities.DesignProject.update(project.id, {
            current_version_id: latest ? latest.id : "",
            ...(latest ? { cover_url: latest.renders?.[0]?.url || latest.sketch_url || "" } : {}),
          });
        })
    );
    queryClient.invalidateQueries({ queryKey: ["all-versions"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    setDeleting(false);
    exitSelectMode();
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-10 pb-28">
      <div className="flex items-start justify-between mb-2">
        <p className="font-display text-4xl text-stone-900">Gallery</p>
        {byProject.length > 0 && !selectMode && (
          <button
            onClick={() => setSelectMode(true)}
            className="flex items-center gap-1.5 text-sm border border-stone-300 rounded-full px-4 py-2 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors"
          >
            <CheckSquare className="w-4 h-4" /> Select
          </button>
        )}
      </div>
      <p className="text-stone-500 text-sm mb-10">
        {selectMode
          ? "Tap versions to select them, then export or delete them together."
          : "Every version of every design — your full creative record."}
      </p>

      {byProject.length === 0 && (
        <div className="text-center py-20 border border-dashed border-stone-300 rounded-2xl">
          <p className="text-stone-500 mb-4">Nothing here yet.</p>
          <Link to="/" className="text-sm underline underline-offset-4 text-stone-900 hover:text-amber-800 transition-colors">
            Start designing in the Studio →
          </Link>
        </div>
      )}

      <div className="space-y-14">
        {byProject.map(({ project, versions }) => (
          <section key={project.id}>
            <div className="flex items-baseline justify-between mb-4">
              <Link to={`/project/${project.id}`} className="font-display text-2xl text-stone-900 hover:text-amber-800 transition-colors">
                {project.name}
              </Link>
              <span className="text-[11px] uppercase tracking-widest text-stone-400">
                {versions.length} version{versions.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {versions.map((v) => (
                <VersionCard
                  key={v.id}
                  version={v}
                  projectId={project.id}
                  isCurrent={v.id === project.current_version_id}
                  selectMode={selectMode}
                  selected={selectedIds.has(v.id)}
                  onToggle={toggle}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectMode && (
        <BulkActionBar
          count={selectedIds.size}
          onExport={handleExport}
          onDelete={handleDelete}
          onCancel={exitSelectMode}
          exporting={exporting}
          deleting={deleting}
        />
      )}
    </div>
  );
}