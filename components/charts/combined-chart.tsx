"use client";

import { Chart } from "react-chartjs-2";
import { ensureChartRegistered, ZOOM_OPTIONS } from "./chart-defaults";
import type { DailyPoint } from "@/lib/types";
import { formatFcfa } from "@/lib/utils";

ensureChartRegistered();

export function CombinedChart({ data }: { data: DailyPoint[] }) {
  const labels = data.map((d) => d.label);
  return (
    <Chart
      type="bar"
      data={{
        labels,
        datasets: [
          {
            type: "bar" as const,
            label: "Livraisons",
            data: data.map((d) => d.livraisons),
            backgroundColor: "rgba(27,73,101,0.18)",
            borderRadius: 4,
            barThickness: 6,
            yAxisID: "y2",
            order: 3,
          },
          {
            type: "line" as const,
            label: "Chiffre d'affaires",
            data: data.map((d) => d.chiffreAffaires),
            borderColor: "#10B981",
            backgroundColor: "rgba(16,185,129,0.08)",
            fill: true,
            tension: 0.4,
            borderWidth: 2.2,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: "y",
            order: 1,
          },
          {
            type: "line" as const,
            label: "Dépenses",
            data: data.map((d) => d.depenses),
            borderColor: "#EF4444",
            backgroundColor: "rgba(239,68,68,0.05)",
            fill: true,
            tension: 0.4,
            borderWidth: 2.2,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: "y",
            order: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 12, color: "#9AA0AA" } },
          y: {
            position: "left",
            grid: { color: "#EFEBE1" },
            border: { display: false },
            ticks: { color: "#9AA0AA", callback: (v) => formatFcfa(Number(v)) },
            title: { display: true, text: "CA / Dépenses", color: "#9AA0AA", font: { size: 10 } },
          },
          y2: {
            position: "right",
            grid: { display: false },
            border: { display: false },
            ticks: { color: "#9AA0AA" },
            title: { display: true, text: "Livraisons", color: "#9AA0AA", font: { size: 10 } },
          },
        },
        plugins: {
          legend: { display: false },
          zoom: ZOOM_OPTIONS,
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.label === "Livraisons") return ` ${ctx.parsed.y} livraisons`;
                return ` ${ctx.dataset.label}: ${formatFcfa(Number(ctx.parsed.y))}`;
              },
            },
          },
        },
      }}
    />
  );
}
