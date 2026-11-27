import type {
  GlucoseMeasurement,
  MeasurementContext,
  Profile,
} from '../types';
import { getSupabase } from '../lib/supabase';

const TABLE = 'measurements';

export interface MeasurementInput {
  value_mmol: number;
  measured_at: string;
  context: MeasurementContext;
  comment: string | null;
}

async function getUserId(): Promise<string> {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error('Требуется авторизация');
  return data.user.id;
}

export async function fetchMeasurements(): Promise<GlucoseMeasurement[]> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('*')
    .order('measured_at', { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data ?? []) as GlucoseMeasurement[];
}

export async function createMeasurement(
  input: MeasurementInput,
): Promise<GlucoseMeasurement> {
  const userId = await getUserId();
  const { data, error } = await getSupabase()
    .from(TABLE)
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as GlucoseMeasurement;
}

export async function updateMeasurement(
  id: string,
  input: MeasurementInput,
): Promise<GlucoseMeasurement> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as GlucoseMeasurement;
}

export async function deleteMeasurement(id: string): Promise<void> {
  const { error } = await getSupabase().from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Массовый импорт (перенос из старого дневника). */
export async function importMeasurements(
  rows: MeasurementInput[],
): Promise<number> {
  if (!rows.length) return 0;
  const userId = await getUserId();
  const payload = rows.map((r) => ({ ...r, user_id: userId }));
  const { error, count } = await getSupabase()
    .from(TABLE)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(payload as any, { count: 'exact' });
  if (error) throw new Error(error.message);
  return count ?? payload.length;
}

export async function fetchProfile(): Promise<Profile | null> {
  const userId = await getUserId();
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Profile) ?? null;
}

export async function upsertProfile(
  patch: Partial<Pick<Profile, 'full_name' | 'diabetes_type' | 'units'>>,
): Promise<Profile> {
  const userId = await getUserId();
  const current = await fetchProfile();
  const next: Profile = {
    id: userId,
    full_name: patch.full_name !== undefined ? patch.full_name : current?.full_name ?? null,
    diabetes_type:
      patch.diabetes_type !== undefined ? patch.diabetes_type : current?.diabetes_type ?? null,
    units: patch.units !== undefined ? patch.units : current?.units ?? 'mmol',
  };
  const { data, error } = await getSupabase()
    .from('profiles')
    .upsert(next)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}
