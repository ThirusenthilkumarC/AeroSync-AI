import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedAircraft } from '../data/seedData.js';

let aircraftStore = [...seedAircraft];

export const getAircraftService = async (statusFilter = null) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('aircraft').select('*');
      if (statusFilter && statusFilter !== 'ALL') query = query.eq('status', statusFilter);
      const { data } = await query;
      if (data?.length) return data;
    } catch (err) {
      console.warn('[AircraftService] Supabase fallback:', err.message);
    }
  }

  if (statusFilter && statusFilter !== 'ALL') {
    return aircraftStore.filter(a => a.status === statusFilter);
  }
  return aircraftStore;
};

export const getAircraftByIdService = async (id) => {
  return aircraftStore.find(a => a.id === id || a.tail_number === id) || aircraftStore[0];
};

export const updateAircraftService = async (id, updateData) => {
  const index = aircraftStore.findIndex(a => a.id === id);
  if (index !== -1) {
    aircraftStore[index] = {
      ...aircraftStore[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    return aircraftStore[index];
  }
  return null;
};
