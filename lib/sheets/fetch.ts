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

export const getDeliveryRows = cache(
  async () => fetchRows(),
  ["jbabi-deliveries"],
  { revalidate: 60, tags: ["deliveries"] },
);
