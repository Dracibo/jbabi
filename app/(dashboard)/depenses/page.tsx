import { PageHeader } from "@/components/dashboard/page-header";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { StackedExpensesChart } from "@/components/charts/stacked-expenses";
import { DonutChart } from "@/components/charts/donut";
import { AreaChart } from "@/components/charts/area-chart";
import { getDeliveryRowsSafe } from "@/lib/sheets/fetch";
import { DataError } from "@/components/dashboard/data-error";
import { computeDaily, computeExpenses, computeKpi, pctChange } from "@/lib/aggregate";
import { periodCache, resolvePeriod, periodToLabel } from "@/lib/period-search-params";
import { formatFcfa, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpensesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const parsed = periodCache.parse(searchParams);
  const period = resolvePeriod(parsed);

  const { rows, error: dataError } = await getDeliveryRowsSafe();
  const kpi = computeKpi(rows, period, rows);
  const daily = computeDaily(rows, period, parsed.gran);
  const exp = computeExpenses(rows, period);

  const pctCarb = exp.total > 0 ? (exp.carburant / exp.total) * 100 : 0;
  const pctRep = exp.total > 0 ? (exp.reparation / exp.total) * 100 : 0;
  const pctAutres = exp.total > 0 ? (exp.autres / exp.total) * 100 : 0;
  const ratio = kpi.recettes + kpi.depenses > 0 ? (kpi.depenses / (kpi.recettes + kpi.depenses)) * 100 : 0;

  return (
    <>
      <PageHeader title="Dépenses" subtitle={`Analyse · ${periodToLabel(period, parsed.preset)}`} />
      <div className="mb-6"><PeriodSelector /></div>
      {dataError ? <DataError message={dataError} /> : null}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <div className="card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Total dépenses</p>
          <p className="num text-[22px] font-medium mt-2" style={{ color: "var(--navy)" }}>{formatFcfa(exp.total)}</p>
          <p className="text-xs mt-1" style={{ color: pctChange(kpi.depenses, kpi.depensesPrev) <= 0 ? "#0E8C68" : "#C92626" }}>
            {pctChange(kpi.depenses, kpi.depensesPrev) <= 0 ? "↓" : "↑"} {formatPercent(pctChange(kpi.depenses, kpi.depensesPrev))} vs précédent
          </p>
        </div>
        <div className="card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Part carburant</p>
          <p className="num text-[22px] font-medium mt-2" style={{ color: "var(--navy)" }}>{pctCarb.toFixed(0)}%</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{formatFcfa(exp.carburant)}</p>
        </div>
        <div className="card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Coût / livraison</p>
          <p className="num text-[22px] font-medium mt-2" style={{ color: "var(--navy)" }}>{formatFcfa(kpi.coutParLivraison)}</p>
          <p className="text-xs mt-1" style={{ color: pctChange(kpi.coutParLivraison, kpi.coutParLivraisonPrev) <= 0 ? "#0E8C68" : "#C92626" }}>
            {pctChange(kpi.coutParLivraison, kpi.coutParLivraisonPrev) <= 0 ? "↓" : "↑"} {formatPercent(pctChange(kpi.coutParLivraison, kpi.coutParLivraisonPrev))}
          </p>
        </div>
        <div className="card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Ratio dépenses</p>
          <p className="num text-[22px] font-medium mt-2" style={{ color: "var(--navy)" }}>{ratio.toFixed(0)}%</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>du chiffre absorbé</p>
        </div>
      </section>

      <section className="card p-4 sm:p-6 mb-4 sm:mb-5">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <div>
            <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Évolution des dépenses</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Empilé par catégorie</p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-2"><span className="legend-dot" style={{ background: "#F5A742" }} />Carburant</span>
            <span className="flex items-center gap-2"><span className="legend-dot" style={{ background: "#1B4965" }} />Réparation</span>
            <span className="flex items-center gap-2"><span className="legend-dot" style={{ background: "#F59E0B" }} />Autres</span>
          </div>
        </div>
        <div className="chart-scroll-x mt-4">
          <div className="h-[240px] sm:h-[320px]"><StackedExpensesChart data={daily} /></div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5">
        <div className="card p-4 sm:p-6">
          <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Répartition</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Sur la période</p>
          <div className="relative mt-6 mx-auto" style={{ maxWidth: 240, aspectRatio: "1/1" }}>
            <DonutChart
              labels={["Carburant", "Réparation", "Autres"]}
              values={[exp.carburant, exp.reparation, exp.autres]}
              colors={["#F5A742", "#1B4965", "#F59E0B"]}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Total</p>
              <p className="num text-[18px] font-medium mt-1" style={{ color: "var(--navy)" }}>{formatFcfa(exp.total)}</p>
            </div>
          </div>
          <ul className="mt-6 flex flex-col gap-4">
            <BreakdownRow label="Carburant" color="#F5A742" value={exp.carburant} share={pctCarb} />
            <BreakdownRow label="Réparation" color="#1B4965" value={exp.reparation} share={pctRep} />
            <BreakdownRow label="Autres" color="#F59E0B" value={exp.autres} share={pctAutres} />
          </ul>
        </div>

        <div className="card p-4 sm:p-6">
          <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Recettes vs Dépenses</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Marge nette sur la période</p>
          <div className="chart-scroll-x mt-4">
            <div className="h-[220px] sm:h-[260px]">
              <AreaChart
                labels={daily.map((d) => d.label)}
                values={daily.map((d) => d.recettes - d.depenses)}
                color="#10B981"
                format="fcfa"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BreakdownRow({ label, color, value, share }: { label: string; color: string; value: number; share: number }) {
  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span className="legend-dot" style={{ background: color }} />
          <span className="font-medium" style={{ color: "var(--navy)" }}>{label}</span>
        </span>
        <span className="num" style={{ color: "var(--muted)" }}>{formatFcfa(value)}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full" style={{ background: "var(--cream-2)" }}>
        <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, share))}%`, background: color }} />
      </div>
    </li>
  );
}
