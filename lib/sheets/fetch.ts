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
export async function getDeliveryRowsSafe(): Promise<DeliveryRowsResult> {
  try {
    const rows = await getDeliveryRowsCached();
    return { rows, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue lors du chargement des données.";
    return { rows: [], error: message };
  }
}

/** Direct access for callers that want to handle errors themselves. */
export const getDeliveryRows = getDeliveryRowsCached;
