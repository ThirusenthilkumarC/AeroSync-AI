// Centralized Global Airline Network Demo Dataset

export const worldAirports = {
  // India Hubs & Regional
  MAA: { code: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India", lat: 12.9941, lng: 80.1709, activeFlights: 24, delayedFlights: 2, availableGates: 5 },
  DEL: { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India", lat: 28.5562, lng: 77.1000, activeFlights: 48, delayedFlights: 4, availableGates: 8 },
  BOM: { code: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India", lat: 19.0896, lng: 72.8656, activeFlights: 42, delayedFlights: 3, availableGates: 6 },
  BLR: { code: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", country: "India", lat: 13.1986, lng: 77.7066, activeFlights: 36, delayedFlights: 1, availableGates: 7 },
  HYD: { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", lat: 17.2403, lng: 78.4294, activeFlights: 28, delayedFlights: 1, availableGates: 9 },
  CCU: { code: "CCU", name: "Netaji Subhash Chandra Bose Intl", city: "Kolkata", country: "India", lat: 22.6520, lng: 88.4463, activeFlights: 20, delayedFlights: 0, availableGates: 4 },
  COK: { code: "COK", name: "Cochin International Airport", city: "Kochi", country: "India", lat: 10.1520, lng: 76.4019, activeFlights: 16, delayedFlights: 1, availableGates: 3 },
  MDU: { code: "MDU", name: "Madurai Airport", city: "Madurai", country: "India", lat: 9.8345, lng: 78.0934, activeFlights: 8, delayedFlights: 1, availableGates: 2 },

  // Major International Hubs
  DXB: { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", lat: 25.2532, lng: 55.3657, activeFlights: 65, delayedFlights: 2, availableGates: 12 },
  SIN: { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", lat: 1.3644, lng: 103.9915, activeFlights: 58, delayedFlights: 1, availableGates: 10 },
  LHR: { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", lat: 51.4700, lng: -0.4543, activeFlights: 72, delayedFlights: 5, availableGates: 14 },
  CDG: { code: "CDG", name: "Paris Charles de Gaulle Airport", city: "Paris", country: "France", lat: 49.0097, lng: 2.5479, activeFlights: 54, delayedFlights: 2, availableGates: 9 },
  FRA: { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", lat: 50.0379, lng: 8.5622, activeFlights: 60, delayedFlights: 3, availableGates: 11 },
  JFK: { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", lat: 40.6413, lng: -73.7781, activeFlights: 80, delayedFlights: 4, availableGates: 16 },
  SFO: { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", lat: 37.6213, lng: -122.3790, activeFlights: 45, delayedFlights: 2, availableGates: 7 },
  LAX: { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", lat: 33.9416, lng: -118.4085, activeFlights: 75, delayedFlights: 3, availableGates: 12 },
  HND: { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", lat: 35.5494, lng: 139.7798, activeFlights: 50, delayedFlights: 1, availableGates: 8 },
  SYD: { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", lat: -33.9399, lng: 151.1753, activeFlights: 38, delayedFlights: 1, availableGates: 6 }
};

export const globalAirlinesFilter = [
  "All Airlines",
  "Air India",
  "IndiGo",
  "Vistara",
  "Emirates",
  "Singapore Airlines",
  "British Airways",
  "Lufthansa"
];

export const regionViewCenters = {
  WORLD: { center: [20.0, 10.0], zoom: 2 },
  INDIA: { center: [20.5937, 78.9629], zoom: 5 },
  ASIA: { center: [22.5, 100.0], zoom: 3 },
  EUROPE: { center: [50.0, 10.0], zoom: 4 },
  AMERICAS: { center: [38.0, -97.0], zoom: 3 }
};

export const globalFlightsData = [
  {
    id: "6E1234",
    flightNumber: "6E 1234",
    airline: "IndiGo",
    origin: "MAA",
    originCity: "Chennai",
    destination: "DEL",
    destinationCity: "Delhi",
    aircraft: "Airbus A320neo",
    tailNumber: "VT-IFZ",
    status: "CRITICAL", // ON TIME, DELAYED, CRITICAL, CANCELLED, IN FLIGHT, SCHEDULED
    statusType: "critical",
    statusLabel: "🔴 CRITICAL / DELAYED 120 MIN",
    delayMinutes: 120,
    departure: "18:30 UTC",
    arrival: "21:20 UTC",
    bookedSeats: 164,
    availableSeats: 12,
    totalSeats: 176,
    affectedPax: 48,
    crewStatus: "FDTL Risk (+22m)",
    gate: "Gate A4 Conflict",
    isDisrupted: true,
    cascade: {
      affectedRoute: "MAA → DEL",
      downstreamFlight: "6E 1892 (DEL → LHR)",
      passengerConnections: "24 connecting pax for London 6E 502",
      crewRisk: "Capt. Rajiv FDTL lockout",
      gateConflict: "DEL Gate A4 dual-occupancy with 6E 2108"
    },
    coordinates: {
      originCoords: [12.9941, 80.1709],
      destCoords: [28.5562, 77.1000],
      currentLat: 19.19,
      currentLng: 77.59
    }
  },
  {
    id: "AI201",
    flightNumber: "AI 201",
    airline: "Air India",
    origin: "DEL",
    originCity: "Delhi",
    destination: "LHR",
    destinationCity: "London",
    aircraft: "Boeing 787-8",
    tailNumber: "VT-ANB",
    status: "IN FLIGHT",
    statusType: "inflight",
    statusLabel: "🔵 IN FLIGHT (ON TIME)",
    delayMinutes: 0,
    departure: "14:15 UTC",
    arrival: "19:30 UTC",
    bookedSeats: 242,
    availableSeats: 14,
    totalSeats: 256,
    affectedPax: 0,
    crewStatus: "Nominal Rest Buffer",
    gate: "Gate T3-12 Clear",
    coordinates: {
      originCoords: [28.5562, 77.1000],
      destCoords: [51.4700, -0.4543],
      currentLat: 42.10,
      currentLng: 44.50
    }
  },
  {
    id: "EK542",
    flightNumber: "EK 542",
    airline: "Emirates",
    origin: "DXB",
    originCity: "Dubai",
    destination: "MAA",
    destinationCity: "Chennai",
    aircraft: "Boeing 777-300ER",
    tailNumber: "A6-EGB",
    status: "IN FLIGHT",
    statusType: "inflight",
    statusLabel: "🔵 IN FLIGHT",
    delayMinutes: 0,
    departure: "09:30 UTC",
    arrival: "14:45 UTC",
    bookedSeats: 340,
    availableSeats: 10,
    totalSeats: 350,
    affectedPax: 0,
    crewStatus: "Nominal",
    gate: "Gate B12",
    coordinates: {
      originCoords: [25.2532, 55.3657],
      destCoords: [12.9941, 80.1709],
      currentLat: 18.45,
      currentLng: 68.20
    }
  },
  {
    id: "SQ422",
    flightNumber: "SQ 422",
    airline: "Singapore Airlines",
    origin: "SIN",
    originCity: "Singapore",
    destination: "BOM",
    destinationCity: "Mumbai",
    aircraft: "Airbus A350-900",
    tailNumber: "9V-SMF",
    status: "ON TIME",
    statusType: "ontime",
    statusLabel: "🟢 ON TIME",
    delayMinutes: 0,
    departure: "11:00 UTC",
    arrival: "14:10 UTC",
    bookedSeats: 280,
    availableSeats: 23,
    totalSeats: 303,
    affectedPax: 0,
    crewStatus: "Nominal",
    gate: "Gate 42",
    coordinates: {
      originCoords: [1.3644, 103.9915],
      destCoords: [19.0896, 72.8656],
      currentLat: 10.50,
      currentLng: 88.20
    }
  },
  {
    id: "BA118",
    flightNumber: "BA 118",
    airline: "British Airways",
    origin: "JFK",
    originCity: "New York",
    destination: "LHR",
    destinationCity: "London",
    aircraft: "Boeing 777-200",
    tailNumber: "G-VIIA",
    status: "DELAYED",
    statusType: "delayed",
    statusLabel: "🟡 DELAYED +45 MIN",
    delayMinutes: 45,
    departure: "22:00 UTC",
    arrival: "06:10 UTC",
    bookedSeats: 218,
    availableSeats: 6,
    totalSeats: 224,
    affectedPax: 18,
    crewStatus: "Standby Reallocated",
    gate: "Gate 14",
    coordinates: {
      originCoords: [40.6413, -73.7781],
      destCoords: [51.4700, -0.4543],
      currentLat: 46.20,
      currentLng: -37.50
    }
  },
  {
    id: "LH458",
    flightNumber: "LH 458",
    airline: "Lufthansa",
    origin: "FRA",
    originCity: "Frankfurt",
    destination: "SFO",
    destinationCity: "San Francisco",
    aircraft: "Boeing 747-8",
    tailNumber: "D-ABYA",
    status: "IN FLIGHT",
    statusType: "inflight",
    statusLabel: "🔵 IN FLIGHT",
    delayMinutes: 0,
    departure: "10:15 UTC",
    arrival: "21:00 UTC",
    bookedSeats: 342,
    availableSeats: 22,
    totalSeats: 364,
    affectedPax: 0,
    crewStatus: "Nominal",
    gate: "Gate Z15",
    coordinates: {
      originCoords: [50.0379, 8.5622],
      destCoords: [37.6213, -122.3790],
      currentLat: 58.50,
      currentLng: -55.20
    }
  },
  {
    id: "UK814",
    flightNumber: "UK 814",
    airline: "Vistara",
    origin: "BLR",
    originCity: "Bengaluru",
    destination: "DEL",
    destinationCity: "Delhi",
    aircraft: "Airbus A320neo",
    tailNumber: "VT-TVA",
    status: "ON TIME",
    statusType: "ontime",
    statusLabel: "🟢 ON TIME",
    delayMinutes: 0,
    departure: "19:00 UTC",
    arrival: "21:45 UTC",
    bookedSeats: 154,
    availableSeats: 24,
    totalSeats: 178,
    affectedPax: 0,
    crewStatus: "Nominal",
    gate: "Gate 08",
    coordinates: {
      originCoords: [13.1986, 77.7066],
      destCoords: [28.5562, 77.1000],
      currentLat: 20.87,
      currentLng: 77.40
    }
  },
  {
    id: "AI102",
    flightNumber: "AI 102",
    airline: "Air India",
    origin: "JFK",
    originCity: "New York",
    destination: "DEL",
    destinationCity: "Delhi",
    aircraft: "Boeing 777-300ER",
    tailNumber: "VT-ALX",
    status: "IN FLIGHT",
    statusType: "inflight",
    statusLabel: "🔵 IN FLIGHT",
    delayMinutes: 0,
    departure: "18:00 UTC",
    arrival: "08:30 UTC",
    bookedSeats: 310,
    availableSeats: 30,
    totalSeats: 340,
    affectedPax: 0,
    crewStatus: "Nominal",
    gate: "Gate T4-02",
    coordinates: {
      originCoords: [40.6413, -73.7781],
      destCoords: [28.5562, 77.1000],
      currentLat: 52.30,
      currentLng: 15.40
    }
  }
];

export const globalNetworkSummaryData = {
  totalAirports: 18,
  activeFlights: 482,
  inFlight: 126,
  delayed: 14,
  critical: 6,
  affectedPassengers: 124,
  aircraftAvailable: 6,
  crewAvailable: 18
};
