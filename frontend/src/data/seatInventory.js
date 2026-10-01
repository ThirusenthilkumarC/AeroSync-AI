// Realistic Seat Inventory & Flight Availability Dataset

// Helper function to generate dynamic seats for a given flight layout
export const generateFlightSeats = (flightId, totalRows = 30) => {
  const seats = [];
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // Seeded deterministic generator based on flightId
  let seed = 0;
  for (let i = 0; i < flightId.length; i++) {
    seed += flightId.charCodeAt(i);
  }

  for (let row = 1; row <= totalRows; row++) {
    const rowStr = row < 10 ? `0${row}` : `${row}`;
    columns.forEach((col, colIdx) => {
      const seatNumber = `${rowStr}${col}`;
      
      // Deterministic seat status allocation
      const pseudoRand = (seed * 17 + row * 13 + colIdx * 7) % 100;
      let status = 'BOOKED';
      if (pseudoRand < 22) {
        status = 'AVAILABLE';
      } else if (pseudoRand >= 22 && pseudoRand < 26) {
        status = 'HELD';
      } else if (pseudoRand >= 26 && pseudoRand < 28) {
        status = 'BLOCKED';
      }

      const cabin = row <= 4 ? 'Business Class' : row <= 10 ? 'Premium Economy' : 'Economy';
      const type = (col === 'A' || col === 'F') ? 'Window' : (col === 'C' || col === 'D') ? 'Aisle' : 'Middle';

      seats.push({
        seatNumber,
        row: rowStr,
        column: col,
        status, // AVAILABLE, BOOKED, HELD, BLOCKED
        cabin,
        type
      });
    });
  }

  return seats;
};

// Summary metrics calculator
export const getSeatSummary = (seats) => {
  const total = seats.length;
  const booked = seats.filter(s => s.status === 'BOOKED').length;
  const available = seats.filter(s => s.status === 'AVAILABLE').length;
  const held = seats.filter(s => s.status === 'HELD').length;
  const blocked = seats.filter(s => s.status === 'BLOCKED').length;
  const load = total > 0 ? (((booked + held) / total) * 100).toFixed(1) : '0.0';

  return {
    totalSeats: total,
    bookedSeats: booked,
    availableSeats: available,
    heldSeats: held,
    blockedSeats: blocked,
    loadPercentage: `${load}%`
  };
};

export const availableFlightsData = [
  {
    id: "6E1234",
    flightNumber: "6E 1234",
    airline: "IndiGo",
    origin: "DEL",
    originName: "Delhi (DEL)",
    destination: "MAA",
    destinationName: "Chennai (MAA)",
    route: "DEL → MAA",
    departure: "18:30",
    arrival: "21:20",
    aircraft: "A320neo",
    tailNumber: "VT-IFZ",
    gate: "Gate A4",
    status: "Delayed (+90m)",
    statusType: "critical",
    delayMinutes: 90,
    totalRows: 30,
    seats: generateFlightSeats("6E1234", 30)
  },
  {
    id: "6E2180",
    flightNumber: "6E 2180",
    airline: "IndiGo",
    origin: "BOM",
    originName: "Mumbai (BOM)",
    destination: "DEL",
    destinationName: "Delhi (DEL)",
    route: "BOM → DEL",
    departure: "19:15",
    arrival: "21:30",
    aircraft: "A321",
    tailNumber: "VT-IMQ",
    gate: "Gate B2",
    status: "On Time",
    statusType: "normal",
    delayMinutes: 0,
    totalRows: 31,
    seats: generateFlightSeats("6E2180", 31)
  },
  {
    id: "AI206",
    flightNumber: "AI 206",
    airline: "Air India",
    origin: "MDU",
    originName: "Madurai (MDU)",
    destination: "MAA",
    destinationName: "Chennai (MAA)",
    route: "MDU → MAA",
    departure: "18:45",
    arrival: "19:50",
    aircraft: "A320neo",
    tailNumber: "VT-EXA",
    gate: "Gate 02",
    status: "On Time",
    statusType: "normal",
    delayMinutes: 0,
    totalRows: 30,
    seats: generateFlightSeats("AI206", 30)
  },
  {
    id: "AI208",
    flightNumber: "AI 208",
    airline: "Air India",
    origin: "MDU",
    originName: "Madurai (MDU)",
    destination: "MAA",
    destinationName: "Chennai (MAA)",
    route: "MDU → MAA",
    departure: "20:10",
    arrival: "21:15",
    aircraft: "A320neo",
    tailNumber: "VT-ANK",
    gate: "Gate 04",
    status: "On Time",
    statusType: "normal",
    delayMinutes: 0,
    totalRows: 30,
    seats: generateFlightSeats("AI208", 30)
  },
  {
    id: "AI212",
    flightNumber: "AI 212",
    airline: "Air India",
    origin: "MDU",
    originName: "Madurai (MDU)",
    destination: "MAA",
    destinationName: "Chennai (MAA)",
    route: "MDU → MAA",
    departure: "21:30",
    arrival: "22:35",
    aircraft: "A321",
    tailNumber: "VT-TVA",
    gate: "Gate 01",
    status: "On Time",
    statusType: "normal",
    delayMinutes: 0,
    totalRows: 31,
    seats: generateFlightSeats("AI212", 31)
  },
  {
    id: "UK814",
    flightNumber: "UK 814",
    airline: "Vistara",
    origin: "DEL",
    originName: "Delhi (DEL)",
    destination: "BLR",
    destinationName: "Bengaluru (BLR)",
    route: "DEL → BLR",
    departure: "19:30",
    arrival: "22:15",
    aircraft: "A320neo",
    tailNumber: "VT-TVE",
    gate: "Gate T3-08",
    status: "On Time",
    statusType: "normal",
    delayMinutes: 0,
    totalRows: 30,
    seats: generateFlightSeats("UK814", 30)
  }
];

export const networkDestinationAvailability = [
  { route: "DEL → MAA", origin: "DEL", destination: "MAA", flightsCount: 8, totalAvailableSeats: 126, nextDeparture: "18:30 UTC" },
  { route: "DEL → BLR", origin: "DEL", destination: "BLR", flightsCount: 9, totalAvailableSeats: 167, nextDeparture: "19:00 UTC" },
  { route: "DEL → MDU", origin: "DEL", destination: "MDU", flightsCount: 3, totalAvailableSeats: 41, nextDeparture: "20:15 UTC" },
  { route: "BOM → DEL", origin: "BOM", destination: "DEL", flightsCount: 12, totalAvailableSeats: 210, nextDeparture: "19:15 UTC" },
  { route: "MDU → MAA", origin: "MDU", destination: "MAA", flightsCount: 4, totalAvailableSeats: 105, nextDeparture: "18:45 UTC" }
];
