import { createSearchParamsCache, parseAsString, parseAsStringEnum } from "nuqs/server";
import { format, parse, isValid } from "date-fns";
import { getPresetPeriod } from "@/lib/aggregate";
import type { Granularity, Period } from "@/lib/types";

export const PRESETS = ["today", "7d", "30d", "month", "lastmonth", "ytd", "custom"] as const;
export const GRAN = ["day", "week", "month"] as const;

export const periodSearchParams = {
  preset: parseAsStringEnum([...PRESETS]).withDefault("30d"),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  gran: parseAsStringEnum([...GRAN]).withDefault("day"),
};

export const periodCache = createSearchParamsCache(periodSearchParams);

export type ParsedPeriodSearch = {
  preset: (typeof PRESETS)[number];
  from: string;
  to: string;
  gran: Granularity;
};

export function resolvePeriod(input: ParsedPeriodSearch, ref = new Date()): Period {
  if (input.preset === "custom" && input.from && input.to) {
    const f = parse(input.from, "yyyy-MM-dd", new Date());
    const t = parse(input.to, "yyyy-MM-dd", new Date());
    if (isValid(f) && isValid(t)) {
      const [a, b] = f <= t ? [f, t] : [t, f];
      return { from: new Date(a.setHours(0, 0, 0, 0)), to: new Date(b.setHours(23, 59, 59, 999)) };
    }
  }
  return getPresetPeriod(input.preset === "custom" ? "30d" : input.preset, ref);
}

export function periodToLabel(p: Period, preset: string): string {
  const labels: Record<string, string> = {
    today: "Aujourd'hui",
    "7d": "7 derniers jours",
    "30d": "30 derniers jours",
    month: "Ce mois",
    lastmonth: "Mois dernier",
    ytd: "Cette année",
    custom: `${format(p.from, "dd/MM/yyyy")} – ${format(p.to, "dd/MM/yyyy")}`,
  };
  return labels[preset] ?? labels["30d"];
}
