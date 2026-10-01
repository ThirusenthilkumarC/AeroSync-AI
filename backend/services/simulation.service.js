export const runSimulationService = async (scenarioParams = {}) => {
  const {
    aircraftUnavailable = false,
    crewUnavailable = false,
    gateUnavailable = false,
    delayMinutes = 45,
    flightCancellation = false,
    connectionFailure = false
  } = scenarioParams;

  const baseCost = 8000 + (delayMinutes * 150) + (flightCancellation ? 25000 : 0) + (aircraftUnavailable ? 12000 : 0);
  const basePax = 48 + Math.floor(delayMinutes * 1.5) + (flightCancellation ? 164 : 0);

  return {
    flightsAffected: flightCancellation ? 4 : (aircraftUnavailable ? 3 : 2),
    passengersAffected: basePax,
    crewAffected: crewUnavailable ? 4 : 2,
    estimatedCost: baseCost,
    networkDelay: `${delayMinutes + (aircraftUnavailable ? 30 : 0)} minutes total ripple`,
    recoveryConfidence: aircraftUnavailable ? "92.4%" : "98.1%",
    scenarios: [
      {
        id: "scen-a",
        name: "Scenario A: Immediate Standby Aircraft Swap",
        cost: baseCost,
        delayReduction: "45 minutes saved",
        paxProtected: "92%",
        recommendation: "Optimal balance of cost and passenger connection protection."
      },
      {
        id: "scen-b",
        name: "Scenario B: Expedited Turnaround & Gate Hold",
        cost: baseCost * 0.7,
        delayReduction: "25 minutes saved",
        paxProtected: "80%",
        recommendation: "Lower operational cost, but risk of crew FDTL violation."
      },
      {
        id: "scen-c",
        name: "Scenario C: Selective Flight Re-routing",
        cost: baseCost * 1.3,
        delayReduction: "60 minutes saved",
        paxProtected: "99%",
        recommendation: "Highest passenger protection, higher operational fuel cost."
      }
    ]
  };
};
