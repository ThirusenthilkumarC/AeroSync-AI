export const recoveryPlans = [
  {
    id: "plan-a",
    version: "V1",
    name: "Recovery Plan A (Synthetic Baseline)",
    subtitle: "Swap Tail VT-EXA • Deploy Reserve Crew R-02 • Move 6E 1234 to Gate B4",
    confidence: "96.8%",
    determinism: "High Determinism",
    estimatedSavings: "$42,500",
    netDelayRecovery: "-90 min",
    fuelImpact: "+140 kg (Mach 0.82 Throttle)",
    networkImpact: "72% Reduction in Downstream Ripple",
    affectedFlightsCount: 2,
    actions: [
      {
        id: "act-1",
        category: "FLEET SWAP",
        title: "Assign alternate aircraft VT-EXA",
        description: "Swap unserviceable aircraft VT-IFZ with Standby A320neo (VT-EXA) positioned at DEL Hub Apron West. Eliminates downstream knock-on delay for flight 6E 1892 (DEL → BLR).",
        impactBadge: "+$18.2k NET RETENTION",
        recoveryDelta: "-65 min downstream recovery",
        confidence: "99%",
        status: "Ready in 14m (Refueled)",
        checked: true,
        reasons: [
          "✓ Aircraft available (VT-EXA refueled at DEL Apron West)",
          "✓ Correct aircraft category (A320neo class match)",
          "✓ Crew compatible with cockpit layout",
          "✓ Turnaround feasible in 25 minutes",
          "✓ Protects 186 passengers on downstream leg 6E 1892"
        ],
        rejectedAlternatives: [
          "✕ VT-IFZ — Maintenance hold for hydraulic inspection",
          "✕ VT-KLM — Arrives from BLR 40 minutes too late"
        ]
      },
      {
        id: "act-2",
        category: "CREW ROSTER",
        title: "Reassign available crew (Standby Bravo)",
        description: "Deploy Reserve Cockpit Crew R-02 (Capt. Vikas Sharma, FO Sneha Rao) resting at DEL Terminal 3 Lounge. Complies 100% with DGCA Flight Duty Time Limitations (FDTL).",
        impactBadge: "100% DGCA SAFE",
        recoveryDelta: "Zero duty violation",
        confidence: "98%",
        status: "Transit Time: 8 min",
        checked: true,
        reasons: [
          "✓ Crew R-02 has 9h 30m legal duty remaining",
          "✓ Resting at DEL T3 lounge (8m transit time to gate)",
          "✓ Type-rated on Airbus A320neo",
          "✓ Prevents FDTL lockout for Capt. Rajiv Sen"
        ],
        rejectedAlternatives: [
          "✕ Capt. Rajiv Sen (Crew R-12) — Exceeds DGCA duty limit by 22 mins",
          "✕ Crew R-99 — In mandatory 12h rest period"
        ]
      },
      {
        id: "act-3",
        category: "GROUND OPS",
        title: "Move flight to Gate B4",
        description: "Reassign arrival and turnaround gate from congested Gate A4 to Gate B4 (currently vacant until 23:45). Prevents runway tarmac holding and remote busing of incoming 6E 2108.",
        impactBadge: "-22 min TAXI LAG AVOIDED",
        recoveryDelta: "Zero tarmac hold time",
        confidence: "95%",
        status: "Tug Auto-Routed",
        checked: true,
        reasons: [
          "✓ Gate B4 vacant until 23:45 UTC",
          "✓ Resolves dual-occupancy collision with 6E 2108 at Gate A4",
          "✓ Direct jetbridge access for rapid deboarding"
        ],
        rejectedAlternatives: [
          "✕ Gate A4 — Inbound 6E 2108 collision at 21:30",
          "✕ Remote Stand R14 — Requires 4 passenger buses (+15m delay)"
        ]
      },
      {
        id: "act-4",
        category: "GUEST EXPERIENCE",
        title: "Protect connecting passengers",
        description: "16 passengers auto-transferred to Express Airside Buggy at Gate B4 for tight domestic connection; 8 international passengers auto-rebooked on partner codeshare 6E 504 (departing +45m).",
        impactBadge: "24 / 24 PAX PROTECTED",
        recoveryDelta: "108% passengers protected from stranding",
        confidence: "97%",
        status: "$0 Hotel Voucher Cost",
        checked: true,
        reasons: [
          "✓ Express Airside Buggy pre-dispatched to Gate B4",
          "✓ Baggage handlers notified for priority transfer",
          "✓ Zero hotel stranding cost"
        ],
        rejectedAlternatives: [
          "✕ Standard Walking Connection — High probability of 24 missed connections"
        ]
      },
      {
        id: "act-5",
        category: "COMMS MESH",
        title: "Update passenger notifications",
        description: "Send personalized SMS, WhatsApp, and AeroSync app notification payloads with updated baggage belt sequence, Gate B4 walking waypoint map, and revised barcode boarding pass.",
        impactBadge: "186 QUEUED SMS/APP",
        recoveryDelta: "Instant broadcast dispatched upon approval",
        confidence: "100%",
        status: "3 Local Languages + EN",
        checked: true,
        reasons: [
          "✓ Automated SMS/WhatsApp dispatch ready",
          "✓ Real-time gate walking map generated"
        ],
        rejectedAlternatives: []
      }
    ]
  },
  {
    id: "plan-b",
    version: "V2",
    name: "Recovery Plan B (Crew & Tarmac Shuttle Replan)",
    subtitle: "Keep VT-IFZ • Swap Crew to R-02 • Assign Remote Stand R14",
    confidence: "91.4%",
    determinism: "Moderate Determinism",
    estimatedSavings: "$28,900",
    netDelayRecovery: "-55 min",
    fuelImpact: "+40 kg",
    networkImpact: "55% Reduction in Downstream Ripple",
    affectedFlightsCount: 3,
    actions: [
      {
        id: "act-b1",
        category: "FLEET MAINTAIN",
        title: "Retain VT-IFZ after Quick Valve Flush",
        description: "Perform fast-track 20-minute hydraulic valve flush at MAA instead of full tail swap.",
        impactBadge: "+$10.5k RETENTION",
        recoveryDelta: "-35 min downstream recovery",
        confidence: "88%",
        status: "Maintenance Pending",
        checked: true,
        reasons: [
          "✓ Saves ferry flight cost of VT-EXA",
          "✓ Avoids aircraft repositioning"
        ],
        rejectedAlternatives: [
          "✕ Risk of secondary valve anomaly mid-flight"
        ]
      },
      {
        id: "act-b2",
        category: "CREW ROSTER",
        title: "Assign Standby Crew R-02 at DEL",
        description: "Deploy Crew R-02 upon arrival at DEL to take over leg 6E 1892.",
        impactBadge: "100% DGCA SAFE",
        recoveryDelta: "Zero duty breach",
        confidence: "98%",
        status: "Ready",
        checked: true,
        reasons: ["✓ FDTL complaint"],
        rejectedAlternatives: []
      },
      {
        id: "act-b3",
        category: "GROUND OPS",
        title: "Assign Remote Stand R14 with Tarmac Bus Shuttle",
        description: "Route 6E 1234 to Remote Stand R14 to keep Gate A4 clear for 6E 2108.",
        impactBadge: "STAND CONFLICT SOLVED",
        recoveryDelta: "-10 min taxi lag",
        confidence: "90%",
        status: "Bus Shuttle Dispatched",
        checked: true,
        reasons: ["✓ Resolves Gate A4 conflict"],
        rejectedAlternatives: ["✕ 15 min extra deboarding time for pax busing"]
      }
    ]
  },
  {
    id: "plan-c",
    version: "V3",
    name: "Recovery Plan C (Conservative Slot Delay & Hold)",
    subtitle: "Delay 6E 1234 by +110m • Hold Gate A4 • Hold Connecting Flights 6E 502 & 6E 204",
    confidence: "84.2%",
    determinism: "Low Determinism",
    estimatedSavings: "$12,400",
    netDelayRecovery: "-20 min",
    fuelImpact: "+650 kg (Holding pattern)",
    networkImpact: "30% Reduction in Downstream Ripple",
    affectedFlightsCount: 4,
    actions: [
      {
        id: "act-c1",
        category: "SLOT HOLD",
        title: "Hold 6E 502 & 6E 204 by 15 Minutes at DEL",
        description: "Delay departure of long-haul 6E 502 (DEL -> LHR) by 15 mins to absorb connecting pax.",
        impactBadge: "PAX PROTECTED",
        recoveryDelta: "24 pax saved",
        confidence: "82%",
        status: "Slot Buffer Requested",
        checked: true,
        reasons: ["✓ Connects all 24 pax"],
        rejectedAlternatives: ["✕ Causes 15m delay to LHR flight"]
      }
    ]
  }
];

export const constraintValidations = [
  { title: "Aircraft Availability", status: "PASS", detail: "VT-EXA Standby ready at DEL Apron West", icon: "check_circle" },
  { title: "Crew FDTL Limits", status: "PASS", detail: "Crew R-02 has 9h 30m duty buffer remaining", icon: "check_circle" },
  { title: "Turnaround Feasibility", status: "PASS", detail: "25 min turnaround window validated by AI Ground Engine", icon: "check_circle" },
  { title: "Gate Occupancy Conflict", status: "PASS", detail: "Gate B4 allocated; Gate A4 collision cleared", icon: "check_circle" },
  { title: "Passenger Connection Feasibility", status: "PASS", detail: "Express buggy transfer window 14m > 10m threshold", icon: "check_circle" },
  { title: "Aircraft Type Compatibility", status: "PASS", detail: "A320neo category match", icon: "check_circle" }
];
