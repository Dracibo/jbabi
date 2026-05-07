"use client";

import { useQueryStates } from "nuqs";
import { parseAsString, parseAsStringEnum } from "nuqs";
import { useState, useRef, useEffect } from "react";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { DayPicker, type DateRange } from "react-day-picker";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

const PRESETS = ["today", "7d", "30d", "month", "lastmonth", "ytd", "custom"] as const;
const GRAN = ["day", "week", "month"] as const;

const PRESET_LABELS: Record<(typeof PRESETS)[number], string> = {
  today: "Aujourd'hui",
  "7d": "7 jours",
  "30d": "30 jours",
  month: "Ce mois",
  lastmonth: "Mois dernier",
  ytd: "Année",
  custom: "Personnalisé",
};

const GRAN_LABELS: Record<(typeof GRAN)[number], string> = {
  day: "Jour",
  week: "Semaine",
  month: "Mois",
};

export function PeriodSelector() {
  const [{ preset, from, to, gran }, setParams] = useQueryStates(
    {
      preset: parseAsStringEnum([...PRESETS]).withDefault("30d"),
      from: parseAsString.withDefault(""),
      to: parseAsString.withDefault(""),
      gran: parseAsStringEnum([...GRAN]).withDefault("day"),
    },
    { shallow: false },
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPickerOpen(false);
    }
    if (pickerOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [pickerOpen]);

  const range: DateRange | undefined =
    from && to
      ? {
          from: isValid(parse(from, "yyyy-MM-dd", new Date())) ? parse(from, "yyyy-MM-dd", new Date()) : undefined,
          to: isValid(parse(to, "yyyy-MM-dd", new Date())) ? parse(to, "yyyy-MM-dd", new Date()) : undefined,
        }
      : undefined;

  function applyRange(r: DateRange | undefined) {
    if (r?.from && r.to) {
      void setParams({
        preset: "custom",
        from: format(r.from, "yyyy-MM-dd"),
        to: format(r.to, "yyyy-MM-dd"),
      });
      setPickerOpen(false);
    }
  }

  function selectPreset(p: (typeof PRESETS)[number]) {
    if (p === "custom") {
      setPickerOpen(true);
      return;
    }
    void setParams({ preset: p, from: "", to: "" });
  }

  const customLabel =
    preset === "custom" && range?.from && range.to
      ? `${format(range.from, "dd/MM", { locale: fr })} – ${format(range.to, "dd/MM/yy", { locale: fr })}`
      : "Personnalisé";

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
      <div className="seg-scroll">
        <div className="seg" role="radiogroup" aria-label="Période">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={preset === p}
              className={cn(preset === p && "on", "whitespace-nowrap")}
              onClick={() => selectPreset(p)}
            >
              {p === "custom" ? customLabel : PRESET_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="seg" role="radiogroup" aria-label="Granularité">
          {GRAN.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={gran === g}
              className={cn(gran === g && "on", "whitespace-nowrap")}
              onClick={() => void setParams({ gran: g })}
            >
              {GRAN_LABELS[g]}
            </button>
          ))}
        </div>

        <div ref={ref} className="relative">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPickerOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
            aria-label="Choisir une plage de dates"
          >
            <Calendar size={16} strokeWidth={1.6} />
            <span className="hidden sm:inline">Choisir des dates</span>
            <ChevronDown size={14} strokeWidth={1.6} className="hidden sm:block" />
          </button>
          {pickerOpen ? (
            <div
              className="calendar-popup absolute mt-2 z-40 card p-3 shadow-lg sm:right-0"
              style={{ background: "#fff" }}
              role="dialog"
              aria-label="Choisir une plage de dates"
            >
              <DayPicker
                mode="range"
                numberOfMonths={2}
                locale={fr}
                defaultMonth={range?.from ?? new Date()}
                selected={range}
                onSelect={applyRange}
                weekStartsOn={1}
                showOutsideDays
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
