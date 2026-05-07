import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CombinedChart } from "@/components/charts/combined-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { DataError } from "@/components/dashboard/data-error";
import { getDeliveryRowsSafe } from "@/lib/sheets/fetch";
import { computeKpi, computeDaily, pctChange } from "@/lib/aggregate";
import { periodCache, resolvePeriod, periodToLabel } from "@/lib/period-search-params";
import { formatFcfa, formatNumber } from "@/lib/utils";
import { Bike, Wallet, Calculator } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OverviewPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const parsed = periodCache.parse(searchParams);
  const period = resolvePeriod(parsed);

  const { rows, error: dataError } = await getDeliveryRowsSafe();

  const kpi = computeKpi(rows, period, rows);
  const daily = computeDaily(rows, period, parsed.gran);

  return (
    <>
      <PageHeader title="Vue d'ensemble" subtitle={`Période : ${periodToLabel(period, parsed.preset)}`} />

      <div className="mb-6">
        <PeriodSelector />
      </div>

      {dataError ? <DataError message={dataError} /> : null}

      <section className="kpi-grid grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <KpiCard
          label="Livraisons"
          value={formatNumber(kpi.livraisons)}
          unit="livraisons"
          delta={pctChange(kpi.livraisons, kpi.livraisonsPrev)}
          icon={<Bike size={20} strokeWidth={1.6} color="#1B4965" />}
        />
        <KpiCard
          label="Recettes nettes"
          value={formatFcfa(kpi.recettes).replace(" F", "")}
          unit="F"
          delta={pctChange(kpi.recettes, kpi.recettesPrev)}
          highlight
          icon={<Wallet size={20} strokeWidth={1.6} color="#1B4965" />}
        />
        <KpiCard
          label="Coût par livraison"
          value={formatNumber(kpi.coutParLivraison)}
          unit="F"
          delta={pctChange(kpi.coutParLivraison, kpi.coutParLivraisonPrev)}
          deltaInversed
          icon={<Calculator size={20} strokeWidth={1.6} color="#1B4965" />}
        />
      </section>

      <section className="card p-4 sm:p-6 mb-4 sm:mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Évolution combinée</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Recettes, dépenses et livraisons · {periodToLabel(period, parsed.preset)}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-2"><span className="legend-dot" style={{ background: "#10B981" }} />Recettes</span>
            <span className="flex items-center gap-2"><span className="legend-dot" style={{ background: "#EF4444" }} />Dépenses</span>
            <span className="flex items-center gap-2"><span className="legend-dot" style={{ background: "#1B4965" }} />Livraisons</span>
          </div>
        </div>
        <div className="chart-scroll-x">
          <div className="h-[240px] sm:h-[320px]"><CombinedChart data={daily} /></div>
        </div>
        <p className="text-[11px] mt-3" style={{ color: "var(--muted-2)" }}>
          Astuce : Ctrl + molette pour zoomer, Maj + glisser pour déplacer.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Livraisons</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Évolution sur la période</p>
            </div>
          </div>
          <div className="chart-scroll-x mt-4">
            <div className="h-[200px] sm:h-[220px]">
              <AreaChart
                labels={daily.map((d) => d.label)}
                values={daily.map((d) => d.livraisons)}
                color="#1B4965"
                format="number"
                unitSuffix=" livraisons"
              />
            </div>
          </div>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>Dépenses</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Évolution sur la période</p>
            </div>
          </div>
          <div className="chart-scroll-x mt-4">
            <div className="h-[200px] sm:h-[220px]">
              <AreaChart
                labels={daily.map((d) => d.label)}
                values={daily.map((d) => d.depenses)}
                color="#F5A742"
                format="fcfa"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Link href="/depenses" className="shortcut card p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Approfondir</p>
              <p className="text-[15px] font-medium mt-1" style={{ color: "var(--navy)" }}>Analyse des dépenses</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Répartition Carburant / Réparation / Autres</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </div>
        </Link>
        <Link href="/livreurs" className="shortcut card p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Comparer</p>
              <p className="text-[15px] font-medium mt-1" style={{ color: "var(--navy)" }}>Performance des livreurs</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Classement et tendances</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </div>
        </Link>
        <Link href="/historique" className="shortcut card p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Détail</p>
              <p className="text-[15px] font-medium mt-1" style={{ color: "var(--navy)" }}>Historique complet</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Toutes les saisies de la période</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </div>
        </Link>
      </section>
    </>
  );
}
