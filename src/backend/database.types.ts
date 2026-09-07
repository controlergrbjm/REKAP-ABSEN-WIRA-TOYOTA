// Database types matching Supabase PostgreSQL schema

export interface DbUser {
  id: string;
  username: string;
  password?: string;
  display_name: string;
  role: 'service_manager' | 'staff_digitalisasi' | 'operation_leader';
  role_label: string;
  avatar: string;
  color: string;
  created_at: string;
}

export interface DbBranch {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface DbEmployee {
  id: string;
  branch_id: string;
  pin: string | null;
  name: string;
  position: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbAttendanceUpload {
  id: string;
  branch_id: string;
  file_name: string;
  period_month: number;
  period_year: number;
  uploaded_at: string;
}

export interface DbAttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: 'H' | 'S' | 'I' | 'A' | 'C' | null;
  check_in: string | null;
  check_out: string | null;
  source: 'auto' | 'manual';
  upload_id: string | null;
  created_at: string;
  updated_at: string;
}
