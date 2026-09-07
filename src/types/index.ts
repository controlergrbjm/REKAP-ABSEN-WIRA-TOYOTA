// Types for the attendance app

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A' | 'C' | null;

export interface Branch {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Employee {
  id: string;
  branch_id: string;
  pin: string | null;
  name: string;
  position: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceUpload {
  id: string;
  branch_id: string;
  file_name: string;
  period_month: number;
  period_year: number;
  uploaded_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string; // ISO date string YYYY-MM-DD
  status: AttendanceStatus;
  check_in: string | null;  // HH:mm:ss
  check_out: string | null; // HH:mm:ss
  source: 'auto' | 'manual';
  upload_id: string | null;
  created_at: string;
  updated_at: string;
}

// Parsed raw data from Excel
export interface ParsedEmployee {
  name: string;
  pin: string | null;
  division: string | null;
  department: string | null;
  records: ParsedDailyRecord[];
}

export interface ParsedDailyRecord {
  date: Date;
  checkIn: string | null;
  checkOut: string | null;
}

// For the rekap table UI
export interface RekapEmployee {
  employee: Employee;
  attendance: Record<string, AttendanceRecord>; // key = 'YYYY-MM-DD'
}

export interface MonthPeriod {
  month: number; // 1-12
  year: number;
}

export interface RekapStats {
  totalH: number;
  totalS: number;
  totalI: number;
  totalA: number;
  totalC: number;
  totalWorkDays: number;
}
