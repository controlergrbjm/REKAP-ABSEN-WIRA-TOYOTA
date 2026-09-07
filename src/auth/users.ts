// Hardcoded user accounts for the WIRA Toyota Attendance App
// In production, this should be backed by a proper auth backend (e.g., Supabase Auth)

export type UserRole = 'service_manager' | 'staff_digitalisasi' | 'operation_leader';

export interface AppUser {
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
  roleLabel: string;
  avatar: string; // initials
  color: string;  // avatar bg color
}

export const APP_USERS: AppUser[] = [
  {
    username: 'HENDRI',
    password: 'BISMILLAH',
    displayName: 'Hendri',
    role: 'service_manager',
    roleLabel: 'Service Manager',
    avatar: 'H',
    color: '#C00000',
  },
  {
    username: 'SURYA PALOH',
    password: '1',
    displayName: 'Surya Paloh',
    role: 'staff_digitalisasi',
    roleLabel: 'Staff Digitalisasi',
    avatar: 'SP',
    color: '#1D4ED8',
  },
  {
    username: 'RIZKY',
    password: '1',
    displayName: 'Rizky',
    role: 'operation_leader',
    roleLabel: 'Operation Leader',
    avatar: 'R',
    color: '#7C3AED',
  },
  {
    username: 'LEADER',
    password: '1',
    displayName: 'Rizky',
    role: 'operation_leader',
    roleLabel: 'Operation Leader',
    avatar: 'R',
    color: '#7C3AED',
  },
];

const SESSION_KEY = 'wira_session_user';

export function authenticate(username: string, password: string): AppUser | null {
  const user = APP_USERS.find(
    u =>
      u.username.toLowerCase() === username.trim().toLowerCase() &&
      u.password === password.trim()
  );
  return user || null;
}

export function saveSession(user: AppUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
