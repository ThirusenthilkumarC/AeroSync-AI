import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedFlights } from '../data/seedData.js';

let flightsMemoryStore = [...seedFlights];

export const getFlightsService = async (filters = {}) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('flights').select('*');
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.airline) query = query.eq('airline', filters.airline);
      if (filters.origin) query = query.eq('origin', filters.origin);
      if (filters.destination) query = query.eq('destination', filters.destination);
      const { data, error } = await query;
      if (!error && data?.length) return data;
    } catch (err) {
      console.warn('[FlightsService] Supabase fallback:', err.message);
    }
  }

  let result = [...flightsMemoryStore];
  if (filters.status && filters.status !== 'ALL') {
    result = result.filter(f => f.status === filters.status);
  }
  if (filters.airline && filters.airline !== 'All Airlines') {
    result = result.filter(f => f.airline === filters.airline);
  }
  if (filters.origin && filters.origin !== 'ALL') {
    result = result.filter(f => f.origin === filters.origin);
  }
  return result;
};

export const getFlightByIdService = async (id) => {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('flights').select('*').eq('id', id).single();
      if (data) return data;
    } catch (err) {
      console.warn('[FlightsService] Supabase getById fallback:', err.message);
    }
  }
  return flightsMemoryStore.find(f => f.id === id || f.flight_number.replace(/\s+/g, '') === id.replace(/\s+/g, '')) || flightsMemoryStore[0];
};

export const searchFlightsService = async (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return flightsMemoryStore.filter(f => 
    f.flight_number.toLowerCase().includes(term) ||
    f.origin.toLowerCase().includes(term) ||
    f.destination.toLowerCase().includes(term) ||
    f.airline.toLowerCase().includes(term)
  );
};

export const createFlightService = async (flightData) => {
  const newFlight = {
    id: `flt-${Date.now()}`,
    ...flightData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  flightsMemoryStore.push(newFlight);
  return newFlight;
};

export const updateFlightService = async (id, updateData) => {
  const index = flightsMemoryStore.findIndex(f => f.id === id);
  if (index !== -1) {
    flightsMemoryStore[index] = {
      ...flightsMemoryStore[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    return flightsMemoryStore[index];
  }
  return null;
};

export const deleteFlightService = async (id) => {
  const index = flightsMemoryStore.findIndex(f => f.id === id);
  if (index !== -1) {
    const deleted = flightsMemoryStore.splice(index, 1);
    return deleted[0];
  }
  return null;
};
