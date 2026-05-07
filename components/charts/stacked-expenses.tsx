"use client";

import { Bar } from "react-chartjs-2";
import { ensureChartRegistered, ZOOM_OPTIONS } from "./chart-defaults";
import { formatFcfa } from "@/lib/utils";
import type { DailyPoint } from "@/lib/types";

ensureChartRegistered();

export function StackedExpensesChart({ data }: { data: DailyPoint[] }) {
  return (
    <Bar
      data={{
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Carburant",
            data: data.map((d) => d.carburant),
            backgroundColor: "#F5A742",
            borderRadius: 6, barThickness: 14, stack: "a",
          },
          {
            label: "Réparation",
            data: data.map((d) => d.reparation),
            backgroundColor: "#1B4965",
            borderRadius: 6, barThickness: 14, stack: "a",
          },
          {
            label: "Autres",
            data: data.map((d) => d.autres),
            backgroundColor: "#F59E0B",
            borderRadius: 6, barThickness: 14, stack: "a",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: "#9AA0AA", maxTicksLimit: 12 } },
          y: { stacked: true, grid: { color: "#EFEBE1" }, border: { display: false }, ticks: { color: "#9AA0AA", callback: (v) => formatFcfa(Number(v)) } },
        },
        plugins: {
          legend: { display: false },
          zoom: ZOOM_OPTIONS,
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatFcfa(Number(ctx.parsed.y))}`,
            },
          },
        },
      }}
    />
  );
}
