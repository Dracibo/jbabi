import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFcfa(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.round(n)).toLocaleString("fr-FR").replace(/ | /g, " ");
  return `${sign}${abs.replace(/ /g, " ")} F`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ").replace(/ /g, " ");
}

export function formatPercent(n: number, withSign = true): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(0)}%`;
}

export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}
