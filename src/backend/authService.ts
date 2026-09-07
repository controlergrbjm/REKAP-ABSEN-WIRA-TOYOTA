import { supabase, isSupabaseConfigured } from './supabaseClient';
import { APP_USERS, AppUser, authenticate as localAuth, saveSession, loadSession, clearSession } from '../auth/users';
import { DbUser } from './database.types';

export { saveSession, loadSession, clearSession };
export type { AppUser };

export async function loginUser(username: string, password: string): Promise<{ user: AppUser | null; error?: string }> {
  const cleanUsername = username.trim().toUpperCase();
  const cleanPassword = password.trim();

  // 1. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', cleanUsername)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (error) {
        console.warn('[authService] Supabase auth query error, falling back to local:', error.message);
      } else if (data) {
        const dbUser = data as DbUser;
        const appUser: AppUser = {
          username: dbUser.username,
          password: cleanPassword,
          displayName: dbUser.display_name,
          role: dbUser.role,
          roleLabel: dbUser.role_label,
          avatar: dbUser.avatar,
          color: dbUser.color,
        };
        saveSession(appUser);
        return { user: appUser };
      }
    } catch (err) {
      console.warn('[authService] Supabase exception, fallback to local users:', err);
    }
  }

  // 2. Fallback to hardcoded verified users
  const fallbackUser = localAuth(cleanUsername, cleanPassword);
  if (fallbackUser) {
    saveSession(fallbackUser);
    return { user: fallbackUser };
  }

  return { user: null, error: 'Username atau Password salah.' };
}
