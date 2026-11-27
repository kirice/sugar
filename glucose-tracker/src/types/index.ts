export type Units = 'mmol' | 'mgdl';

export type DiabetesType = 'type1' | 'type2' | null;

/** Контекст измерения. */
export type MeasurementContext =
  | 'fasting' // Натощак
  | 'before_meal' // До еды
  | 'after_meal' // После еды
  | 'before_bed' // Перед сном
  | 'night' // Ночью
  | 'other'; // Другое

export interface Profile {
  id: string;
  full_name: string | null;
  diabetes_type: DiabetesType;
  units: Units;
  updated_at?: string;
}

/** Запись в БД: значение всегда хранится в ммоль/л (каноническая единица). */
export interface GlucoseMeasurement {
  id: string;
  user_id: string;
  value_mmol: number;
  measured_at: string; // ISO строка
  context: MeasurementContext;
  comment: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Запись старого дневника из LocalStorage (ключ sugar_diary_v1). */
export interface LegacyRecord {
  id: string;
  value: number; // ммоль/л
  datetime: string; // ISO
  tag: string; // метка на русском
}

export const CONTEXT_LABELS: Record<MeasurementContext, string> = {
  fasting: 'Натощак',
  before_meal: 'До еды',
  after_meal: 'После еды',
  before_bed: 'Перед сном',
  night: 'Ночью',
  other: 'Другое',
};

export const CONTEXT_OPTIONS = Object.entries(CONTEXT_LABELS).map(
  ([value, label]) => ({ value: value as MeasurementContext, label }),
);

/** Соответствие русских меток старого дневника контекстам нового. */
export const LEGACY_TAG_TO_CONTEXT: Record<string, MeasurementContext> = {
  Натощак: 'fasting',
  'До еды': 'before_meal',
  'После еды': 'after_meal',
  'Перед сном': 'before_bed',
  Ночью: 'night',
};
