/**
 * localStorage-based store as fallback when Supabase is not configured.
 * This mirrors the Supabase schema but persists data in browser storage.
 */

import { Branch, Employee, AttendanceRecord, AttendanceUpload } from '../types';

const KEYS = {
  branches: 'wira_branches',
  employees: 'wira_employees',
  records: 'wira_records',
  uploads: 'wira_uploads',
};

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Branches ──────────────────────────────────────────────────────────────

export function getBranches(): Branch[] {
  const branches = load<Branch>(KEYS.branches);
  if (branches.length === 0) {
    // Seed default branch
    const defaultBranch: Branch = {
      id: generateId(),
      name: 'WIRA MEGAH BANJARMASIN',
      code: 'GR BJM',
      created_at: now(),
    };
    save(KEYS.branches, [defaultBranch]);
    return [defaultBranch];
  }
  return branches;
}

export function saveBranch(branch: Omit<Branch, 'id' | 'created_at'>): Branch {
  const branches = load<Branch>(KEYS.branches);
  const newBranch: Branch = { ...branch, id: generateId(), created_at: now() };
  branches.push(newBranch);
  save(KEYS.branches, branches);
  return newBranch;
}

export function updateBranch(id: string, updates: Partial<Branch>): Branch | null {
  const branches = load<Branch>(KEYS.branches);
  const idx = branches.findIndex(b => b.id === id);
  if (idx === -1) return null;
  branches[idx] = { ...branches[idx], ...updates };
  save(KEYS.branches, branches);
  return branches[idx];
}

export function deleteBranch(id: string): void {
  const branches = load<Branch>(KEYS.branches).filter(b => b.id !== id);
  save(KEYS.branches, branches);
}

// ─── Employees ─────────────────────────────────────────────────────────────

export function getEmployees(branchId?: string): Employee[] {
  const employees = load<Employee>(KEYS.employees);
  const filtered = branchId ? employees.filter(e => e.branch_id === branchId) : employees;
  return filtered.sort((a, b) => a.sort_order - b.sort_order);
}

export function getEmployeeByPin(pin: string, branchId: string): Employee | null {
  return load<Employee>(KEYS.employees).find(
    e => e.pin === pin && e.branch_id === branchId
  ) ?? null;
}

export function getEmployeeByName(name: string, branchId: string): Employee | null {
  const lower = name.toLowerCase().trim();
  return load<Employee>(KEYS.employees).find(
    e => e.name.toLowerCase().trim() === lower && e.branch_id === branchId
  ) ?? null;
}

export function upsertEmployee(
  branchId: string,
  pin: string | null,
  name: string,
): Employee {
  const employees = load<Employee>(KEYS.employees);

  // Try match by PIN first, then name
  let existing: Employee | undefined;
  if (pin) {
    existing = employees.find(e => e.pin === pin && e.branch_id === branchId);
  }
  if (!existing) {
    const lower = name.toLowerCase().trim();
    existing = employees.find(
      e => e.name.toLowerCase().trim() === lower && e.branch_id === branchId
    );
  }

  if (existing) return existing;

  const maxOrder = employees.reduce((max, e) => Math.max(max, e.sort_order), 0);
  const newEmployee: Employee = {
    id: generateId(),
    branch_id: branchId,
    pin,
    name,
    position: null,
    sort_order: maxOrder + 1,
    created_at: now(),
    updated_at: now(),
  };
  employees.push(newEmployee);
  save(KEYS.employees, employees);
  return newEmployee;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
  const employees = load<Employee>(KEYS.employees);
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...updates, updated_at: now() };
  save(KEYS.employees, employees);
  return employees[idx];
}

export function deleteEmployee(id: string): void {
  const employees = load<Employee>(KEYS.employees).filter(e => e.id !== id);
  save(KEYS.employees, employees);
  // Also delete related records
  const records = load<AttendanceRecord>(KEYS.records).filter(r => r.employee_id !== id);
  save(KEYS.records, records);
}

export function reorderEmployees(orderedIds: string[]): void {
  const employees = load<Employee>(KEYS.employees);
  orderedIds.forEach((id, index) => {
    const emp = employees.find(e => e.id === id);
    if (emp) emp.sort_order = index + 1;
  });
  save(KEYS.employees, employees);
}

// ─── Attendance Records ────────────────────────────────────────────────────

export function getAttendanceRecords(
  employeeIds: string[],
  month: number,
  year: number,
): AttendanceRecord[] {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  return load<AttendanceRecord>(KEYS.records).filter(
    r =>
      employeeIds.includes(r.employee_id) &&
      r.date >= startDate &&
      r.date <= endDate
  );
}

export function upsertAttendanceRecord(
  record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>
): AttendanceRecord {
  const records = load<AttendanceRecord>(KEYS.records);
  const idx = records.findIndex(
    r => r.employee_id === record.employee_id && r.date === record.date
  );

  if (idx !== -1) {
    // Don't overwrite manual records with auto ones
    if (records[idx].source === 'manual' && record.source === 'auto') {
      return records[idx];
    }
    records[idx] = { ...records[idx], ...record, updated_at: now() };
    save(KEYS.records, records);
    return records[idx];
  }

  const newRecord: AttendanceRecord = {
    ...record,
    id: generateId(),
    created_at: now(),
    updated_at: now(),
  };
  records.push(newRecord);
  save(KEYS.records, records);
  return newRecord;
}

export function updateAttendanceStatus(
  employeeId: string,
  date: string,
  status: string | null,
): void {
  upsertAttendanceRecord({
    employee_id: employeeId,
    date,
    status: status as AttendanceRecord['status'],
    check_in: null,
    check_out: null,
    source: 'manual',
    upload_id: null,
  });
}

// ─── Uploads ───────────────────────────────────────────────────────────────

export function getUploads(): AttendanceUpload[] {
  return load<AttendanceUpload>(KEYS.uploads);
}

export function saveUpload(
  upload: Omit<AttendanceUpload, 'id' | 'uploaded_at'>
): AttendanceUpload {
  const uploads = load<AttendanceUpload>(KEYS.uploads);
  const newUpload: AttendanceUpload = {
    ...upload,
    id: generateId(),
    uploaded_at: now(),
  };
  uploads.push(newUpload);
  save(KEYS.uploads, uploads);
  return newUpload;
}

// ─── Available Periods ─────────────────────────────────────────────────────

export function getAvailablePeriods(): { month: number; year: number }[] {
  const uploads = load<AttendanceUpload>(KEYS.uploads);
  const seen = new Set<string>();
  const periods: { month: number; year: number }[] = [];
  for (const u of uploads) {
    const key = `${u.period_year}-${u.period_month}`;
    if (!seen.has(key)) {
      seen.add(key);
      periods.push({ month: u.period_month, year: u.period_year });
    }
  }
  return periods.sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.month - a.month
  );
}

// ─── Clear / Reset Helpers ──────────────────────────────────────────────────

export function clearPeriodRecords(
  employeeIds: string[],
  month: number,
  year: number
): void {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  const records = load<AttendanceRecord>(KEYS.records).filter(
    (r) =>
      !(
        employeeIds.includes(r.employee_id) &&
        r.date >= startDate &&
        r.date <= endDate
      )
  );
  save(KEYS.records, records);
}

export function clearAllEmployees(branchId: string): void {
  const employees = load<Employee>(KEYS.employees);
  const remaining = employees.filter((e) => e.branch_id !== branchId);
  const removedIds = new Set(
    employees.filter((e) => e.branch_id === branchId).map((e) => e.id)
  );
  save(KEYS.employees, remaining);

  // Also remove their attendance records
  const records = load<AttendanceRecord>(KEYS.records).filter(
    (r) => !removedIds.has(r.employee_id)
  );
  save(KEYS.records, records);
}

export function clearAllBranchData(branchId: string): void {
  clearAllEmployees(branchId);
  const uploads = load<AttendanceUpload>(KEYS.uploads).filter(
    (u) => u.branch_id !== branchId
  );
  save(KEYS.uploads, uploads);
}

