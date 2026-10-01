export const networkRippleForecast = [
  {
    timeLabel: "NOW",
    disruptedFlights: 1,
    affectedFlights: 1,
    passengersAtRisk: 24,
    downstreamDelaysMin: 90,
    confidence: 99
  },
  {
    timeLabel: "+30 MIN",
    disruptedFlights: 2,
    affectedFlights: 3,
    passengersAtRisk: 86,
    downstreamDelaysMin: 145,
    confidence: 96
  },
  {
    timeLabel: "+60 MIN",
    disruptedFlights: 4,
    affectedFlights: 5,
    passengersAtRisk: 194,
    downstreamDelaysMin: 220,
    confidence: 94
  },
  {
    timeLabel: "+120 MIN",
    disruptedFlights: 6,
    affectedFlights: 8,
    passengersAtRisk: 312,
    downstreamDelaysMin: 340,
    confidence: 91
  }
];

export const simulationScenariosData = {
  baseline: {
    affectedFlights: 6,
    passengersImpacted: 312,
    crewDutyBreaches: 2,
    costExposure: 42500,
    networkDelayMins: 340,
    recoveryConfidence: 96.8
  },
  aircraftUnavailable: {
    affectedFlights: 9,
    passengersImpacted: 480,
    crewDutyBreaches: 3,
    costExposure: 78000,
    networkDelayMins: 520,
    recoveryConfidence: 84.5
  },
  crewUnavailable: {
    affectedFlights: 7,
    passengersImpacted: 380,
    crewDutyBreaches: 4,
    costExposure: 59000,
    networkDelayMins: 410,
    recoveryConfidence: 89.2
  },
  gateConflict: {
    affectedFlights: 5,
    passengersImpacted: 240,
    crewDutyBreaches: 1,
    costExposure: 31000,
    networkDelayMins: 280,
    recoveryConfidence: 92.1
  }
};
