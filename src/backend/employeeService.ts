import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Employee } from '../types';
import { getMasterOrderIndex, sortEmployeesByMasterOrder } from '../constants/masterEmployees';
import * as localStore from '../lib/localStore';

export async function fetchEmployees(branchId?: string): Promise<Employee[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('employees').select('*').order('sort_order', { ascending: true });
      if (branchId) query = query.eq('branch_id', branchId);

      const { data, error } = await query;
      if (!error && data) {
        return sortEmployeesByMasterOrder(data as Employee[]);
      }
    } catch (err) {
      console.warn('[employeeService] Supabase fetch failed, fallback to localStore:', err);
    }
  }

  return localStore.getEmployees(branchId);
}

export async function upsertEmployee(
  branchId: string,
  pin: string | null,
  name: string,
  position?: string,
  sortOrder?: number
): Promise<Employee> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Look up existing by PIN or Name
      let existingQuery = supabase.from('employees').select('*').eq('branch_id', branchId);
      if (pin) {
        existingQuery = existingQuery.eq('pin', pin);
      } else {
        existingQuery = existingQuery.ilike('name', name.trim());
      }

      const { data: existingList } = await existingQuery.limit(1);
      const existing = existingList && existingList[0] ? existingList[0] : null;

      if (existing) {
        const updates: Partial<Employee> = {
          name: name.trim(),
          updated_at: new Date().toISOString(),
        };
        if (pin) updates.pin = pin;
        if (position && !existing.position) updates.position = position;

        const { data: updated } = await supabase
          .from('employees')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();

        if (updated) return updated as Employee;
      } else {
        // Count for sort order
        const { count } = await supabase
          .from('employees')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', branchId);

        const masterIdx = getMasterOrderIndex(name);
        const newSort = sortOrder ?? (masterIdx <= 73 ? masterIdx : (count || 0) + 74);
        const newRecord = {
          branch_id: branchId,
          pin: pin || null,
          name: name.trim(),
          position: position || null,
          is_active: true,
          sort_order: newSort,
        };

        const { data: created } = await supabase
          .from('employees')
          .insert(newRecord)
          .select()
          .single();

        if (created) return created as Employee;
      }
    } catch (err) {
      console.warn('[employeeService] Supabase upsert error, fallback to localStore:', err);
    }
  }

  const emp = localStore.upsertEmployee(branchId, pin, name);
  if (position && !emp.position) {
    localStore.updateEmployee(emp.id, { position });
    emp.position = position;
  }
  return emp;
}

export async function updateEmployeePosition(id: string, position: string): Promise<Employee | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ position: position.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) return data as Employee;
    } catch (err) {
      console.warn('[employeeService] Supabase update position failed, fallback to localStore:', err);
    }
  }

  return localStore.updateEmployee(id, { position });
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) return data as Employee;
    } catch (err) {
      console.warn('[employeeService] Supabase update failed, fallback to localStore:', err);
    }
  }

  return localStore.updateEmployee(id, updates);
}

export async function deleteEmployee(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('employees').delete().eq('id', id);
    } catch (err) {
      console.warn('[employeeService] Supabase delete failed, fallback to localStore:', err);
    }
  }

  localStore.deleteEmployee(id);
}

export async function reorderEmployees(branchId: string, orderedIds: string[]): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          supabase!.from('employees').update({ sort_order: index + 1 }).eq('id', id)
        )
      );
    } catch (err) {
      console.warn('[employeeService] Supabase reorder failed, fallback to localStore:', err);
    }
  }

  localStore.reorderEmployees(orderedIds);
}

export async function clearEmployeesByBranch(branchId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('employees').delete().eq('branch_id', branchId);
    } catch (err) {
      console.warn('[employeeService] Supabase clear employees failed, fallback to localStore:', err);
    }
  }

  localStore.clearAllEmployees(branchId);
}
