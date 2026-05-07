import { cn, formatPercent } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  unit?: string;
  delta: number;
  deltaInversed?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
};

export function KpiCard({ label, value, unit, delta, deltaInversed, highlight, icon }: Props) {
  const isPositive = deltaInversed ? delta < 0 : delta > 0;
  const isFlat = Math.round(delta * 10) === 0;
  const arrow = isFlat ? "→" : delta > 0 ? "↑" : "↓";
  const badgeClass = isFlat ? "b-blue" : isPositive ? "b-green" : "b-red";

  return (
    <div
      className={cn("card p-6 relative overflow-hidden")}
      style={highlight ? { background: "var(--orange-soft)", borderColor: "#F1D8A8" } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="stat-label" style={highlight ? { color: "#8C5A18" } : undefined}>{label}</p>
          <p className="stat-num num mt-2">
            <span>{value}</span>
            {unit ? <span className="text-[15px] font-normal align-middle ml-1" style={{ color: highlight ? "#8C5A18" : "var(--muted)" }}>{unit}</span> : null}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className={cn("badge", badgeClass)}>{arrow} {formatPercent(delta)}</span>
            <span className="text-xs" style={{ color: highlight ? "#8C5A18" : "var(--muted)" }}>vs période précédente</span>
          </div>
        </div>
        {icon ? (
          <div
            className="flex-none w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: highlight ? "#FFFFFF" : "#F1F6FA" }}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
