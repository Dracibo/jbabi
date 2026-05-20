import {
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addDays, addWeeks, addMonths, subDays, format, isWithinInterval, differenceInCalendarDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { CourierStat, DailyPoint, DeliveryRow, Granularity, Kpi, Period } from "@/lib/types";

export function clampDay(d: Date): Date { return startOfDay(d); }

export function getPresetPeriod(preset: string, ref = new Date()): Period {
  switch (preset) {
    case "today":
      return { from: startOfDay(ref), to: endOfDay(ref) };
    case "7d":
      return { from: startOfDay(subDays(ref, 6)), to: endOfDay(ref) };
    case "30d":
      return { from: startOfDay(subDays(ref, 29)), to: endOfDay(ref) };
    case "month":
      return { from: startOfMonth(ref), to: endOfMonth(ref) };
    case "lastmonth": {
      const lm = addMonths(ref, -1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case "ytd":
      return { from: new Date(ref.getFullYear(), 0, 1), to: endOfDay(ref) };
    default:
      return { from: startOfDay(subDays(ref, 29)), to: endOfDay(ref) };
  }
}

export function previousPeriod(p: Period): Period {
  const days = differenceInCalendarDays(p.to, p.from) + 1;
  const prevTo = endOfDay(subDays(p.from, 1));
  const prevFrom = startOfDay(subDays(prevTo, days - 1));
  return { from: prevFrom, to: prevTo };
}

export function filterByPeriod(rows: DeliveryRow[], p: Period): DeliveryRow[] {
  return rows.filter((r) => isWithinInterval(r.date, { start: p.from, end: p.to }));
}

export function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export function computeKpi(rows: DeliveryRow[], p: Period, all: DeliveryRow[]): Kpi {
  const cur = filterByPeriod(rows, p);
  const prev = filterByPeriod(all, previousPeriod(p));

  const sum = (arr: DeliveryRow[], k: keyof DeliveryRow) =>
    arr.reduce((s, r) => s + (typeof r[k] === "number" ? (r[k] as number) : 0), 0);

  const livraisons = sum(cur, "nbLivraisons");
  const chiffreAffaires = sum(cur, "montantTotal");
  const recetteNette = sum(cur, "recetteNette");
  const depenses = sum(cur, "totalDepenses");
  const livraisonsPrev = sum(prev, "nbLivraisons");
  const chiffreAffairesPrev = sum(prev, "montantTotal");
  const recetteNettePrev = sum(prev, "recetteNette");
  const depensesPrev = sum(prev, "totalDepenses");

  const coutParLivraison = livraisons > 0 ? depenses / livraisons : 0;
  const coutParLivraisonPrev = livraisonsPrev > 0 ? depensesPrev / livraisonsPrev : 0;

  return {
    livraisons, livraisonsPrev,
    chiffreAffaires, chiffreAffairesPrev,
    recetteNette, recetteNettePrev,
    depenses, depensesPrev,
    coutParLivraison, coutParLivraisonPrev,
  };
}

function bucketKey(date: Date, gran: Granularity): { key: string; bucketStart: Date; label: string } {
  if (gran === "day") {
    const d = startOfDay(date);
    return { key: format(d, "yyyy-MM-dd"), bucketStart: d, label: format(d, "dd MMM", { locale: fr }) };
  }
  if (gran === "week") {
    const d = startOfWeek(date, { weekStartsOn: 1 });
    return { key: format(d, "yyyy-'W'II"), bucketStart: d, label: `S${format(d, "II")} · ${format(d, "dd MMM", { locale: fr })}` };
  }
  const d = startOfMonth(date);
  return { key: format(d, "yyyy-MM"), bucketStart: d, label: format(d, "MMM yyyy", { locale: fr }) };
}

function fillBuckets(p: Period, gran: Granularity): { key: string; bucketStart: Date; label: string }[] {
  const out: { key: string; bucketStart: Date; label: string }[] = [];
  let cursor = gran === "day" ? startOfDay(p.from)
    : gran === "week" ? startOfWeek(p.from, { weekStartsOn: 1 })
    : startOfMonth(p.from);
  const end = gran === "day" ? endOfDay(p.to)
    : gran === "week" ? endOfWeek(p.to, { weekStartsOn: 1 })
    : endOfMonth(p.to);

  while (cursor <= end) {
    out.push(bucketKey(cursor, gran));
    cursor = gran === "day" ? addDays(cursor, 1)
      : gran === "week" ? addWeeks(cursor, 1)
      : addMonths(cursor, 1);
  }
  return out;
}

export function computeDaily(rows: DeliveryRow[], p: Period, gran: Granularity): DailyPoint[] {
  const filtered = filterByPeriod(rows, p);
  const buckets = fillBuckets(p, gran);

  const map = new Map<string, DailyPoint>();
  for (const b of buckets) {
    map.set(b.key, {
      label: b.label,
      date: b.bucketStart,
      livraisons: 0,
      chiffreAffaires: 0,
      depenses: 0,
      recetteNette: 0,
      carburant: 0,
      reparation: 0,
      autres: 0,
    });
  }

  for (const r of filtered) {
    const { key } = bucketKey(r.date, gran);
    const slot = map.get(key);
    if (!slot) continue;
    slot.livraisons += r.nbLivraisons;
    slot.chiffreAffaires += r.montantTotal;
    slot.depenses += r.totalDepenses;
    slot.recetteNette += r.recetteNette;
    slot.carburant += r.carburant;
    slot.reparation += r.reparation;
    slot.autres += r.autresDepenses;
  }

  return Array.from(map.values());
}

export function computeCouriers(rows: DeliveryRow[], p: Period): CourierStat[] {
  const filtered = filterByPeriod(rows, p);
  const map = new Map<string, CourierStat>();
  for (const r of filtered) {
    const s = map.get(r.livreur) ?? { name: r.livreur, jours: 0, livraisons: 0, montant: 0, depenses: 0, recette: 0 };
    s.jours += 1;
    s.livraisons += r.nbLivraisons;
    s.montant += r.montantTotal;
    s.depenses += r.totalDepenses;
    s.recette += r.recetteNette;
    map.set(r.livreur, s);
  }
  return Array.from(map.values()).sort((a, b) => b.livraisons - a.livraisons);
}

export type ExpenseBreakdown = { carburant: number; reparation: number; autres: number; total: number };

export function computeExpenses(rows: DeliveryRow[], p: Period): ExpenseBreakdown {
  const filtered = filterByPeriod(rows, p);
  const out = { carburant: 0, reparation: 0, autres: 0, total: 0 };
  for (const r of filtered) {
    out.carburant += r.carburant;
    out.reparation += r.reparation;
    out.autres += r.autresDepenses;
    out.total += r.totalDepenses;
  }
  return out;
}
