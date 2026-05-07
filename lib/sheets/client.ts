import { google } from "googleapis";

let cached: ReturnType<typeof google.sheets> | null = null;

export function getSheetsClient() {
  if (cached) return cached;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL ou GOOGLE_PRIVATE_KEY manquant. Configure les variables d'environnement.",
    );
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  cached = google.sheets({ version: "v4", auth });
  return cached;
}

export function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID manquant.");
  return id;
}

export function getSheetRange(): string {
  // Le nom contient un espace → quoting simple côté API.
  return process.env.GOOGLE_SHEET_RANGE || "'Suivi Journalier'!A1:L";
}
