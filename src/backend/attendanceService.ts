import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AttendanceRecord, AttendanceStatus, AttendanceUpload, MonthPeriod } from '../types';
import * as localStore from '../lib/localStore';

export async function fetchAttendanceRecords(
  employeeIds: string[],
  month: number,
  year: number
): Promise<AttendanceRecord[]> {
  if (employeeIds.length === 0) return [];

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .in('employee_id', employeeIds)
        .gte('date', startDate)
        .lte('date', endDate);

      if (!error && data) {
        return data as AttendanceRecord[];
      }
    } catch (err) {
      console.warn('[attendanceService] Supabase fetch error, fallback to localStore:', err);
    }
  }

  return localStore.getAttendanceRecords(employeeIds, month, year);
}

export async function saveAttendanceUpload(upload: Omit<AttendanceUpload, 'id' | 'uploaded_at'>): Promise<AttendanceUpload> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance_uploads')
        .insert(upload)
        .select()
        .single();

      if (!error && data) return data as AttendanceUpload;
    } catch (err) {
      console.warn('[attendanceService] Supabase upload insert failed, fallback to localStore:', err);
    }
  }

  return localStore.saveUpload(upload);
}

export async function upsertAttendanceRecord(
  record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<AttendanceRecord> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(
          {
            ...record,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'employee_id,date' }
        )
        .select()
        .single();

      if (!error && data) return data as AttendanceRecord;
    } catch (err) {
      console.warn('[attendanceService] Supabase record upsert error, fallback to localStore:', err);
    }
  }

  return localStore.upsertAttendanceRecord(record);
}

export async function updateAttendanceStatus(
  employeeId: string,
  date: string,
  status: AttendanceStatus
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('attendance_records').upsert(
        {
          employee_id: employeeId,
          date,
          status,
          source: 'manual',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'employee_id,date' }
      );
    } catch (err) {
      console.warn('[attendanceService] Supabase update status error, fallback to localStore:', err);
    }
  }

  localStore.updateAttendanceStatus(employeeId, date, status);
}

export async function fetchAvailablePeriods(): Promise<MonthPeriod[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance_uploads')
        .select('period_month, period_year')
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false });

      if (!error && data) {
        const seen = new Set<string>();
        const result: MonthPeriod[] = [];
        for (const row of data) {
          const key = `${row.period_year}-${row.period_month}`;
          if (!seen.has(key)) {
            seen.add(key);
            result.push({ month: row.period_month, year: row.period_year });
          }
        }
        if (result.length > 0) return result;
      }
    } catch (err) {
      console.warn('[attendanceService] Supabase periods fetch error, fallback to localStore:', err);
    }
  }

  return localStore.getAvailablePeriods();
}

export async function clearAllAttendance(branchId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Find employee IDs for branch
      const { data: empList } = await supabase
        .from('employees')
        .select('id')
        .eq('branch_id', branchId);

      if (empList && empList.length > 0) {
        const ids = empList.map(e => e.id);
        await supabase.from('attendance_records').delete().in('employee_id', ids);
      }
      await supabase.from('attendance_uploads').delete().eq('branch_id', branchId);
      await supabase.from('employees').delete().eq('branch_id', branchId);
    } catch (err) {
      console.warn('[attendanceService] Supabase clear failed, fallback to localStore:', err);
    }
  }

  localStore.clearAllBranchData(branchId);
}
