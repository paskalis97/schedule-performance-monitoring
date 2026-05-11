"use client";

import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartDataPoint {
  date: string;
  BASELINE_PLAN?: number;
  RECOVERY?: number;
  ACTUAL?: number;
}

interface Props {
  data: ChartDataPoint[];
  cutoffDate: string;
  currentSpi: number | null;
}

const SERIES_LABELS: Record<string, string> = {
  BASELINE_PLAN: "Baseline Plan",
  RECOVERY: "Recovery",
  ACTUAL: "Actual",
};

const SERIES_COLORS: Record<string, string> = {
  BASELINE_PLAN: "#3b82f6",
  RECOVERY: "#f59e0b",
  ACTUAL: "#10b981",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  let dateLabel = label;
  try {
    dateLabel = format(parseISO(label), "dd MMM yyyy");
  } catch {
    // keep raw value
  }

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-popover-foreground text-xs">
      <p className="font-semibold text-foreground mb-1.5">{dateLabel}</p>
      {payload.map(
        (entry: { dataKey: string; value: number; color: string }) => (
          <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {SERIES_LABELS[entry.dataKey] ?? entry.dataKey}:
            </span>
            <span className="font-medium tabular-nums ml-auto pl-4">
              {typeof entry.value === "number"
                ? `${entry.value.toFixed(2)}%`
                : "—"}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

function SpiStatus({ spi }: { spi: number | null }) {
  if (spi === null)
    return <span className="text-muted-foreground text-sm">SPI: —</span>;

  const isGreen = spi >= 1;
  const isYellow = spi >= 0.95;
  const pillClass = isGreen
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : isYellow
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
  const statusText = isGreen
    ? "Ahead of Schedule"
    : isYellow
      ? "Slightly Behind"
      : "Behind Schedule";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">SPI (Overall)</span>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${pillClass}`}
      >
        {spi.toFixed(3)}
      </span>
      <span className="text-sm text-muted-foreground">— {statusText}</span>
    </div>
  );
}

/** Recharts S-curve line chart for the three progress series. */
export function SCurveChart({ data, cutoffDate, currentSpi }: Props) {
  const tickFormatter = (value: string) => {
    try {
      return format(parseISO(value), "MMM yy");
    } catch {
      return value;
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">S-Curve — Overall Progress</h2>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={380}>
          {/* top: 32 gives room for the "Cut-off" label above the chart area */}
          <LineChart data={data} margin={{ top: 32, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              tick={{ fontSize: 11 }}
              interval={7}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value: string) => SERIES_LABELS[value] ?? value} />
            <ReferenceLine
              x={cutoffDate}
              stroke="#6b7280"
              strokeDasharray="6 3"
              label={{ value: "Cut-off", position: "insideTopRight", fontSize: 11, fill: "#6b7280" }}
            />
            <Line
              type="monotone"
              dataKey="BASELINE_PLAN"
              stroke={SERIES_COLORS.BASELINE_PLAN}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="RECOVERY"
              stroke={SERIES_COLORS.RECOVERY}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="ACTUAL"
              stroke={SERIES_COLORS.ACTUAL}
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 border-t pt-4">
          <SpiStatus spi={currentSpi} />
        </div>
      </div>
    </div>
  );
}
