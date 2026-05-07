import { PageHeader } from "@/components/dashboard/page-header";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { BarChart } from "@/components/charts/bar-chart";
import { getDeliveryRowsSafe } from "@/lib/sheets/fetch";
import { DataError } from "@/components/dashboard/data-error";
import { computeCouriers } from "@/lib/aggregate";
import { periodCache, resolvePeriod, periodToLabel } from "@/lib/period-search-params";
import { formatFcfa, formatNumber, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PALETTE = ["#F5A742", "#1B4965", "#5FA8D3", "#F59E0B", "#FCE4B6", "#E8E5DD"];
const INI_VARIANTS = ["o", "b", "g", ""];

export default async function CouriersPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const parsed = periodCache.parse(searchParams);
  const period = resolvePeriod(parsed);

  const { rows, error: dataError } = await getDeliveryRowsSafe();
  const stats = computeCouriers(rows, period);
  const colors = stats.map((_, i) => PALETTE[i % PALETTE.length]);

  return (
    <>
      <PageHeader title="Livreurs" subtitle={`Performance individuelle · ${periodToLabel(period, parsed.preset)}`} />
      <div className="mb-6"><PeriodSelector /></div>
      {dataError ? <DataError message={dataError} /> : null}

      <section className="card p-4 sm:p-6 mb-4 sm:mb-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Classement des livreurs</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Par nombre de livraisons</p>
          </div>
        </div>
        <div className="h-[220px] sm:h-[260px] mt-4">
          {stats.length > 0 ? (
            <BarChart
              labels={stats.map((s) => s.name)}
              values={stats.map((s) => s.livraisons)}
              colors={colors}
              horizontal
              unit="livraisons"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--muted)" }}>
              Aucune saisie pour cette période.
            </div>
          )}
        </div>
      </section>

      <section className="card p-0 overflow-hidden">
        <div className="scroll-x scroll-hint">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Livreur</th>
                <th className="table-th text-right">Jours saisis</th>
                <th className="table-th text-right">Livraisons</th>
                <th className="table-th text-right">Montant total</th>
                <th className="table-th text-right">Recette nette</th>
                <th className="table-th text-right">Coût / livraison</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr><td className="table-td" colSpan={6} style={{ color: "var(--muted)", textAlign: "center" }}>Aucune donnée sur la période.</td></tr>
              ) : (
                stats.map((s, i) => (
                  <tr key={s.name} className="row-hover">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <span className={`ini ${INI_VARIANTS[i % INI_VARIANTS.length]}`}>{initials(s.name)}</span>
                        <span className="font-medium" style={{ color: "var(--navy)" }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-right" style={{ color: "var(--muted)" }}>{s.jours}</td>
                    <td className="table-td text-right num font-medium" style={{ color: "var(--navy)" }}>{formatNumber(s.livraisons)}</td>
                    <td className="table-td text-right num" style={{ color: "var(--muted)" }}>{formatFcfa(s.montant)}</td>
                    <td className="table-td text-right num font-medium" style={{ color: s.recette < 0 ? "var(--red)" : "#0E8C68" }}>
                      {formatFcfa(s.recette)}
                    </td>
                    <td className="table-td text-right num" style={{ color: "var(--muted)" }}>
                      {s.livraisons > 0 ? formatFcfa(s.depenses / s.livraisons) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
