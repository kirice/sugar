import type { GlucoseMeasurement, LegacyRecord } from '../types';
import { LEGACY_TAG_TO_CONTEXT } from '../types';

const LEGACY_KEY = 'sugar_diary_v1';

/** Чтение записей старого дневника из LocalStorage. */
export function readLegacyRecords(): LegacyRecord[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r: LegacyRecord) =>
        r && typeof r.value === 'number' && typeof r.datetime === 'string',
    );
  } catch {
    return [];
  }
}

export function hasLegacyData(): boolean {
  return readLegacyRecords().length > 0;
}

/** Конвертация старой записи в формат нового приложения. */
export function legacyToMeasurementInput(r: LegacyRecord) {
  return {
    value_mmol: r.value,
    measured_at: new Date(r.datetime).toISOString(),
    context: LEGACY_TAG_TO_CONTEXT[r.tag] ?? ('other' as const),
    comment: null,
  };
}

/** Защита от повторного импорта: сравнение по времени и значению. */
export function filterNewLegacy(
  legacy: LegacyRecord[],
  existing: GlucoseMeasurement[],
): LegacyRecord[] {
  const seen = new Set(
    existing.map((m) => `${new Date(m.measured_at).getTime()}|${m.value_mmol}`),
  );
  return legacy.filter(
    (r) => !seen.has(`${new Date(r.datetime).getTime()}|${r.value}`),
  );
}
