import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardProgressRow } from "@/types/database";

interface Props {
  projectId: number;
  cutoffDate: string;
}

function pct(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return (value * 100).toFixed(2) + "%";
}

function VarianceRow({ label, value }: { label: string; value: number | null }) {
  const isNull = value === null;
  const isPositive = !isNull && value! > 0;
  const isZero = !isNull && value === 0;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          isNull || isZero
            ? "text-muted-foreground font-medium"
            : isPositive
              ? "flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"
              : "flex items-center gap-1 font-medium text-red-500"
        }
      >
        {isNull ? (
          "—"
        ) : isZero ? (
          pct(value)
        ) : (
          <>
            {isPositive ? (
              <TrendingUpIcon className="size-3.5" />
            ) : (
              <TrendingDownIcon className="size-3.5" />
            )}
            {pct(value)}
          </>
        )}
      </span>
    </div>
  );
}

/** Summary cards showing This Week and Cumulative progress for the Overall (E) discipline. */
export async function SummaryCards({ projectId, cutoffDate }: Props) {
  const supabase = createClient();

  const { data: rows } = (await supabase
    .from("v_dashboard_progress")
    .select("*")
    .eq("project_id", projectId)
    .eq("discipline_code", "E")
    .eq("cutoff_date", cutoffDate)
    .limit(1)) as { data: DashboardProgressRow[] | null; error: unknown };

  const row = rows?.[0] ?? null;

  if (!row) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
        No data available for the selected cut-off date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* This Week */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">This Week Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Actual Progress</span>
            <span className="font-semibold">{pct(row.this_week_actual)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Planned Progress</span>
            <span className="font-semibold">{pct(row.this_week_plan)}</span>
          </div>
          <div className="border-t pt-2">
            <VarianceRow label="Variance" value={row.this_week_variance} />
          </div>
        </CardContent>
      </Card>

      {/* Cumulative */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cumulative Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Actual to Date</span>
            <span className="font-semibold">{pct(row.cum_actual)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Planned to Date</span>
            <span className="font-semibold">{pct(row.cum_plan)}</span>
          </div>
          <div className="border-t pt-2">
            <VarianceRow label="Variance" value={row.cum_variance} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
