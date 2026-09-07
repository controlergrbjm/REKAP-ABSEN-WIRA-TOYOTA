import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// Clean url by stripping any /rest/v1 or trailing slash
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = rawKey.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 15
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface ConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  message: string;
}

/**
 * Check if the Supabase database connection is actively working
 */
export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Kredensial Supabase belum diisi di file .env (Menggunakan database lokal)',
    };
  }

  try {
    const { error } = await supabase.from('branches').select('id').limit(1);
    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        message: `Koneksi gagal: ${error.message}. Pastikan schema.sql sudah dijalankan di Supabase.`,
      };
    }
    return {
      isConfigured: true,
      isConnected: true,
      message: 'Database Supabase aktif dan terhubung dengan sukses.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isConfigured: true,
      isConnected: false,
      message: `Error koneksi: ${errorMsg}`,
    };
  }
}
