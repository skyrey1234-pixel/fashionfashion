import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import VersionCard from "@/components/gallery/VersionCard";

export default function Gallery() {
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

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-10">
      <p className="font-display text-4xl text-stone-900 mb-2">Gallery</p>
      <p className="text-stone-500 text-sm mb-10">Every version of every design — your full creative record.</p>

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
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}