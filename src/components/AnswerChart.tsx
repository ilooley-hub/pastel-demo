"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartSpec } from "@/lib/types";

// On-brand series palette (indigo accent → pastels + status hues).
const COLORS = ["#6e62c8", "#7fc0e8", "#2f8a63", "#b07d24"];

function formatValue(v: number, unit?: string): string {
  if (unit === "£") {
    if (Math.abs(v) >= 1000) return `£${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return `£${v.toLocaleString()}`;
  }
  if (unit === "%") return `${v}%`;
  return v.toLocaleString();
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          {p.name}: <span className="font-medium text-foreground">{formatValue(p.value, unit)}</span>
        </p>
      ))}
    </div>
  );
}

export function AnswerChart({ chart }: { chart: ChartSpec }) {
  if (!chart || chart.type === "none" || !chart.series?.length) return null;

  // Merge series into a single row-per-x dataset, preserving the first series'
  // order. Use safe index keys (sN) as dataKeys — series names can contain
  // spaces, %, or £, which break Recharts' dataKey accessor.
  const byX = new Map<string, Record<string, string | number>>();
  const order: string[] = [];
  for (let i = 0; i < chart.series.length; i++) {
    for (const p of chart.series[i].points) {
      if (!byX.has(p.x)) {
        byX.set(p.x, { x: p.x });
        order.push(p.x);
      }
      byX.get(p.x)![`s${i}`] = p.y;
    }
  }
  const data = order.map((x) => byX.get(x)!);

  const axisProps = {
    tick: { fontSize: 11, fill: "#84826f" },
    tickLine: false,
    axisLine: { stroke: "#e7e3d6" },
  } as const;

  return (
    <figure className="mt-4">
      {chart.title && (
        <figcaption className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
          {chart.title}
        </figcaption>
      )}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "bar" ? (
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e3d6" vertical={false} />
              <XAxis dataKey="x" {...axisProps} interval="preserveStartEnd" />
              <YAxis
                {...axisProps}
                width={48}
                tickFormatter={(v: number) => formatValue(v, chart.unit)}
              />
              <Tooltip
                content={<CustomTooltip unit={chart.unit} />}
                cursor={{ fill: "rgba(110,98,200,0.08)" }}
              />
              {chart.series.map((s, i) => (
                <Bar
                  key={i}
                  dataKey={`s${i}`}
                  name={s.name}
                  fill={COLORS[i % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e3d6" vertical={false} />
              <XAxis dataKey="x" {...axisProps} interval="preserveStartEnd" />
              <YAxis
                {...axisProps}
                width={48}
                tickFormatter={(v: number) => formatValue(v, chart.unit)}
              />
              <Tooltip content={<CustomTooltip unit={chart.unit} />} />
              {chart.series.map((s, i) => (
                <Line
                  key={i}
                  type="monotone"
                  dataKey={`s${i}`}
                  name={s.name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: COLORS[i % COLORS.length] }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
