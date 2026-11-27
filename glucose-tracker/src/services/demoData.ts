import type { GlucoseMeasurement, MeasurementContext } from '../types';

/**
 * Демо-данные для главной страницы и демо-режима.
 * Явно помечаются как демонстрационные — это НЕ реальные медицинские данные.
 */

const ctxList: MeasurementContext[] = [
  'fasting',
  'before_meal',
  'after_meal',
  'before_bed',
  'night',
];

/** Детерминированный псевдослучайный генератор (стабильные демо-графики). */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDemoRecords(days = 30): GlucoseMeasurement[] {
  const rnd = mulberry32(20260101);
  const out: GlucoseMeasurement[] = [];
  const now = new Date();
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    // 3–5 измерений в день
    const perDay = 3 + Math.floor(rnd() * 3);
    const times = [7, 9, 13, 20, 2].sort(() => rnd() - 0.5).slice(0, perDay);
    for (const hour of times) {
      const dt = new Date(day);
      dt.setHours(hour, Math.floor(rnd() * 60), 0, 0);
      if (dt.getTime() > now.getTime()) continue;
      let context: MeasurementContext = 'other';
      if (hour < 6) context = 'night';
      else if (hour < 9) context = 'fasting';
      else if (hour < 12) context = 'before_meal';
      else if (hour < 17) context = 'after_meal';
      else context = rnd() > 0.5 ? 'before_bed' : 'after_meal';
      const base = context === 'fasting' || context === 'night' ? 5.6 : 7.2;
      const value = base + (rnd() - 0.5) * 3.2;
      out.push({
        id: `demo-${dt.getTime()}-${Math.floor(rnd() * 1e6)}`,
        user_id: 'demo-user',
        value_mmol: Number(Math.max(3.2, Math.min(11.5, value)).toFixed(1)),
        measured_at: dt.toISOString(),
        context,
        comment: null,
      });
    }
  }
  return out.sort(
    (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime(),
  );
}

export const DEMO_MEASUREMENTS: GlucoseMeasurement[] = generateDemoRecords(30);

const DEMO_KEY = 'glucose_tracker_demo_v1';

/** Хранилище демо-режима (LocalStorage, только с явного ведома пользователя). */
export const demoStorage = {
  load(): GlucoseMeasurement[] {
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      if (!raw) return DEMO_MEASUREMENTS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as GlucoseMeasurement[]) : DEMO_MEASUREMENTS;
    } catch {
      return DEMO_MEASUREMENTS;
    }
  },
  save(records: GlucoseMeasurement[]) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(records));
  },
  reset() {
    localStorage.removeItem(DEMO_KEY);
  },
};
