import { PageHeader } from "@/components/dashboard/page-header";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { getDeliveryRowsSafe } from "@/lib/sheets/fetch";
import { DataError } from "@/components/dashboard/data-error";
import { computeDaily, computeKpi, filterByPeriod, pctChange } from "@/lib/aggregate";
import { periodCache, resolvePeriod, periodToLabel } from "@/lib/period-search-params";
import { formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function DeliveriesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const parsed = periodCache.parse(searchParams);
  const period = resolvePeriod(parsed);

  const { rows, error: dataError } = await getDeliveryRowsSafe();
  const filtered = filterByPeriod(rows, period);
  const kpi = computeKpi(rows, period, rows);
  const daily = computeDaily(rows, period, parsed.gran);

  const days = Math.max(daily.length, 1);
  const moyJour = kpi.livraisons / days;
  const meilleurJour = daily.reduce((m, d) => (d.livraisons > m ? d.livraisons : m), 0);

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  const weekdayDays = [0, 0, 0, 0, 0, 0, 0];
  for (const r of filtered) {
    const idx = (r.date.getDay() + 6) % 7;
    weekdayCounts[idx] += r.nbLivraisons;
    weekdayDays[idx] += 1;
  }
  const weekdayAvg = weekdayCounts.map((c, i) => (weekdayDays[i] > 0 ? c / weekdayDays[i] : 0));

  return (
    <>
      <PageHeader title="Livraisons" subtitle={`Évolution ${parsed.gran === "day" ? "quotidienne" : parsed.gran === "week" ? "hebdomadaire" : "mensuelle"} · ${periodToLabel(period, parsed.preset)}`} />
      <div className="mb-6"><PeriodSelector /></div>
      {dataError ? <DataError message={dataError} /> : null}

      <section className="card p-6 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Évolution des livraisons</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{periodToLabel(period, parsed.preset)}</p>
          </div>
          <span className="badge b-blue">Moy. {moyJour.toFixed(1)} / {parsed.gran === "day" ? "jour" : parsed.gran === "week" ? "sem." : "mois"}</span>
        </div>
        <div className="h-[320px]">
          <AreaChart
            labels={daily.map((d) => d.label)}
            values={daily.map((d) => d.livraisons)}
            color="#1B4965"
            format="number"
            unitSuffix=" livraisons"
          />
        </div>
        <p className="text-[11px] mt-3" style={{ color: "var(--muted-2)" }}>Ctrl + molette pour zoomer · Maj + glisser pour déplacer</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Total période</p>
          <p className="num text-[24px] font-medium mt-2" style={{ color: "var(--navy)" }}>{formatNumber(kpi.livraisons)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>livraisons</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Moyenne / {parsed.gran === "day" ? "jour" : parsed.gran === "week" ? "semaine" : "mois"}</p>
          <p className="num text-[24px] font-medium mt-2" style={{ color: "var(--navy)" }}>{moyJour.toFixed(1)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Meilleur</p>
          <p className="num text-[24px] font-medium mt-2" style={{ color: "var(--navy)" }}>{meilleurJour}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>record sur la période</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Évolution</p>
          <p className="num text-[24px] font-medium mt-2" style={{ color: pctChange(kpi.livraisons, kpi.livraisonsPrev) >= 0 ? "#10B981" : "#EF4444" }}>
            {formatPercent(pctChange(kpi.livraisons, kpi.livraisonsPrev))}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>vs période précédente</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Livraisons par jour de semaine</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Moyenne sur la période</p>
          <div className="h-[240px] mt-4">
            <BarChart labels={WEEKDAY_LABELS} values={weekdayAvg.map((v) => +v.toFixed(1))} colors="#F5A742" unit="livraisons" />
          </div>
        </div>
      </div>
    </>
  );
}
