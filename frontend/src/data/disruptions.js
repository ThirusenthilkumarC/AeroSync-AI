export const activeDisruptions = [
  {
    id: "DIS-2024-8841",
    incidentCode: "INC-MAA-9921",
    priority: "ALPHA-1",
    flightId: "6E1234",
    flightNumber: "6E 1234",
    route: "Chennai (MAA) → Delhi (DEL)",
    scheduledDep: "18:30",
    estDep: "20:00",
    scheduledArr: "21:20",
    estArr: "22:50",
    delayMinutes: 90,
    tailNumber: "VT-IFZ",
    bayLocation: "Bay 14R (MAA)",
    paxCount: 174,
    paxCapacity: 186,
    loadFactor: "93.5%",
    rootCauseCategory: "Dual Anomaly",
    rootCause: "Inbound aircraft technical inspection (Hydraulic Valve) & ATC En-route weather restriction",
    timeElapsed: "00:18:42",
    neuralDepth: "4 tiers",
    solverConfidence: "98.4% Optimal",
    cascadingNodes: [
      {
        id: "NODE-01",
        stage: "01",
        title: "FLIGHT DELAY",
        subtitle: "+90 min",
        badge: "IMPACT: HIGH",
        badgeType: "critical",
        description: "Ground hold applied at MAA runway queue due to radar corridor congestion. Revised pushback allocated.",
        details: "Depart MAA: 20:00 • Arrival DEL: 22:50 • Buffer: Exhausted"
      },
      {
        id: "NODE-02",
        stage: "02",
        title: "AIRCRAFT IMPACT",
        subtitle: "VT-IFZ Tail at Risk",
        badge: "TAIL AT RISK",
        badgeType: "warning",
        description: "Airbus A320neo turnaround cycle compressed below safety tolerance threshold at Terminal 3.",
        details: "Consequence: 6E 1892 (DEL → BOM) next scheduled rotation delayed by 65 mins if aircraft swap is not authorized within 28 minutes."
      },
      {
        id: "NODE-03",
        stage: "03",
        title: "CREW IMPACT",
        subtitle: "Capt. Rajiv & FO",
        badge: "FDTL BREACH",
        badgeType: "critical",
        description: "Capt. R. Sen & FO A. Menon will breach mandatory DGCA Flight Duty Time Limitation (FDTL).",
        details: "+22m limit • Hard Lockout 103.8% FDTL • Standby Reserve: 3 at DEL (Must Reassign)"
      },
      {
        id: "NODE-04",
        stage: "04",
        title: "GATE CONFLICT",
        subtitle: "Gate A4 Collision",
        badge: "APRON RADAR",
        badgeType: "critical",
        description: "Delhi Terminal 3 — Gate A4 is currently scheduled for 6E 2108 arriving at 21:30.",
        details: "Dual-occupancy hazard identified by AI radar • Recommended Gate: Gate B4"
      },
      {
        id: "NODE-05",
        stage: "05",
        title: "CONNECTING PASSENGERS",
        subtitle: "24 Pax at Risk",
        badge: "MISCONNECT RISK",
        badgeType: "warning",
        description: "Critical tight connection to DEL → London (6E 502) and DEL → Dubai (6E 204).",
        details: "DEL → London (6E 502): 14 Pax (18m window) • DEL → Dubai (6E 204): 10 Pax (24m window)"
      },
      {
        id: "NODE-06",
        stage: "06",
        title: "OTHER FLIGHTS IMPACT",
        subtitle: "Downstream Network Ripple",
        badge: "FINANCIAL RISK",
        badgeType: "critical",
        description: "2 onward flights affected with cumulative knock-on propagation into overnight turn schedules.",
        details: "Estimated Compensation Exposure: $18,400 (EU261 / DGCA CAR Section) • Mitigatable: 82%"
      }
    ]
  }
];
