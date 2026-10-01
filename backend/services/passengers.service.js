import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedPassengers } from '../data/seedData.js';

let passengersStore = [...seedPassengers];

export const getPassengersService = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('passengers').select('*');
      if (data?.length) return data;
    } catch (err) {
      console.warn('[PassengersService] Supabase fallback:', err.message);
    }
  }
  return passengersStore;
};

export const getPassengerByIdService = async (id) => {
  return passengersStore.find(p => p.id === id || p.pnr === id) || passengersStore[0];
};

export const getPassengerImpactSummaryService = async () => {
  return {
    totalImpacted: 124,
    criticalConnections: 26,
    rebookedPax: 5,
    hotelAssignedPax: 0,
    specialAssistancePax: 2,
    connectionProtectionRate: "91.8%"
  };
};
