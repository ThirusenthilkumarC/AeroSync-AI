export const seedFlights = [
  {
    id: "flt-6e1234",
    flight_number: "6E 1234",
    airline: "IndiGo",
    origin: "MDU",
    destination: "MAA",
    scheduled_departure: "2026-09-30T18:30:00Z",
    estimated_departure: "2026-09-30T19:15:00Z",
    scheduled_arrival: "2026-09-30T19:40:00Z",
    estimated_arrival: "2026-09-30T20:25:00Z",
    status: "DELAYED",
    delay_minutes: 45,
    aircraft_id: "ac-vtifz",
    crew_id: "crw-capt-rajiv",
    gate_id: "gate-mdu-g2",
    passenger_count: 164,
    risk_level: "HIGH",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "flt-6e2180",
    flight_number: "6E 2180",
    airline: "IndiGo",
    origin: "MAA",
    destination: "DEL",
    scheduled_departure: "2026-09-30T20:15:00Z",
    estimated_departure: "2026-09-30T21:00:00Z",
    scheduled_arrival: "2026-09-30T22:55:00Z",
    estimated_arrival: "2026-09-30T23:40:00Z",
    status: "AT_RISK",
    delay_minutes: 45,
    aircraft_id: "ac-vtifz",
    crew_id: "crw-capt-rajiv",
    gate_id: "gate-maa-g4",
    passenger_count: 180,
    risk_level: "CRITICAL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "flt-ai204",
    flight_number: "AI 204",
    airline: "Air India",
    origin: "DEL",
    destination: "LHR",
    scheduled_departure: "2026-09-30T23:30:00Z",
    estimated_departure: "2026-09-30T23:55:00Z",
    scheduled_arrival: "2026-10-01T04:15:00Z",
    estimated_arrival: "2026-10-01T04:40:00Z",
    status: "SCHEDULED",
    delay_minutes: 25,
    aircraft_id: "ac-vtanb",
    crew_id: "crw-capt-vikas",
    gate_id: "gate-del-a4",
    passenger_count: 242,
    risk_level: "MEDIUM",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "flt-ek542",
    flight_number: "EK 542",
    airline: "Emirates",
    origin: "DXB",
    destination: "MAA",
    scheduled_departure: "2026-09-30T17:10:00Z",
    estimated_departure: "2026-09-30T17:10:00Z",
    scheduled_arrival: "2026-09-30T22:30:00Z",
    estimated_arrival: "2026-09-30T22:30:00Z",
    status: "IN_FLIGHT",
    delay_minutes: 0,
    aircraft_id: "ac-a6xxx",
    crew_id: "crw-capt-tariq",
    gate_id: "gate-maa-g8",
    passenger_count: 312,
    risk_level: "LOW",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const seedAircraft = [
  {
    id: "ac-vtifz",
    tail_number: "VT-IFZ",
    aircraft_type: "Airbus A320neo",
    current_location: "MDU",
    status: "IN_SERVICE",
    next_flight_id: "flt-6e1234",
    availability: "IN_TURNAROUND",
    maintenance_status: "NOMINAL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ac-vtanb",
    tail_number: "VT-ANB",
    aircraft_type: "Boeing 787-9",
    current_location: "DEL",
    status: "AVAILABLE",
    next_flight_id: "flt-ai204",
    availability: "STANDBY_HUB",
    maintenance_status: "NOMINAL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ac-vtexa",
    tail_number: "VT-EXA",
    aircraft_type: "Airbus A320neo",
    current_location: "MAA",
    status: "HOT_STANDBY",
    next_flight_id: null,
    availability: "IMMEDIATE",
    maintenance_status: "NOMINAL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const seedCrew = [
  {
    id: "crw-capt-rajiv",
    crew_code: "CPT-9921",
    name: "Capt. Rajiv Sharma & FO Rao",
    role: "Cockpit Pair",
    current_flight_id: "flt-6e1234",
    duty_minutes: 680,
    remaining_duty_minutes: 40,
    status: "DUTY_LIMIT_NEAR",
    next_assignment: "flt-6e2180",
    risk_level: "HIGH",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "crw-capt-vikas",
    crew_code: "CPT-4402",
    name: "Capt. Vikas & FO Mehra",
    role: "Cockpit Standby",
    current_flight_id: null,
    duty_minutes: 120,
    remaining_duty_minutes: 600,
    status: "STANDBY_RESERVE",
    next_assignment: "READY_DISPATCH",
    risk_level: "LOW",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const seedGates = [
  {
    id: "gate-del-a4",
    gate_code: "DEL Gate A4",
    terminal: "Terminal 3",
    current_flight_id: "flt-ai204",
    next_flight_id: "flt-6e2180",
    status: "OCCUPIED",
    conflict_status: "CONFLICT_ALERT",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "gate-del-r14",
    gate_code: "DEL Stand R14",
    terminal: "Remote Bay Pier",
    current_flight_id: null,
    next_flight_id: null,
    status: "AVAILABLE",
    conflict_status: "NOMINAL",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const seedPassengers = [
  {
    id: "pax-001",
    pnr: "PNR-LHR-8821",
    passenger_name: "Anita & Family (4 Pax)",
    flight_id: "flt-6e2180",
    connection_flight_id: "flt-ai204",
    connection_status: "CRITICAL_RISK",
    priority: "HIGH_YIELD",
    rebooking_required: true,
    hotel_required: false,
    special_assistance: false,
    risk_level: "HIGH",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const seedDisruptions = [
  {
    id: "dis-6e1234-atc",
    flight_id: "flt-6e1234",
    disruption_type: "ATC_GROUND_HOLD",
    description: "MDU ATC ground hold (+45m initial delay due to severe weather system). Knock-on turnaround pressure at MAA hub.",
    severity: "CRITICAL",
    delay_minutes: 45,
    detected_at: new Date().toISOString(),
    status: "ACTIVE",
    affected_flights: ["6E 1234", "6E 2180", "AI 204"],
    affected_passengers: 142,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const seedRecoveryPlans = [
  {
    id: "rec-plan-v1",
    plan_version: "V1",
    disruption_id: "dis-6e1234-atc",
    status: "GENERATED",
    affected_flights: ["6E 1234", "6E 2180"],
    aircraft_changes: "Swap tail VT-IFZ with hot standby aircraft VT-EXA at MAA hub.",
    crew_changes: "Reassign Capt. Vikas standby cockpit pair to 6E 2180 leg.",
    gate_changes: "Reassign DEL Gate A4 inbound arrival to Remote Stand R14.",
    passenger_impact: "Protect 21 connecting passengers for long-haul LHR connection.",
    estimated_delay: 15,
    operational_cost: 14200,
    fuel_impact: 180,
    network_impact: "Low",
    recovery_confidence: "98.4%",
    explanation: "Swapping aircraft and gate prevents total duty hour expiration for cockpit crew and clears DEL gate bottleneck.",
    created_at: new Date().toISOString()
  },
  {
    id: "rec-plan-v2",
    plan_version: "V2",
    disruption_id: "dis-6e1234-atc",
    status: "GENERATED",
    affected_flights: ["6E 1234", "6E 2180", "AI 204"],
    aircraft_changes: "Maintain VT-IFZ with expedited turnaround protocol.",
    crew_changes: "Extend Capt. Rajiv duty limit by +15m with regulatory exception.",
    gate_changes: "Hold DEL Gate A4 for 20 minutes.",
    passenger_impact: "Hold connecting gate for 14 passengers.",
    estimated_delay: 28,
    operational_cost: 21500,
    fuel_impact: 340,
    network_impact: "Medium",
    recovery_confidence: "91.2%",
    explanation: "Saves aircraft swap operational cost but carries higher crew FDTL risk.",
    created_at: new Date().toISOString()
  },
  {
    id: "rec-plan-v3",
    plan_version: "V3",
    disruption_id: "dis-6e1234-atc",
    status: "GENERATED",
    affected_flights: ["6E 1234"],
    aircraft_changes: "No aircraft swap.",
    crew_changes: "Full standby crew dispatch.",
    gate_changes: "Standard gate allocation.",
    passenger_impact: "Rebook 8 non-critical passengers to next morning flight.",
    estimated_delay: 35,
    operational_cost: 9800,
    fuel_impact: 120,
    network_impact: "Low",
    recovery_confidence: "94.6%",
    explanation: "Lowest cost option but leaves 8 non-connecting passengers rebooked.",
    created_at: new Date().toISOString()
  }
];

export const seedRecoveryEvents = [
  {
    id: "evt-1",
    recovery_plan_id: "rec-plan-v1",
    event_type: "DISRUPTION_DETECTED",
    description: "14:20 UTC - Initial disruption detected for 6E 1234 at MDU (+45m ATC hold).",
    event_time: "14:20 UTC",
    created_at: new Date().toISOString()
  },
  {
    id: "evt-2",
    recovery_plan_id: "rec-plan-v1",
    event_type: "AIRCRAFT_IMPACT",
    description: "14:22 UTC - Aircraft turnaround impact detected on VT-IFZ.",
    event_time: "14:22 UTC",
    created_at: new Date().toISOString()
  },
  {
    id: "evt-3",
    recovery_plan_id: "rec-plan-v1",
    event_type: "CREW_CONFLICT",
    description: "14:24 UTC - Crew duty conflict detected for Capt. Rajiv.",
    event_time: "14:24 UTC",
    created_at: new Date().toISOString()
  },
  {
    id: "evt-4",
    recovery_plan_id: "rec-plan-v1",
    event_type: "PASSENGER_IMPACT",
    description: "14:26 UTC - 26 connecting passengers at risk for DEL LHR flight.",
    event_time: "14:26 UTC",
    created_at: new Date().toISOString()
  },
  {
    id: "evt-5",
    recovery_plan_id: "rec-plan-v1",
    event_type: "PLAN_GENERATED",
    description: "14:28 UTC - Autonomous Solver generated Recovery Plan V1.",
    event_time: "14:28 UTC",
    created_at: new Date().toISOString()
  },
  {
    id: "evt-6",
    recovery_plan_id: "rec-plan-v1",
    event_type: "OPERATOR_APPROVED",
    description: "14:37 UTC - Chief Ops Controller approved Recovery Plan V1.",
    event_time: "14:37 UTC",
    created_at: new Date().toISOString()
  }
];

export const seedNotifications = [
  {
    id: "notif-1",
    category: "DISRUPTION",
    title: "MDU ATC Hold Active",
    message: "Flight 6E 1234 delayed by 45m. Downstream impact detected on 6E 2180.",
    severity: "CRITICAL",
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: "notif-2",
    category: "CREW_FDTL",
    title: "Crew FDTL Expiration Warning",
    message: "Capt. Rajiv remaining duty time is 40m. Hot standby pair Vikas & FO Mehra ready.",
    severity: "HIGH",
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: "notif-3",
    category: "RECOVERY_PLAN",
    title: "AI Solution REC-982-A Ready",
    message: "Recovery Plan V1 ready for authorization. 98.4% feasibility index.",
    severity: "INFO",
    is_read: true,
    created_at: new Date().toISOString()
  }
];
