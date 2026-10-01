import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedCrew } from '../data/seedData.js';

let crewStore = [...seedCrew];

export const getCrewService = async (statusFilter = null) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('crew').select('*');
      if (statusFilter && statusFilter !== 'ALL') query = query.eq('status', statusFilter);
      const { data } = await query;
      if (data?.length) return data;
    } catch (err) {
      console.warn('[CrewService] Supabase fallback:', err.message);
    }
  }

  if (statusFilter && statusFilter !== 'ALL') {
    return crewStore.filter(c => c.status === statusFilter);
  }
  return crewStore;
};

export const getCrewByIdService = async (id) => {
  return crewStore.find(c => c.id === id || c.crew_code === id) || crewStore[0];
};

export const updateCrewService = async (id, updateData) => {
  const index = crewStore.findIndex(c => c.id === id);
  if (index !== -1) {
    crewStore[index] = {
      ...crewStore[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    return crewStore[index];
  }
  return null;
};
