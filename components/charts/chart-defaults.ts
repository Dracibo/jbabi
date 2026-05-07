"use client";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Tooltip, Legend, Filler, type ChartArea,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

let registered = false;
export function ensureChartRegistered() {
  if (registered) return;
  ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    ArcElement, Tooltip, Legend, Filler, zoomPlugin,
  );
  ChartJS.defaults.font.family = '"Plus Jakarta Sans", system-ui, sans-serif';
  ChartJS.defaults.color = "#6B7280";
  ChartJS.defaults.plugins.tooltip.backgroundColor = "#1B4965";
  ChartJS.defaults.plugins.tooltip.titleColor = "#fff";
  ChartJS.defaults.plugins.tooltip.bodyColor = "#fff";
  ChartJS.defaults.plugins.tooltip.padding = 10;
  ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
  ChartJS.defaults.plugins.tooltip.boxPadding = 6;
  registered = true;
}

export function lineGradient(ctx: CanvasRenderingContext2D, area: ChartArea, hex: string) {
  const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  g.addColorStop(0, hex + "40");
  g.addColorStop(1, hex + "00");
  return g;
}

export const ZOOM_OPTIONS = {
  zoom: {
    wheel: { enabled: true, modifierKey: "ctrl" as const },
    pinch: { enabled: true },
    drag: { enabled: false },
    mode: "x" as const,
  },
  pan: { enabled: true, mode: "x" as const, modifierKey: "shift" as const },
  limits: { x: { minRange: 3 } },
};
