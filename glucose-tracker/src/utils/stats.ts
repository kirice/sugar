import type { GlucoseMeasurement, Units } from '../types';
import { formatValue, mmolToDisplay } from './units';

export interface StatsSummary {
  count: number;
  avgMmol: number | null;
  minMmol: number | null;
  maxMmol: number | null;
}

export function summarize(records: GlucoseMeasurement[]): StatsSummary {
  if (!records.length) {
    return { count: 0, avgMmol: null, minMmol: null, maxMmol: null };
  }
  const values = records.map((r) => r.value_mmol);
  const sum = values.reduce((s, v) => s + v, 0);
  return {
    count: values.length,
    avgMmol: sum / values.length,
    minMmol: Math.min(...values),
    maxMmol: Math.max(...values),
  };
}

/** Доля записей в диапазоне [fromMmol, toMmol] (включительно-исключительно). */
export function inRangePercent(
  records: GlucoseMeasurement[],
  fromMmol: number,
  toMmol: number,
): number | null {
  if (!records.length) return null;
  const c = records.filter(
    (r) => r.value_mmol >= fromMmol && r.value_mmol < toMmol,
  ).length;
  return (c / records.length) * 100;
}

export interface ChartPoint {
  iso: string;
  value: number; // уже в отображаемых единицах
  raw: GlucoseMeasurement;
}

/** Подготовка точек для графика с конвертацией единиц (без двойной конвертации). */
export function toChartPoints(
  records: GlucoseMeasurement[],
  units: Units,
): ChartPoint[] {
  return [...records]
    .sort(
      (a, b) =>
        new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime(),
    )
    .map((raw) => ({
      iso: raw.measured_at,
      value: Number(mmolToDisplay(raw.value_mmol, units).toFixed(units === 'mmol' ? 2 : 0)),
      raw,
    }));
}

export function formatAvg(avgMmol: number | null, units: Units): string {
  return avgMmol === null ? '—' : formatValue(avgMmol, units);
}
