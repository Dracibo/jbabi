"use client";

import { Bar } from "react-chartjs-2";
import { ensureChartRegistered } from "./chart-defaults";
import { formatFcfa, formatNumber } from "@/lib/utils";

ensureChartRegistered();

type Props = {
  labels: string[];
  values: number[];
  colors?: string | string[];
  horizontal?: boolean;
  format?: "number" | "fcfa";
  unit?: string;
};

export function BarChart({ labels, values, colors = "#F5A742", horizontal, format = "number", unit }: Props) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: Array.isArray(colors) ? colors : colors,
            borderRadius: 6,
            barThickness: horizontal ? 18 : 22,
          },
        ],
      }}
      options={{
        indexAxis: horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: !horizontal ? false : true, color: "#EFEBE1" }, border: { display: false }, ticks: { color: "#9AA0AA" } },
          y: {
            grid: { display: horizontal ? false : true, color: "#EFEBE1" },
            border: { display: false },
            ticks: {
              color: horizontal ? "#1B4965" : "#9AA0AA",
              font: horizontal ? { weight: 500 } : undefined,
              callback: (v) => {
                if (horizontal) return undefined as unknown as string;
                return format === "fcfa" ? formatFcfa(Number(v)) : formatNumber(Number(v));
              },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = horizontal ? Number(ctx.parsed.x) : Number(ctx.parsed.y);
                if (format === "fcfa") return ` ${formatFcfa(v)}`;
                return ` ${formatNumber(v)}${unit ? ` ${unit}` : ""}`;
              },
            },
          },
        },
      }}
    />
  );
}
