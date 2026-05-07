"use client";

import { Line } from "react-chartjs-2";
import { ensureChartRegistered, lineGradient, ZOOM_OPTIONS } from "./chart-defaults";
import { formatFcfa, formatNumber } from "@/lib/utils";

ensureChartRegistered();

type Props = {
  labels: string[];
  values: number[];
  color: string;
  format: "number" | "fcfa";
  unitSuffix?: string;
};

export function AreaChart({ labels, values, color, format, unitSuffix }: Props) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            data: values,
            borderColor: color,
            backgroundColor: (c) => {
              const { ctx, chartArea } = c.chart;
              if (!chartArea) return undefined as unknown as CanvasGradient;
              return lineGradient(ctx, chartArea, color);
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2.2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 10, color: "#9AA0AA" } },
          y: {
            grid: { color: "#EFEBE1" },
            border: { display: false },
            ticks: {
              color: "#9AA0AA",
              callback: (v) => (format === "fcfa" ? formatFcfa(Number(v)) : formatNumber(Number(v))),
            },
          },
        },
        plugins: {
          legend: { display: false },
          zoom: ZOOM_OPTIONS,
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = Number(ctx.parsed.y);
                return ` ${format === "fcfa" ? formatFcfa(v) : formatNumber(v)}${unitSuffix ?? ""}`;
              },
            },
          },
        },
      }}
    />
  );
}
