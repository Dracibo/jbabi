import { type DeliveryRow } from "@/lib/types";

const FRENCH_MONTHS: Record<string, number> = {
  janv: 0, jan: 0, janvier: 0,
  févr: 1, fev: 1, fevrier: 1, février: 1,
  mars: 2, mar: 2,
  avril: 3, avr: 3,
  mai: 4,
  juin: 5,
  juil: 6, juillet: 6,
  août: 7, aout: 7,
  sept: 8, septembre: 8,
  oct: 9, octobre: 9,
  nov: 10, novembre: 10,
  déc: 11, dec: 11, décembre: 11, decembre: 11,
};

function parseFrenchDate(raw: string): Date | null {
  const cleaned = raw.trim().toLowerCase().replace(/\./g, "");
  // dd/mm/yyyy ou dd-mm-yyyy
  const slash = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slash) {
    const [, d, m, y] = slash;
    const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
    return new Date(year, parseInt(m, 10) - 1, parseInt(d, 10));
  }
  // "1 janvier 2026" ou "01 janv 2026"
  const text = cleaned.match(/^(\d{1,2})\s+([a-zéûôîç]+)\s+(\d{2,4})$/);
  if (text) {
    const [, d, mraw, y] = text;
    const monthKey = mraw.replace(/[^a-z]/g, "").slice(0, 5);
    const month = FRENCH_MONTHS[monthKey] ?? FRENCH_MONTHS[mraw];
    if (month === undefined) return null;
    const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
    return new Date(year, month, parseInt(d, 10));
  }
  // ISO yyyy-mm-dd
  const iso = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }
  // Sheets serial number export
  const num = parseFloat(cleaned);
  if (!isNaN(num) && num > 25000 && num < 80000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + num * 86400000);
  }
  const fallback = new Date(raw);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function parseNumber(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/ /g, "").replace(/\s/g, "").replace(/F$/i, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

const NOISE_PATTERNS = [
  /^date$/i,
  /^nom\s+du\s+livreur$/i,
  /^livraison\s+par\s+mois/i,
  /^mois\s+de/i,
  /^mois\s+d['']/i,
  /^total/i,
];

function isNoise(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  return NOISE_PATTERNS.some((p) => p.test(t));
}

export function parseSheetRows(values: unknown[][]): DeliveryRow[] {
  if (!values || values.length === 0) return [];

  const rows: DeliveryRow[] = [];
  // Skip the global header row (row 0) and process body rows.
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r || r.length === 0) continue;

    const rawDate = r[0];
    const livreur = (r[1] ?? "").toString().trim();

    // Decoration / divider rows: any cell A or B that is empty, or contains
    // a known noise pattern ("MOIS DE JANVIER", repeated headers, totals, …).
    if (rawDate === null || rawDate === undefined || rawDate === "") continue;
    if (!livreur) continue;
    if (typeof rawDate === "string" && isNoise(rawDate)) continue;
    if (isNoise(livreur)) continue;

    const date =
      rawDate instanceof Date
        ? rawDate
        : typeof rawDate === "string"
          ? parseFrenchDate(rawDate)
          : typeof rawDate === "number"
            ? parseFrenchDate(String(rawDate))
            : null;
    if (!date) continue;

    rows.push({
      date,
      livreur: livreur.toUpperCase(),
      soldeInitial: parseNumber(r[2]),
      nbLivraisons: Math.round(parseNumber(r[3])),
      montantTotal: parseNumber(r[4]),
      carburant: parseNumber(r[5]),
      reparation: parseNumber(r[6]),
      autresDepenses: parseNumber(r[7]),
      totalDepenses: parseNumber(r[8]),
      recetteNette: parseNumber(r[9]),
      nouveauSolde: parseNumber(r[10]),
      observation: r[11] ? String(r[11]) : undefined,
    });
  }
  return rows.sort((a, b) => a.date.getTime() - b.date.getTime());
}
