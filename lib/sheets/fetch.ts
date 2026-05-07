import "server-only";
import { unstable_cache as cache } from "next/cache";
import { getSheetsClient, getSheetId, getSheetRange } from "./client";
import { parseSheetRows } from "./parse";
import type { DeliveryRow } from "@/lib/types";

async function fetchRows(): Promise<DeliveryRow[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: getSheetRange(),
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const values = (res.data.values ?? []) as unknown[][];
  return parseSheetRows(values);
}

const getDeliveryRowsCached = cache(
  async () => fetchRows(),
  ["jbabi-deliveries-v2"],
  { revalidate: 60, tags: ["deliveries"] },
);

export type DeliveryRowsResult = {
  rows: DeliveryRow[];
  error: string | null;
};

/**
 * Always returns a usable result — never throws.
 * Pages call this and render either data or a "data unavailable" UI.
 */
/**
 * unstable_cache serializes values via JSON, which converts Date objects to
 * ISO strings. We revive them here so callers can rely on r.date being a real
 * Date (with .getDay(), .toISOString(), etc.).
 */
function reviveDates(rows: unknown[]): DeliveryRow[] {
  return rows
    .map((r) => {
      const row = r as DeliveryRow & { date: Date | string };
      const date = row.date instanceof Date ? row.date : new Date(row.date);
      if (isNaN(date.getTime())) return null;
      return { ...row, date } as DeliveryRow;
    })
    .filter((r): r is DeliveryRow => r !== null);
}

export async function getDeliveryRowsSafe(): Promise<DeliveryRowsResult> {
  try {
    const cached = await getDeliveryRowsCached();
    return { rows: reviveDates(cached), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue lors du chargement des données.";
    return { rows: [], error: message };
  }
}

/** Direct access for callers that want to handle errors themselves. */
export const getDeliveryRows = getDeliveryRowsCached;
