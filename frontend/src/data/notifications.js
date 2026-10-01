export const notificationsData = [
  {
    id: "notif-1",
    category: "Critical",
    title: "Flight 6E 1234 delay increased to 90 minutes",
    timestamp: "14:40 UTC",
    read: false,
    description: "MAA ATC en-route weather restriction & hydraulic inspection extended ground hold.",
    flightId: "6E1234",
    actionPath: "/disruptions"
  },
  {
    id: "notif-2",
    category: "Warning",
    title: "Crew R-12 approaching DGCA duty limit",
    timestamp: "14:38 UTC",
    read: false,
    description: "Capt. Rajiv Sen current duty 11h 20m. Mandatory rest required within 15 minutes.",
    flightId: "6E1234",
    actionPath: "/crew"
  },
  {
    id: "notif-3",
    category: "Warning",
    title: "Gate A4 conflict detected at DEL Terminal 3",
    timestamp: "14:35 UTC",
    read: false,
    description: "Dual-occupancy overlap between incoming 6E 2108 (21:30) and delayed 6E 1234 (22:50).",
    flightId: "6E2108",
    actionPath: "/resources"
  },
  {
    id: "notif-4",
    category: "AI Recommendation",
    title: "AI generated Recovery Plan V2 (Tail Swap VT-EXA)",
    timestamp: "14:34 UTC",
    read: true,
    description: "Synthesized 5-point holistic recovery plan REC-9042 with 96.8% confidence.",
    flightId: "6E1234",
    actionPath: "/recovery"
  },
  {
    id: "notif-5",
    category: "Info",
    title: "24 Connecting Passengers flagged for priority buggy transfer",
    timestamp: "14:28 UTC",
    read: true,
    description: "14 pax for 6E 502 (DEL -> LHR) and 10 pax for 6E 204 (DEL -> DXB) assigned Express Buggy.",
    flightId: "6E502",
    actionPath: "/passenger-impact"
  }
];
