import { createClient } from "@/lib/supabase/server";
import { CutoffSlicer } from "@/components/dashboard/cutoff-slicer";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ProgressTable } from "@/components/dashboard/progress-table";
import { SCurveSection } from "@/components/dashboard/scurve-section";
import type { Project, WeeklyCutoff } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ cutoff?: string }>;
}

/** Main dashboard page — all sections driven by the ?cutoff search param. */
export default async function DashboardPage({ searchParams }: PageProps) {
  const { cutoff } = await searchParams;
  const supabase = createClient();

  const { data: project } = (await supabase
    .from("projects")
    .select("*")
    .eq("project_code", "PRJ-A")
    .single()) as { data: Project | null; error: unknown };

  const { data: cutoffs } = (await supabase
    .from("weekly_cutoffs")
    .select("*")
    .eq("project_id", 1)
    .order("cutoff_date", { ascending: true })) as {
    data: WeeklyCutoff[] | null;
    error: unknown;
  };

  if (!project || !cutoffs) {
    return <p className="p-8 text-red-500">Failed to load project data.</p>;
  }

  const selectedCutoff = cutoff ?? project.current_cutoff_date;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Section 0: Header + Slicer ── */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              EPC Schedule Performance
            </p>
            <h1 className="text-xl font-bold">{project.project_name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Cut-off week</span>
            <CutoffSlicer cutoffs={cutoffs} selectedCutoff={selectedCutoff} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl space-y-8 px-6 py-8">
        {/* ── Section 2: Summary Cards ── */}
        <section aria-label="Summary cards">
          <SummaryCards projectId={project.project_id} cutoffDate={selectedCutoff} />
        </section>

        {/* ── Section 1: Progress Table ── */}
        <section aria-label="Progress table">
          <ProgressTable projectId={project.project_id} cutoffDate={selectedCutoff} />
        </section>

        {/* ── Section 3: S-Curve Chart ── */}
        <section aria-label="S-curve chart">
          <SCurveSection projectId={project.project_id} cutoffDate={selectedCutoff} />
        </section>
      </main>
    </div>
  );
}
