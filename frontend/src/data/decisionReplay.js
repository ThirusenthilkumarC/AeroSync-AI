export const decisionEvents = [
  {
    id: "evt-1",
    timestamp: "14:20 UTC",
    title: "Initial Disruption Flagged",
    type: "incident",
    description: "MAA dispatch radar ingested 45m weather hold + hydraulic valve warning on VT-IFZ (Flight 6E 1234).",
    severity: "warning",
    details: {
      flight: "6E 1234",
      station: "MAA",
      delay: "+45m",
      cause: "Weather + Tech"
    }
  },
  {
    id: "evt-2",
    timestamp: "14:22 UTC",
    title: "Aircraft Downstream Impact Detected",
    type: "domino",
    description: "Neural Solver calculated downstream turnaround delay on leg 6E 1892 (DEL → BOM).",
    severity: "warning",
    details: {
      downstreamFlight: "6E 1892",
      tailAtRisk: "VT-IFZ",
      potentialDelay: "+65m"
    }
  },
  {
    id: "evt-3",
    timestamp: "14:24 UTC",
    title: "Crew FDTL Conflict Triggered",
    type: "constraint",
    description: "Capt. Rajiv Sen (Crew R-12) identified as breaching mandatory DGCA rest period by +22m.",
    severity: "critical",
    details: {
      crewId: "DEL-Base R12",
      duty: "11h 20m",
      status: "FDTL Exceeded"
    }
  },
  {
    id: "evt-4",
    timestamp: "14:26 UTC",
    title: "Passenger Misconnection Risk Calculated",
    type: "pax",
    description: "24 transit passengers flagged for tight connections to 6E 502 (DEL → LHR) and 6E 204 (DEL → DXB).",
    severity: "warning",
    details: {
      paxCount: 24,
      criticalFlights: ["6E 502", "6E 204"],
      connectionWindow: "18m"
    }
  },
  {
    id: "evt-5",
    timestamp: "14:28 UTC",
    title: "Recovery Plan V1 Generated",
    type: "ai_plan",
    description: "Multi-Agent Synthesis Engine synthesized Plan V1 (Tail Swap VT-EXA + Crew R-02 + Gate B4).",
    severity: "info",
    details: {
      planId: "V1",
      confidence: "96.8%",
      estimatedSavings: "$42,500"
    }
  },
  {
    id: "evt-6",
    timestamp: "14:32 UTC",
    title: "Plan V1 Invalidated by Controller",
    type: "override",
    description: "Controller requested alternate simulation with strict remote stand requirement.",
    severity: "warning",
    details: {
      reason: "Controller requested test of remote apron stand"
    }
  },
  {
    id: "evt-7",
    timestamp: "14:35 UTC",
    title: "Recovery Plan V2 Synthesized & Revalidated",
    type: "ai_plan",
    description: "AI Auto-Replan recalculated Plan V2 incorporating updated crew duty constraints.",
    severity: "info",
    details: {
      planId: "V2",
      confidence: "98.4%",
      status: "Awaiting Staff Authorization"
    }
  },
  {
    id: "evt-8",
    timestamp: "14:37 UTC",
    title: "Operator Authorization Completed",
    type: "approval",
    description: "Chief Ops Controller Capt. Neha Sharma executed and authorized Plan V2 into live flight schedule.",
    severity: "success",
    details: {
      authorizedBy: "Capt. Neha Sharma (ID: 4409)",
      auditKey: "AIR-DGCA-REC-9042"
    }
  }
];
