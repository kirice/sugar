import { createContext, useContext } from 'react';
import type { GlucoseMeasurement, Profile, Units } from '../types';

export interface MeasurementsContextValue {
  records: GlucoseMeasurement[];
  loading: boolean;
  error: string | null;
  /** Единицы отображения: из профиля пользователя или переопределение в демо. */
  units: Units;
  setUnits: (u: Units) => void;
  profile: Profile | null;
  refresh: () => Promise<void>;
  addRecord: (input: {
    value_mmol: number;
    measured_at: string;
    context: GlucoseMeasurement['context'];
    comment: string | null;
  }) => Promise<void>;
  editRecord: (
    id: string,
    input: {
      value_mmol: number;
      measured_at: string;
      context: GlucoseMeasurement['context'];
      comment: string | null;
    },
  ) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  importLegacy: () => Promise<number>;
}

export const MeasurementsContext = createContext<MeasurementsContextValue | null>(null);

export function useMeasurements(): MeasurementsContextValue {
  const ctx = useContext(MeasurementsContext);
  if (!ctx) throw new Error('useMeasurements должен использоваться внутри провайдера');
  return ctx;
}
