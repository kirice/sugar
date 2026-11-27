import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/**
 * Инициализация Supabase отложена: если конфигурация не задана,
 * приложение работает в демо-режиме без падения на главной странице.
 * Service Role Key во фронтенде не используется никогда.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase не настроен: задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY',
      );
    }
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
