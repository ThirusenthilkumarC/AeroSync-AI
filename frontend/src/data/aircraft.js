export const aircraftData = [
  {
    tailNumber: "VT-EXA",
    type: "A320neo",
    location: "DEL Hub (Apron West)",
    status: "Standby / Available",
    availability: "Immediate (Refueled)",
    nextFlight: "Available for Swap",
    maintenanceStatus: "Cleared",
    category: "Narrow-body Jet",
    turnaroundTimeFeasible: true,
    crewCompatible: true
  },
  {
    tailNumber: "VT-IFZ",
    type: "A320neo",
    location: "MAA Bay 14R",
    status: "Delayed / Affected",
    availability: "In Service (+90m delay)",
    nextFlight: "6E 1234 -> 6E 1892",
    maintenanceStatus: "Hydraulic Valve Inspection Pending",
    category: "Narrow-body Jet",
    turnaroundTimeFeasible: false,
    crewCompatible: false
  },
  {
    tailNumber: "VT-IMQ",
    type: "A321neo",
    location: "BOM Hub",
    status: "Active / On Duty",
    availability: "Assigned to 6E 2108",
    nextFlight: "6E 2108 (BOM → DEL)",
    maintenanceStatus: "Cleared",
    category: "Narrow-body Jet",
    turnaroundTimeFeasible: true,
    crewCompatible: true
  },
  {
    tailNumber: "VT-ALX",
    type: "B777-300ER",
    location: "DEL Terminal 3",
    status: "Active / Long-haul",
    availability: "Assigned to 6E 502",
    nextFlight: "6E 502 (DEL → LHR)",
    maintenanceStatus: "Cleared",
    category: "Wide-body Jet",
    turnaroundTimeFeasible: true,
    crewCompatible: true
  },
  {
    tailNumber: "VT-IZR",
    type: "A320neo",
    location: "DEL Gate B2",
    status: "Landed / Deboarding",
    availability: "Available in 35m",
    nextFlight: "6E 904 (DEL → CCU)",
    maintenanceStatus: "Cleared",
    category: "Narrow-body Jet",
    turnaroundTimeFeasible: true,
    crewCompatible: true
  },
  {
    tailNumber: "VT-KLM",
    type: "A320neo",
    location: "BLR Hub",
    status: "Maintenance Hold",
    availability: "Unavailable",
    nextFlight: "Unassigned",
    maintenanceStatus: "Scheduled C-Check",
    category: "Narrow-body Jet",
    turnaroundTimeFeasible: false,
    crewCompatible: false
  }
];
