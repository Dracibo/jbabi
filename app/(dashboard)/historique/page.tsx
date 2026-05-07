import { PageHeader } from "@/components/dashboard/page-header";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { HistoryTable } from "./history-table";
import { getDeliveryRows } from "@/lib/sheets/fetch";
import { filterByPeriod } from "@/lib/aggregate";
import { periodCache, resolvePeriod, periodToLabel } from "@/lib/period-search-params";

export const dynamic = "force-dynamic";

export default async function HistoryPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const parsed = periodCache.parse(searchParams);
  const period = resolvePeriod(parsed);

  const rows = await getDeliveryRows().catch(() => []);
  const filtered = filterByPeriod(rows, period).slice().reverse();

  const serialized = filtered.map((r) => ({
    date: r.date.toISOString(),
    livreur: r.livreur,
    nbLivraisons: r.nbLivraisons,
    montantTotal: r.montantTotal,
    carburant: r.carburant,
    reparation: r.reparation,
    autresDepenses: r.autresDepenses,
    totalDepenses: r.totalDepenses,
    recetteNette: r.recetteNette,
    nouveauSolde: r.nouveauSolde,
    observation: r.observation ?? "",
  }));

  return (
    <>
      <PageHeader title="Historique" subtitle={`${filtered.length} saisies · ${periodToLabel(period, parsed.preset)}`} />
      <div className="mb-6"><PeriodSelector /></div>
      <HistoryTable rows={serialized} />
    </>
  );
}
