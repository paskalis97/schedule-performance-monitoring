import { createClient } from "@/lib/supabase/server";
import type { DashboardProgressRow, SCurveRow } from "@/types/database";
import { SCurveChart, type ChartDataPoint } from "./scurve-chart";

interface Props {
  projectId: number;
  cutoffDate: string;
}

/** Server wrapper: fetches v_scurve data, pivots it, passes to the client chart. */
export async function SCurveSection({ projectId, cutoffDate }: Props) {
  const supabase = createClient();

  const [{ data: scurveRows }, { data: progressRows }] = await Promise.all([
    supabase
      .from("v_scurve")
      .select("*")
      .eq("project_id", projectId)
      .eq("discipline_code", "E")
      .order("cutoff_date", { ascending: true }),
    supabase
      .from("v_dashboard_progress")
      .select("*")
      .eq("project_id", projectId)
      .eq("discipline_code", "E")
      .eq("cutoff_date", cutoffDate)
      .limit(1),
  ] as const) as [
    { data: SCurveRow[] | null; error: unknown },
    { data: DashboardProgressRow[] | null; error: unknown },
  ];

  if (!scurveRows?.length) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
        No S-curve data available.
      </div>
    );
  }

  // Pivot long-format rows → one object per date with series as keys
  const pointMap = new Map<string, ChartDataPoint>();
  for (const row of scurveRows) {
    const point = pointMap.get(row.cutoff_date) ?? { date: row.cutoff_date };
    point[row.series_type] = row.cumulative_progress * 100;
    pointMap.set(row.cutoff_date, point);
  }
  const chartData = Array.from(pointMap.values());

  const currentSpi = progressRows?.[0]?.spi ?? null;

  return (
    <SCurveChart
      data={chartData}
      cutoffDate={cutoffDate}
      currentSpi={currentSpi}
    />
  );
}
