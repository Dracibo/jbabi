export function DataError({ message }: { message: string }) {
  return (
    <div className="card p-5 mb-6" style={{ background: "var(--red-soft)", borderColor: "#F8C9C9" }}>
      <p className="text-sm font-medium" style={{ color: "#C92626" }}>Données indisponibles</p>
      <p className="text-xs mt-1" style={{ color: "#C92626" }}>{message}</p>
      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
        Vérifie les variables d&apos;environnement Vercel : <code>GOOGLE_SHEET_ID</code>,{" "}
        <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code>, <code>GOOGLE_PRIVATE_KEY</code> doivent être présentes pour les 3 environnements (Production, Preview, Development).
      </p>
    </div>
  );
}
