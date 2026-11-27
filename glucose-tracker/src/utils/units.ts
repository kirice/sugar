import type { Units } from '../types';

/** Каноническая единица хранения — ммоль/л. */
export const MMOL_TO_MGDL = 18.0182;

export function mmolToDisplay(valueMmol: number, units: Units): number {
  return units === 'mmol' ? valueMmol : valueMmol * MMOL_TO_MGDL;
}

export function displayToMmol(value: number, units: Units): number {
  return units === 'mmol' ? value : value / MMOL_TO_MGDL;
}

export function formatValue(valueMmol: number, units: Units): string {
  const v = mmolToDisplay(valueMmol, units);
  return units === 'mmol' ? v.toFixed(1) : String(Math.round(v));
}

export const unitLabel = (units: Units): string =>
  units === 'mmol' ? 'ммоль/л' : 'мг/дл';

/** Диапазоны для цветовой индикации (всегда в ммоль/л). */
export function valueLevel(valueMmol: number): 'low' | 'normal' | 'high' {
  if (valueMmol < 3.9) return 'low';
  if (valueMmol > 7.8) return 'high';
  return 'normal';
}

export const LEVEL_COLORS: Record<'low' | 'normal' | 'high', string> = {
  low: '#d97706', // янтарный
  normal: '#059669', // зелёный
  high: '#dc2626', // красный
};

export function levelTextClass(valueMmol: number): string {
  const l = valueLevel(valueMmol);
  return l === 'low'
    ? 'text-amber-600'
    : l === 'high'
      ? 'text-red-600'
      : 'text-emerald-600';
}
