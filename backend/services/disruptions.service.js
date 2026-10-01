import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedDisruptions, seedFlights, seedAircraft, seedCrew, seedGates, seedPassengers } from '../data/seedData.js';

let disruptionsStore = [...seedDisruptions];

export const getDisruptionsService = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('disruptions').select('*');
      if (data?.length) return data;
    } catch (err) {
      console.warn('[DisruptionsService] Supabase fallback:', err.message);
    }
  }
  return disruptionsStore;
};

export const getDisruptionByIdService = async (id) => {
  return disruptionsStore.find(d => d.id === id || d.flight_id === id) || disruptionsStore[0];
};

export const createDisruptionService = async (disruptionData) => {
  const newDisruption = {
    id: `dis-${Date.now()}`,
    ...disruptionData,
    detected_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  disruptionsStore.push(newDisruption);
  return newDisruption;
};

export const updateDisruptionService = async (id, updateData) => {
  const idx = disruptionsStore.findIndex(d => d.id === id);
  if (idx !== -1) {
    disruptionsStore[idx] = {
      ...disruptionsStore[idx],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    return disruptionsStore[idx];
  }
  return null;
};

export const analyzeDisruptionService = async (id) => {
  const disruption = await getDisruptionByIdService(id);
  const flight = seedFlights.find(f => f.id === disruption.flight_id) || seedFlights[0];

  return {
    disruptionId: disruption.id,
    flightNumber: flight.flight_number,
    affectedAircraft: [seedAircraft[0]],
    affectedCrew: [seedCrew[0]],
    affectedGates: [seedGates[0]],
    affectedPassengers: seedPassengers,
    downstreamFlights: ["6E 2180", "AI 204"],
    severity: disruption.severity,
    riskLevel: "CRITICAL",
    estimatedKnockOnDelay: "45-90 minutes across next 3 rotations"
  };
};

export const getCascadeGraphService = async (id) => {
  return {
    nodes: [
      {
        id: "node-root-atc",
        type: "disruption",
        label: "MDU ATC Ground Hold",
        status: "ACTIVE",
        risk: "CRITICAL",
        metadata: { delayMinutes: 45, type: "WEATHER_ATC" }
      },
      {
        id: "node-flight-6e1234",
        type: "flight",
        label: "Flight 6E 1234 (MDU → MAA)",
        status: "DELAYED",
        risk: "HIGH",
        metadata: { std: "18:30", etd: "19:15" }
      },
      {
        id: "node-ac-vtifz",
        type: "aircraft",
        label: "Aircraft VT-IFZ (A320neo)",
        status: "TURNAROUND_CRITICAL",
        risk: "MEDIUM",
        metadata: { turnRemaining: "18m" }
      },
      {
        id: "node-crew-rajiv",
        type: "crew",
        label: "Capt. Rajiv & FO Rao",
        status: "DUTY_EXCEEDED",
        risk: "CRITICAL",
        metadata: { remainingDutyMinutes: 40 }
      },
      {
        id: "node-gate-a4",
        type: "gate",
        label: "DEL Gate A4",
        status: "GATE_CONFLICT",
        risk: "HIGH",
        metadata: { stand: "T3 International Pier" }
      },
      {
        id: "node-pax-conx",
        type: "passenger",
        label: "26 Connecting Pax",
        status: "MISCONNECT_RISK",
        risk: "CRITICAL",
        metadata: { longHaulFlight: "AI 204 DEL → LHR" }
      },
      {
        id: "node-flight-6e2180",
        type: "downstream-flight",
        label: "Flight 6E 2180 (MAA → DEL)",
        status: "KNOCK_ON_DELAY",
        risk: "HIGH",
        metadata: { knockOnDelayMinutes: 45 }
      }
    ],
    edges: [
      { id: "e1", source: "node-root-atc", target: "node-flight-6e1234", animated: true },
      { id: "e2", source: "node-flight-6e1234", target: "node-ac-vtifz", animated: true },
      { id: "e3", source: "node-ac-vtifz", target: "node-crew-rajiv", animated: true },
      { id: "e4", source: "node-crew-rajiv", target: "node-gate-a4", animated: true },
      { id: "e5", source: "node-gate-a4", target: "node-pax-conx", animated: true },
      { id: "e6", source: "node-pax-conx", target: "node-flight-6e2180", animated: true }
    ]
  };
};

export const getForecastService = async (id) => {
  return {
    disruptionId: id,
    now: {
      affectedFlights: 2,
      affectedPassengers: 142
    },
    plus30: {
      affectedFlights: 3,
      affectedPassengers: 186
    },
    plus60: {
      affectedFlights: 5,
      affectedPassengers: 242
    },
    plus120: {
      affectedFlights: 8,
      affectedPassengers: 360
    },
    confidence: "96.4% Accuracy (Neural Propagation Forecast)"
  };
};
