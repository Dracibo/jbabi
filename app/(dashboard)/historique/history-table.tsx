"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search } from "lucide-react";
import { cn, formatFcfa, formatNumber, initials } from "@/lib/utils";

type Row = {
  date: string;
  livreur: string;
  nbLivraisons: number;
  montantTotal: number;
  carburant: number;
  reparation: number;
  autresDepenses: number;
  totalDepenses: number;
  recetteNette: number;
  nouveauSolde: number;
  observation: string;
};

const INI_VARIANTS = ["o", "b", "g", ""];
type Filter = "all" | "positive" | "negative";

export function HistoryTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "positive" && r.recetteNette < 0) return false;
      if (filter === "negative" && r.recetteNette >= 0) return false;
      if (!needle) return true;
      return (
        r.livreur.toLowerCase().includes(needle) ||
        r.observation.toLowerCase().includes(needle) ||
        format(new Date(r.date), "dd MMMM yyyy", { locale: fr }).toLowerCase().includes(needle)
      );
    });
  }, [rows, q, filter]);

  return (
    <section className="card p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border-b hairline-soft">
        <div className="seg-scroll">
          <div className="seg" role="radiogroup" aria-label="Filtre recette">
            <button type="button" className={cn(filter === "all" && "on", "whitespace-nowrap")} onClick={() => setFilter("all")}>Toutes</button>
            <button type="button" className={cn(filter === "positive" && "on", "whitespace-nowrap")} onClick={() => setFilter("positive")}>Positive</button>
            <button type="button" className={cn(filter === "negative" && "on", "whitespace-nowrap")} onClick={() => setFilter("negative")}>Négative</button>
          </div>
        </div>
        <label className="search-bar w-full sm:w-[280px] sm:ml-auto" style={{ height: 38 }}>
          <Search size={16} strokeWidth={1.6} color="#9AA0AA" />
          <input
            placeholder="Livreur, date, observation…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Rechercher"
          />
        </label>
        <span className="text-xs sm:ml-2" style={{ color: "var(--muted)" }}>
          <span className="num">{visible.length}</span> entrée{visible.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="scroll-x scroll-hint">
        <table className="w-full" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th className="table-th">Date</th>
              <th className="table-th">Livreur</th>
              <th className="table-th text-right">Livraisons</th>
              <th className="table-th text-right">Montant</th>
              <th className="table-th text-right">Dépenses</th>
              <th className="table-th text-right">Recette nette</th>
              <th className="table-th">Observation</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td className="table-td" colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>
                  Aucune saisie.
                </td>
              </tr>
            ) : (
              visible.map((r, i) => (
                <tr key={`${r.date}-${r.livreur}-${i}`} className="row-hover">
                  <td className="table-td" style={{ color: "var(--muted)" }}>
                    {format(new Date(r.date), "dd MMM yyyy", { locale: fr })}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <span className={`ini ${INI_VARIANTS[i % INI_VARIANTS.length]}`}>{initials(r.livreur)}</span>
                      <span className="font-medium" style={{ color: "var(--navy)" }}>{r.livreur}</span>
                    </div>
                  </td>
                  <td className="table-td text-right num font-medium" style={{ color: "var(--navy)" }}>{formatNumber(r.nbLivraisons)}</td>
                  <td className="table-td text-right num" style={{ color: "var(--muted)" }}>{formatFcfa(r.montantTotal)}</td>
                  <td className="table-td text-right num" style={{ color: "var(--muted)" }}>{formatFcfa(r.totalDepenses)}</td>
                  <td className="table-td text-right num font-medium" style={{ color: r.recetteNette < 0 ? "var(--red)" : "#0E8C68" }}>
                    {formatFcfa(r.recetteNette)}
                  </td>
                  <td className="table-td text-xs" style={{ color: "var(--muted)", maxWidth: 280 }}>
                    {r.observation || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
