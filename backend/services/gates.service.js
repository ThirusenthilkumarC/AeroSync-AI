import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedGates } from '../data/seedData.js';

let gatesStore = [...seedGates];

export const getGatesService = async (statusFilter = null) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('gates').select('*');
      if (statusFilter && statusFilter !== 'ALL') query = query.eq('status', statusFilter);
      const { data } = await query;
      if (data?.length) return data;
    } catch (err) {
      console.warn('[GatesService] Supabase fallback:', err.message);
    }
  }

  if (statusFilter && statusFilter !== 'ALL') {
    return gatesStore.filter(g => g.status === statusFilter);
  }
  return gatesStore;
};

export const getGateByIdService = async (id) => {
  return gatesStore.find(g => g.id === id || g.gate_code === id) || gatesStore[0];
};

export const updateGateService = async (id, updateData) => {
  const index = gatesStore.findIndex(g => g.id === id);
  if (index !== -1) {
    gatesStore[index] = {
      ...gatesStore[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    return gatesStore[index];
  }
  return null;
};
