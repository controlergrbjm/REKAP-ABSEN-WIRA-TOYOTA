import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Branch } from '../types';
import * as localStore from '../lib/localStore';

export async function fetchBranches(): Promise<Branch[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Branch[];
      }
      if (!error && data && data.length === 0) {
        // Seed default branch in Supabase if empty
        const defaultBranch = {
          name: 'WIRA MEGAH BANJARMASIN',
          code: 'GR BJM',
        };
        const { data: inserted } = await supabase
          .from('branches')
          .insert(defaultBranch)
          .select()
          .single();
        if (inserted) return [inserted as Branch];
      }
    } catch (err) {
      console.warn('[branchService] Supabase fetch failed, fallback to localStore:', err);
    }
  }

  return localStore.getBranches();
}

export async function createBranch(branch: Omit<Branch, 'id' | 'created_at'>): Promise<Branch> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert(branch)
        .select()
        .single();
      if (!error && data) return data as Branch;
    } catch (err) {
      console.warn('[branchService] Supabase insert failed, fallback to localStore:', err);
    }
  }

  return localStore.saveBranch(branch);
}

export async function updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('branches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Branch;
    } catch (err) {
      console.warn('[branchService] Supabase update failed, fallback to localStore:', err);
    }
  }

  return localStore.updateBranch(id, updates);
}

export async function deleteBranch(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('branches').delete().eq('id', id);
    } catch (err) {
      console.warn('[branchService] Supabase delete failed, fallback to localStore:', err);
    }
  }

  localStore.deleteBranch(id);
}
