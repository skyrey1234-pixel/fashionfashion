import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw } from "lucide-react";
import BuildSetup from "@/components/garment-build/BuildSetup";
import StatusStepper from "@/components/garment-build/StatusStepper";
import DifficultyCard from "@/components/garment-build/DifficultyCard";
import PatternPieces from "@/components/garment-build/PatternPieces";
import EaseTable from "@/components/garment-build/EaseTable";
import MaterialsList from "@/components/garment-build/MaterialsList";
import ConstructionSteps from "@/components/garment-build/ConstructionSteps";
import { generateBuildPlan } from "@/lib/buildEngine";
import { useToast } from "@/components/ui/use-toast";

const TABS = ["Pattern pieces", "Fit & ease", "Materials", "Construction"];

export default function BuildMode() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState(TABS[0]);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => base44.entities.DesignProject.get(id),
  });
  const { data: plans } = useQuery({
    queryKey: ["build-plan", id],
    queryFn: () => base44.entities.BuildPlan.filter({ project_id: id }),
  });

  if (!project || !plans) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const plan = plans[0];

  const handleGenerate = async (settings) => {
    setGenerating(true);
    try {
      const result = await generateBuildPlan({
        description: `${project.name}. ${project.original_prompt || project.description || ""}`,
        ...settings,
      });
      const data = { ...settings, ...result, status: "ai_generated" };
      if (plan) await base44.entities.BuildPlan.update(plan.id, data);
      else await base44.entities.BuildPlan.create({ project_id: id, ...data });
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["build-plan", id] });
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't draft the build plan",
        description: "Something went wrong while generating the blueprint. Please try again.",
      });
    }
    setGenerating(false);
  };

  const handleAdvance = async (status) => {
    await base44.entities.BuildPlan.update(plan.id, { status });
    qc.invalidateQueries({ queryKey: ["build-plan", id] });
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-display text-3xl text-stone-900">Build Mode</p>
        {plan && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate plan
          </button>
        )}
      </div>
      <p className="text-sm text-stone-500 mb-6">
        {project.name} — from concept to a garment you can actually cut and sew.
      </p>

      {!plan || editing ? (
        <BuildSetup
          defaults={plan}
          generating={generating}
          onGenerate={handleGenerate}
          onCancel={plan ? () => setEditing(false) : undefined}
        />
      ) : (
        <div className="space-y-5">
          <StatusStepper status={plan.status || "ai_generated"} onAdvance={handleAdvance} />
          <DifficultyCard difficulty={plan.difficulty} />

          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
                  tab === t
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "border-stone-300 text-stone-500 hover:border-stone-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Pattern pieces" && <PatternPieces pieces={plan.pieces} />}
          {tab === "Fit & ease" && <EaseTable ease={plan.ease} fit={plan.fit} />}
          {tab === "Materials" && <MaterialsList yardage={plan.yardage} materials={plan.materials} />}
          {tab === "Construction" && <ConstructionSteps steps={plan.steps} />}
        </div>
      )}

      <Link
        to={`/project/${id}`}
        className="inline-block mt-8 text-xs underline underline-offset-4 text-stone-500 hover:text-stone-900"
      >
        ← Back to design editor
      </Link>
    </div>
  );
}