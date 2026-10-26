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
    'Content-Type': 'application/json'
  }
});

// Attach Bearer token to outgoing requests if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('aerosync_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        config.headers.Authorization = 'Bearer MOCK_OCC_TOKEN_SEC_LEVEL_4';
      }
    } catch {
      // Fallback
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

export const searchFlightsApi = async (query = '') => {
  const fallback = flightsData.filter(f => 
    f.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
    f.origin.toLowerCase().includes(query.toLowerCase()) ||
    f.destination.toLowerCase().includes(query.toLowerCase()) ||
    f.tailNumber.toLowerCase().includes(query.toLowerCase())
  );
  return apiCall('/flights/search', { method: 'GET', params: { q: query } }, fallback);
};

export const createFlight = async (flightData) => {
  const newFlight = {
    id: `flt-${Date.now()}`,
    ...flightData,
    statusType: flightData.status === 'Delayed' ? 'critical' : flightData.status === 'Boarding' ? 'warning' : 'normal',
    delayMinutes: flightData.delayMinutes || 0
  };
  return apiCall('/flights', { method: 'POST', data: flightData }, newFlight);
};

export const updateFlight = async (id, flightData) => {
  return apiCall(`/flights/${id}`, { method: 'PUT', data: flightData }, { id, ...flightData });
};

export const deleteFlight = async (id) => {
  return apiCall(`/flights/${id}`, { method: 'DELETE' }, { id, success: true });
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

export const createDisruption = async (disruptionData) => {
  const newDis = {
    id: `dis-${Date.now()}`,
    ...disruptionData,
    detected_at: new Date().toISOString()
  };
  return apiCall('/disruptions', { method: 'POST', data: disruptionData }, newDis);
};

export const updateDisruption = async (id, disruptionData) => {
  return apiCall(`/disruptions/${id}`, { method: 'PUT', data: disruptionData }, { id, ...disruptionData });
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


export const bookFlightTicket = async (bookingData) => {
  try {
    const res = await apiClient.post('/passengers/book', bookingData);
    if (res.data && res.data.success) {
      return { success: true, data: res.data.data, message: res.data.message };
    }
  } catch (err) {
    console.warn('[API Client] bookFlightTicket backend fallback:', err.message);
  }
  const pnr = `AS-${Math.floor(10000 + Math.random() * 90000)}`;
  const ticketNumber = `098-${Date.now().toString().slice(-8)}`;
  return {
    success: true,
    data: {
      pnr,
      ticketNumber,
      passengerName: bookingData.passengerName || 'Priya Sharma',
      email: bookingData.email || 'passenger@aerosync.aero',
      phone: bookingData.phone || '+91 98765 43210',
      flightId: bookingData.flightId || '6E1234',
      flightNumber: bookingData.flightNumber || '6E 1234',
      origin: bookingData.origin || 'DEL',
      destination: bookingData.destination || 'MAA',
      seatNumber: bookingData.seatNumber || '12C',
      cabin: bookingData.cabin || 'Economy',
      gate: bookingData.gate || 'Gate B4',
      departure: bookingData.departure || '18:30 UTC',
      status: 'CONFIRMED',
      issuedAt: new Date().toISOString()
    },
    message: 'Flight ticket confirmed. Digital boarding pass generated.'
  };
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


// ==========================================
// Authentication & OCC Clearance Services
// ==========================================
export const loginUser = async (credentials) => {
  try {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data && res.data.success) {
      const authData = res.data.data;
      if (typeof window !== 'undefined') {
        if (authData.token) localStorage.setItem('aerosync_token', authData.token);
        if (authData.user) localStorage.setItem('aerosync_user', JSON.stringify(authData.user));
      }
      return { success: true, data: authData };
    }
  } catch (err) {
    console.warn('[API Client] Auth login error from backend, applying fallback authorization:', err.message);
  }

  // Resilient fallback for standalone preview / mock mode
  const fallbackToken = `AEROSYNC_OCC_TOKEN_${Date.now()}`;
  const fallbackUser = {
    id: 'USR-OCC-2026-88',
    name: 'Capt. Neha Sharma',
    email: (credentials && credentials.email) || 'ops.controller@aerosync.aero',
    role: 'CHIEF OPS CONTROLLER',
    clearanceLevel: 'SEC-LEVEL 4',
    station: (credentials && credentials.station) || 'DEL',
    airline: 'Air India',
    token: fallbackToken
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('aerosync_token', fallbackToken);
    localStorage.setItem('aerosync_user', JSON.stringify(fallbackUser));
  }

  return { success: true, data: { token: fallbackToken, user: fallbackUser } };
};

export const registerUser = async (details) => {
  try {
    const res = await apiClient.post('/auth/register', details);
    if (res.data && res.data.success) {
      return { success: true, data: res.data.data, message: res.data.message };
    }
  } catch (err) {
    console.warn('[API Client] Auth register fallback:', err.message);
  }
  return {
    success: true,
    data: {
      clearanceId: `REQ-${Date.now().toString().slice(-6)}`,
      status: 'PENDING_APPROVAL',
      staffName: (details && details.name) || 'Flight Controller',
      email: details && details.email,
      department: (details && details.department) || 'Operations Control Center',
      station: (details && details.station) || 'DEL'
    },
    message: 'Clearance request submitted. Verification token dispatched to Chief Controller.'
  };
};

export const forgotPassword = async (email) => {
  try {
    const res = await apiClient.post('/auth/forgot-password', { email });
    if (res.data && res.data.success) {
      return { success: true, data: res.data.data, message: res.data.message };
    }
  } catch (err) {
    console.warn('[API Client] Auth forgot-password fallback:', err.message);
  }
  return {
    success: true,
    data: {
      email,
      dispatchedAt: new Date().toISOString()
    },
    message: 'One-Time OCC Emergency Dispatch PIN generated and sent to terminal.'
  };
};

export const logoutUser = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aerosync_token');
      localStorage.removeItem('aerosync_user');
    }
  } catch (e) {
    console.error('Logout error:', e);
  }
};

export const getStoredUser = () => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('aerosync_user');
      return raw ? JSON.parse(raw) : null;
    }
  } catch {
    return null;
  }
  return null;
};

export const getStoredToken = () => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aerosync_token');
    }
  } catch {
    return null;
  }
  return null;
};

export default apiClient;

