"use client";

import { Doughnut } from "react-chartjs-2";
import { ensureChartRegistered } from "./chart-defaults";
import { formatFcfa } from "@/lib/utils";

ensureChartRegistered();

type Props = {
  labels: string[];
  values: number[];
  colors: string[];
  format?: "fcfa" | "raw";
};

export function DonutChart({ labels, values, colors, format = "fcfa" }: Props) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: "#fff",
            borderWidth: 4,
            hoverOffset: 6,
          },
        ],
      }}
      options={{
        cutout: "70%",
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = Number(ctx.parsed);
                return ` ${ctx.label}: ${format === "fcfa" ? formatFcfa(v) : v}`;
              },
            },
          },
        },
      }}
    />
  );
}
