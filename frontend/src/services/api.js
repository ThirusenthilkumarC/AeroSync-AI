import axios from 'axios';
import { flightsData } from '../data/flights';
import { activeDisruptions } from '../data/disruptions';
import { recoveryPlans } from '../data/recoveryPlans';
import { crewData } from '../data/crew';
import { aircraftData } from '../data/aircraft';
import { passengersData, passengerImpactSummary } from '../data/passengers';
import { networkRippleForecast, simulationScenariosData } from '../data/forecast';
import { decisionEvents } from '../data/decisionReplay';
import { availableFlightsData, networkDestinationAvailability, getSeatSummary } from '../data/seatInventory';
import { worldAirports, globalFlightsData, globalNetworkSummaryData } from '../data/airlineNetwork';

// Configure Axios instance targeting Node.js Express REST API backend
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer MOCK_OCC_TOKEN_SEC_LEVEL_4'
  }
});

const mockDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Helper wrapper trying real backend first, falling back gracefully to mock data
const apiCall = async (endpoint, options = {}, fallbackData = null) => {
  try {
    const res = await apiClient({ url: endpoint, ...options });
    if (res.data && res.data.success) {
      return { status: res.status, data: res.data.data };
    }
  } catch (err) {
    console.warn(`[API Client] Endpoint ${endpoint} fallback:`, err.message);
  }
  await mockDelay();
  return { status: 200, data: fallbackData };
};

// 1. Dashboard API Service
export const getDashboard = async () => {
  return apiCall('/dashboard/summary', { method: 'GET' }, {
    activeFlights: 482,
    onTimeFlights: 462,
    delayedFlights: 14,
    cancelledFlights: 6,
    aircraftAvailable: 6,
    crewAtRisk: 4,
    passengersImpacted: 124,
    activeDisruptions: 3
  });
};

// 2. Flights API Services
export const getFlights = async (filters = {}) => {
  return apiCall('/flights', { method: 'GET', params: filters }, flightsData);
};

export const getFlight = async (id) => {
  const fallback = flightsData.find(f => f.id === id || f.flightNumber === id) || flightsData[0];
  return apiCall(`/flights/${id}`, { method: 'GET' }, fallback);
};

export const getAvailableFlights = async (filters = {}) => {
  return apiCall('/flights', { method: 'GET', params: filters }, availableFlightsData);
};

export const getFlightSeats = async (flightId) => {
  const flight = availableFlightsData.find(f => f.id === flightId) || availableFlightsData[0];
  const summary = getSeatSummary(flight.seats);
  return apiCall(`/flights/${flightId}`, { method: 'GET' }, {
    flightId: flight.id,
    flightNumber: flight.flightNumber,
    aircraft: flight.aircraft,
    tailNumber: flight.tailNumber,
    origin: flight.origin,
    destination: flight.destination,
    departure: flight.departure,
    arrival: flight.arrival,
    gate: flight.gate,
    status: flight.status,
    delayMinutes: flight.delayMinutes,
    ...summary,
    seats: flight.seats
  });
};

// 3. Disruptions & Cascade API Services
export const getDisruptions = async () => {
  return apiCall('/disruptions', { method: 'GET' }, activeDisruptions);
};

export const getCascade = async (id = 'dis-6e1234-atc') => {
  return apiCall(`/disruptions/${id}/cascade`, { method: 'GET' }, {
    nodes: [
      { id: "1", type: "disruption", label: "MDU ATC Ground Hold (+45m)" },
      { id: "2", type: "flight", label: "6E 1234 (MDU → MAA)" },
      { id: "3", type: "aircraft", label: "VT-IFZ Turnaround Critical" },
      { id: "4", type: "crew", label: "Capt. Rajiv Duty Limit Exceeded" },
      { id: "5", type: "gate", label: "DEL Gate A4 Conflict" },
      { id: "6", type: "passenger", label: "26 Pax LHR Connection Risk" }
    ],
    edges: []
  });
};

export const getForecast = async (id = 'dis-6e1234-atc') => {
  return apiCall(`/disruptions/${id}/forecast`, { method: 'GET' }, networkRippleForecast);
};

// 4. Recovery Plans & Optimization API Services
export const getRecoveryPlans = async () => {
  return apiCall('/recovery/plans', { method: 'GET' }, recoveryPlans);
};

export const generateRecovery = async (params = {}) => {
  return apiCall('/recovery/generate', { method: 'POST', data: params }, recoveryPlans);
};

export const validateRecovery = async (params = {}) => {
  return apiCall('/recovery/validate', { method: 'POST', data: params }, {
    valid: true,
    validations: [
      { type: "CREW_DUTY_LIMIT", status: "PASSED", message: "FDTL Rule 12 Compliant" },
      { type: "GATE_AVAILABILITY", status: "PASSED", message: "Remote Stand R14 Clear" }
    ],
    conflicts: []
  });
};

export const approveRecoveryPlan = async (planId, notes = '') => {
  return apiCall(`/recovery/${planId}/approve`, { method: 'POST', data: { notes } }, {
    success: true,
    planId,
    notes,
    auditKey: `AIR-DGCA-REC-${Math.floor(1000 + Math.random() * 9000)}`,
    message: `Recovery Plan ${planId} successfully authorized and dispatched.`
  });
};

export const rejectRecoveryPlan = async (planId, reason = '') => {
  return apiCall(`/recovery/${planId}/reject`, { method: 'POST', data: { reason } }, {
    success: true,
    planId,
    reason,
    message: `Recovery Plan ${planId} rejected.`
  });
};

// 5. What-If Simulation API Service
export const runSimulation = async (scenarioParams = {}) => {
  return apiCall('/simulation/run', { method: 'POST', data: scenarioParams }, {
    timestamp: new Date().toISOString(),
    scenario: scenarioParams,
    results: simulationScenariosData.baseline
  });
};

// 6. Entity Management API Services
export const getCrew = async () => {
  return apiCall('/crew', { method: 'GET' }, crewData);
};

export const getAircraft = async () => {
  return apiCall('/aircraft', { method: 'GET' }, aircraftData);
};

export const getGates = async () => {
  return apiCall('/gates', { method: 'GET' }, networkDestinationAvailability);
};

export const getPassengers = async () => {
  return apiCall('/passengers', { method: 'GET' }, passengersData);
};

export const getNotifications = async () => {
  return apiCall('/notifications', { method: 'GET' }, [
    { id: "n1", title: "MDU ATC Hold Active", category: "DISRUPTION", severity: "CRITICAL" }
  ]);
};

export const getDecisionReplay = async () => {
  return apiCall('/recovery/rec-plan-v1/replay', { method: 'GET' }, decisionEvents);
};

// Global Network Map Data Services
export const getGlobalNetworkData = async () => {
  return apiCall('/dashboard/summary', { method: 'GET' }, {
    airports: worldAirports,
    flights: globalFlightsData,
    summary: globalNetworkSummaryData
  });
};

export const getFlightsLive = async () => {
  return apiCall('/flights', { method: 'GET' }, globalFlightsData);
};

export const getAirports = async () => {
  return apiCall('/gates', { method: 'GET' }, worldAirports);
};

export const getFlightById = async (id) => {
  const flight = globalFlightsData.find(f => f.id === id || f.flightNumber === id) || globalFlightsData[0];
  return apiCall(`/flights/${id}`, { method: 'GET' }, flight);
};

export const getDisruptionCascade = async (disruptionId) => {
  return apiCall(`/disruptions/${disruptionId}/cascade`, { method: 'GET' }, {
    id: disruptionId,
    disruption: activeDisruptions[0],
    cascadeNodes: [
      { node: 1, type: 'Root Flight', details: 'MDU → MAA (+90m ATC Hold)' },
      { node: 2, type: 'Aircraft Turnaround', details: 'VT-IFZ Critical 18m Left' },
      { node: 3, type: 'Crew FDTL', details: 'Capt. Rajiv +12m Exceeds Duty' },
      { node: 4, type: 'Gate Stand', details: 'DEL Gate A4 Occupied' },
      { node: 5, type: 'Passenger Connections', details: '26 Pax LHR Risk' }
    ]
  });
};

export const getNetworkAvailability = async () => {
  return apiCall('/gates', { method: 'GET' }, networkDestinationAvailability);
};

export const getAlternativeFlights = async (disruptedFlightId) => {
  const alternatives = availableFlightsData
    .filter(f => f.id !== disruptedFlightId && f.origin === 'MDU' && f.destination === 'MAA')
    .map(f => {
      const summary = getSeatSummary(f.seats);
      return {
        ...f,
        availableSeats: summary.availableSeats,
        accommodatePaxCount: Math.min(summary.availableSeats, 47)
      };
    });
  return apiCall('/flights', { method: 'GET' }, alternatives);
};

export const getNetworkForecast = async () => {
  return apiCall('/disruptions/dis-6e1234-atc/forecast', { method: 'GET' }, networkRippleForecast);
};

export default apiClient;
