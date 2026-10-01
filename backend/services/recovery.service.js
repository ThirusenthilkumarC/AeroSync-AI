import { isSupabaseConfigured, supabase } from '../config/supabase.js';
import { seedRecoveryPlans, seedRecoveryEvents } from '../data/seedData.js';

let recoveryPlansStore = [...seedRecoveryPlans];
let recoveryEventsStore = [...seedRecoveryEvents];

export const getRecoveryPlansService = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('recovery_plans').select('*');
      if (data?.length) return data;
    } catch (err) {
      console.warn('[RecoveryService] Supabase fallback:', err.message);
    }
  }
  return recoveryPlansStore;
};

export const getRecoveryPlanByIdService = async (id) => {
  return recoveryPlansStore.find(p => p.id === id || p.plan_version === id) || recoveryPlansStore[0];
};

export const generateRecoveryPlansService = async (params = {}) => {
  // Generates Plan V1, V2, V3 without any "bestPlan" label
  const newPlans = [
    {
      id: `rec-plan-v1-${Date.now()}`,
      plan_version: "V1",
      disruption_id: params.disruptionId || "dis-6e1234-atc",
      status: "GENERATED",
      affected_flights: ["6E 1234", "6E 2180"],
      aircraft_changes: "Swap tail VT-IFZ with standby aircraft VT-EXA at MAA hub.",
      crew_changes: "Reassign Capt. Vikas standby cockpit pair to 6E 2180 leg.",
      gate_changes: "Reassign DEL Gate A4 arrival to Remote Stand R14.",
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
      id: `rec-plan-v2-${Date.now()}`,
      plan_version: "V2",
      disruption_id: params.disruptionId || "dis-6e1234-atc",
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
      id: `rec-plan-v3-${Date.now()}`,
      plan_version: "V3",
      disruption_id: params.disruptionId || "dis-6e1234-atc",
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

  recoveryPlansStore = [...newPlans, ...recoveryPlansStore];
  return newPlans;
};

export const approveRecoveryPlanService = async (id, notes = '') => {
  const plan = await getRecoveryPlanByIdService(id);
  plan.status = "APPROVED";

  const newEvent = {
    id: `evt-${Date.now()}`,
    recovery_plan_id: plan.id,
    event_type: "OPERATOR_APPROVED",
    description: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC - Operator authorized Recovery Plan ${plan.plan_version}. Notes: ${notes || 'Approved in OCC Control Room'}`,
    event_time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC`,
    created_at: new Date().toISOString()
  };
  recoveryEventsStore.push(newEvent);

  return {
    success: true,
    planId: plan.id,
    planVersion: plan.plan_version,
    auditKey: `AIR-DGCA-REC-${Math.floor(1000 + Math.random() * 9000)}`,
    message: `Recovery Plan ${plan.plan_version} successfully authorized and dispatched to OCC telemetry network.`
  };
};

export const rejectRecoveryPlanService = async (id, reason = '') => {
  const plan = await getRecoveryPlanByIdService(id);
  plan.status = "REJECTED";

  const newEvent = {
    id: `evt-${Date.now()}`,
    recovery_plan_id: plan.id,
    event_type: "OPERATOR_REJECTED",
    description: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC - Operator rejected Recovery Plan ${plan.plan_version}. Reason: ${reason || 'Operator override'}`,
    event_time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC`,
    created_at: new Date().toISOString()
  };
  recoveryEventsStore.push(newEvent);

  return {
    success: true,
    planId: plan.id,
    planVersion: plan.plan_version,
    message: `Recovery Plan ${plan.plan_version} rejected. Autonomous solver requesting updated constraints.`
  };
};

export const getExplanationService = async (id) => {
  const plan = await getRecoveryPlanByIdService(id);
  return {
    planId: plan.id,
    action: `Assign alternate aircraft VT-EXA and Remote Stand R14 (${plan.plan_version})`,
    reasons: [
      "Hot standby aircraft VT-EXA available at MAA hub",
      "Correct aircraft category (Airbus A320neo)",
      "Standby crew pair (Capt. Vikas) fully compatible with zero FDTL risk",
      "Turnaround feasible within 18-minute ground slot",
      "Protects 21 high-yield connecting passengers for long-haul LHR departure",
      "Prevents 2 downstream delays across subsequent flight rotations"
    ],
    rejectedAlternatives: [
      {
        aircraft: "VT-IFZ",
        reason: "Turnaround time too tight (+45m knock-on delay to DEL)"
      },
      {
        aircraft: "VT-ANB",
        reason: "Boeing 787 widebody incompatible with regional MDU gate stand"
      }
    ]
  };
};

export const validateConstraintsService = async (recoveryParams = {}) => {
  const isDutyExceeded = recoveryParams.crewUnavailable || recoveryParams.forceExceedDuty;

  if (isDutyExceeded) {
    return {
      valid: false,
      validations: [
        { type: "AIRCRAFT_AVAILABILITY", status: "PASSED", message: "Aircraft VT-EXA available" },
        { type: "GATE_STAND_AVAILABILITY", status: "PASSED", message: "Stand R14 clear" }
      ],
      conflicts: [
        {
          type: "CREW_DUTY_LIMIT",
          crew: "CPT-9921 (Capt. Rajiv)",
          currentDuty: "11h 20m",
          requiredDuty: "12h 05m",
          message: "Crew duty constraint exceeded by +45m (DGCA FDTL Rule 12)"
        }
      ]
    };
  }

  return {
    valid: true,
    validations: [
      { type: "AIRCRAFT_AVAILABILITY", status: "PASSED", message: "Standby aircraft VT-EXA clear for departure" },
      { type: "CREW_DUTY_LIMIT", status: "PASSED", message: "Reserve cockpit pair (Capt. Vikas) remaining duty: 10h" },
      { type: "TURNAROUND_TIME", status: "PASSED", message: "Turnaround slot 24m matches 18m requirement" },
      { type: "GATE_STAND_AVAILABILITY", status: "PASSED", message: "DEL Remote Stand R14 assigned" },
      { type: "PASSENGER_CONNECTIONS", status: "PASSED", message: "21 of 26 passenger connections secured" }
    ],
    conflicts: []
  };
};

export const autoReplanService = async (params = {}) => {
  return {
    currentVersion: "V3",
    status: "RECALCULATED",
    timeline: [
      { time: "14:28 UTC", event: "Plan V1 generated" },
      { time: "14:31 UTC", event: "New disruption reported: DEL Gate A4 blocked" },
      { time: "14:32 UTC", event: "Plan V1 invalidated" },
      { time: "14:33 UTC", event: "AI Recalculation executed" },
      { time: "14:35 UTC", event: "Plan V2 generated" },
      { time: "14:36 UTC", event: "New constraint: Captain duty expired" },
      { time: "14:37 UTC", event: "Plan V3 generated & validated" }
    ],
    changes: [
      "Automated stand swap: Gate A4 → Stand R14",
      "Automated crew dispatch: Capt. Vikas standby pair activated",
      "Automated passenger notification dispatched"
    ]
  };
};

export const getDecisionReplayService = async (id) => {
  return recoveryEventsStore;
};
