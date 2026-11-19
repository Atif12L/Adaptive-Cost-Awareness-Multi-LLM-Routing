import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(val: number): string {
  if (val < 0.001) {
    return `$${val.toFixed(6)}`;
  }
  return `$${val.toFixed(4)}`;
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function formatMs(val: number): string {
  if (val >= 1000) {
    return `${(val / 1000).toFixed(2)}s`;
  }
  return `${val}ms`;
}
