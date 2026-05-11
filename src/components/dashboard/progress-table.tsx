import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardProgressRow, SpiThreshold } from "@/types/database";

interface Props {
  projectId: number;
  cutoffDate: string;
}

function pct(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return (value * 100).toFixed(2) + "%";
}

/** Returns pill bg+text classes for a variance value. Zero → neutral, not green. */
function getVariancePillClass(variance: number | null): string {
  if (variance === null) return "bg-muted text-muted-foreground";
  if (variance > 0)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
  if (variance === 0) return "bg-muted text-muted-foreground";
  if (variance > -0.005)
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
}

function getSpiPillClass(spi: number | null, thresholds: SpiThreshold): string {
  if (spi === null) return "bg-muted text-muted-foreground";
  if (spi >= thresholds.green_min)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
  if (spi >= thresholds.yellow_min)
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
}

function VariancePill({ value }: { value: number | null }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getVariancePillClass(value)}`}
    >
      {pct(value)}
    </span>
  );
}

/** 16-column overall progress table, one row per discipline. */
export async function ProgressTable({ projectId, cutoffDate }: Props) {
  const supabase = createClient();

  const [{ data: rows }, { data: thresholdRows }] = await Promise.all([
    supabase
      .from("v_dashboard_progress")
      .select("*")
      .eq("project_id", projectId)
      .eq("cutoff_date", cutoffDate)
      .order("discipline_id", { ascending: true }),
    supabase
      .from("spi_thresholds")
      .select("*")
      .is("project_id", null)
      .limit(1),
  ] as const) as [
    { data: DashboardProgressRow[] | null; error: unknown },
    { data: SpiThreshold[] | null; error: unknown },
  ];

  if (!rows?.length) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
        No progress data for the selected cut-off date.
      </div>
    );
  }

  const thresholds: SpiThreshold = thresholdRows?.[0] ?? {
    threshold_id: 0,
    project_id: null,
    green_min: 1,
    yellow_min: 0.95,
  };

  const th = "px-2 py-2 text-center text-xs font-semibold whitespace-nowrap";
  const td = "px-2 py-2 text-center text-xs tabular-nums";

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">Overall Progress</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b-0">
            <TableHead className={th} rowSpan={2}>No</TableHead>
            <TableHead className={`${th} text-left`} rowSpan={2}>Description</TableHead>
            <TableHead className={th} rowSpan={2}>WF</TableHead>
            <TableHead className={`${th} border-l bg-muted/50`} colSpan={4}>Previous</TableHead>
            <TableHead className={`${th} border-l bg-muted/30`} colSpan={4}>This Week</TableHead>
            <TableHead className={`${th} border-l bg-muted/50`} colSpan={4}>Cumulative</TableHead>
            <TableHead className={`${th} border-l`} rowSpan={2}>SPI</TableHead>
          </TableRow>
          <TableRow>
            {["Plan", "Recovery", "Actual", "Variance"].map((h) => (
              <TableHead key={`prev-${h}`} className={`${th} border-l bg-muted/50`}>{h}</TableHead>
            ))}
            {["Plan", "Recovery", "Actual", "Variance"].map((h) => (
              <TableHead key={`week-${h}`} className={`${th} border-l bg-muted/30`}>{h}</TableHead>
            ))}
            {["Plan", "Recovery", "Actual", "Variance"].map((h) => (
              <TableHead key={`cum-${h}`} className={`${th} border-l bg-muted/50`}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            const isOverall = row.discipline_code === "E";
            return (
              <TableRow
                key={row.discipline_id}
                className={isOverall ? "bg-muted/40 font-semibold border-t-2" : ""}
              >
                <TableCell className={`${td} font-medium`}>{row.discipline_code}</TableCell>
                <TableCell className={`${td} text-left`}>{row.discipline_name}</TableCell>
                {/* Issue 1: Overall row shows 100% instead of the raw 0 stored in DB */}
                <TableCell className={td}>{isOverall ? "100%" : `${(row.weight_factor * 100).toFixed(0)}%`}</TableCell>

                {/* Previous */}
                <TableCell className={`${td} border-l`}>{pct(row.prev_plan)}</TableCell>
                <TableCell className={td}>{pct(row.prev_recovery)}</TableCell>
                <TableCell className={td}>{pct(row.prev_actual)}</TableCell>
                <TableCell className={`${td} border-l`}>
                  <VariancePill value={row.prev_variance} />
                </TableCell>

                {/* This Week */}
                <TableCell className={`${td} border-l`}>{pct(row.this_week_plan)}</TableCell>
                <TableCell className={td}>{pct(row.this_week_recovery)}</TableCell>
                <TableCell className={td}>{pct(row.this_week_actual)}</TableCell>
                <TableCell className={`${td} border-l`}>
                  <VariancePill value={row.this_week_variance} />
                </TableCell>

                {/* Cumulative */}
                <TableCell className={`${td} border-l`}>{pct(row.cum_plan)}</TableCell>
                <TableCell className={td}>{pct(row.cum_recovery)}</TableCell>
                <TableCell className={td}>{pct(row.cum_actual)}</TableCell>
                <TableCell className={`${td} border-l`}>
                  <VariancePill value={row.cum_variance} />
                </TableCell>

                {/* SPI */}
                <TableCell className={`${td} border-l`}>
                  {row.spi !== null ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getSpiPillClass(row.spi, thresholds)}`}
                    >
                      {row.spi.toFixed(3)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
