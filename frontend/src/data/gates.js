export const gatesData = [
  {
    gate: "Gate A4",
    terminal: "DEL Terminal 3 (International/Domestic Pier)",
    currentFlight: "6E 2108 (BOM → DEL, Est 21:30)",
    nextFlight: "6E 1234 (MAA → DEL, Est 22:50)",
    status: "Conflict",
    conflictDetails: "Dual occupancy hazard detected. 6E 1234 delay causes 80-minute gate block overlap with 6E 2108.",
    recommendedGate: "Gate B4 or Remote Stand R14",
    occupancyType: "Inbound Stand Conflict",
    jetbridgeType: "Dual Jetbridge"
  },
  {
    gate: "Gate B4",
    terminal: "DEL Terminal 3 (Domestic Pier West)",
    currentFlight: "Vacant (Deboarding 6E 892 complete)",
    nextFlight: "Available for 6E 1234 Reassignment",
    status: "Clear / Available",
    conflictDetails: "None. Available immediately until 23:45 UTC.",
    recommendedGate: "Gate B4",
    occupancyType: "Vacant Stand",
    jetbridgeType: "Single Jetbridge"
  },
  {
    gate: "Remote Stand R14",
    terminal: "DEL Apron West",
    currentFlight: "Vacant",
    nextFlight: "Available for Emergency Standby",
    status: "Clear / Standby",
    conflictDetails: "Requires airside bus transfer for 174 pax.",
    recommendedGate: "Remote Stand R14",
    occupancyType: "Remote Apron Stand",
    jetbridgeType: "Tarmac Bus Shuttle"
  },
  {
    gate: "Gate T3-12",
    terminal: "DEL Terminal 3 (Wide-Body Intl Pier)",
    currentFlight: "6E 502 (DEL → LHR)",
    nextFlight: "6E 701 (DEL → CDG)",
    status: "Occupied / Nominal",
    conflictDetails: "None. Wide-body jetbridge assigned.",
    recommendedGate: "Gate T3-12",
    occupancyType: "Wide-Body Gate",
    jetbridgeType: "Dual Wide-Body Bridge"
  },
  {
    gate: "Gate B2",
    terminal: "DEL Terminal 3",
    currentFlight: "6E 892 (Deboarding)",
    nextFlight: "6E 304",
    status: "Deboarding",
    conflictDetails: "None",
    recommendedGate: "Gate B2",
    occupancyType: "Domestic Gate",
    jetbridgeType: "Single Jetbridge"
  }
];
