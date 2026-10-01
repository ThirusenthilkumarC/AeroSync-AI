export const passengersData = [
  {
    pnr: "AS-89412",
    name: "Rohan & Priya Mehta",
    flightNumber: "6E 1234",
    route: "MAA → DEL → LHR",
    connectingFlight: "6E 502 (DEL → LHR)",
    connectionWindow: "18 mins window",
    risk: "Critical Misconnect Risk",
    priority: "VIP / Premier Economy",
    bags: 2,
    status: "Priority Buggy Transfer Dispatched",
    rebookingAction: "Auto-transfer to Buggy at Gate B4; Backup flight 6E 504 on hold",
    hotelVoucher: "Not Needed ($0)",
    passengerCount: 2
  },
  {
    pnr: "AS-77209",
    name: "Ananya Iyer",
    flightNumber: "6E 1234",
    route: "MAA → DEL → DXB",
    connectingFlight: "6E 204 (DEL → DXB)",
    connectionWindow: "24 mins window",
    risk: "High Misconnect Risk",
    priority: "Business Class",
    bags: 1,
    status: "Express Airside Buggy Queued",
    rebookingAction: "Airside Priority Buggy assigned; Baggage expedited",
    hotelVoucher: "Not Needed ($0)",
    passengerCount: 1
  },
  {
    pnr: "AS-33104",
    name: "Vikram & Family (4 Pax)",
    flightNumber: "6E 1234",
    route: "MAA → DEL → BOM",
    connectingFlight: "6E 1892 (DEL → BOM)",
    connectionWindow: "35 mins window",
    risk: "Medium Risk (Protected by Tail Swap)",
    priority: "Standard Economy",
    bags: 4,
    status: "Protected on 6E 1892",
    rebookingAction: "No rebooking needed - 6E 1892 delayed to sync departure",
    hotelVoucher: "Not Needed ($0)",
    passengerCount: 4
  },
  {
    pnr: "AS-10492",
    name: "David Smith",
    flightNumber: "6E 1234",
    route: "MAA → DEL → CDG",
    connectingFlight: "AF 225 (Codeshare)",
    connectionWindow: "12 mins window",
    risk: "Misconnection Inevitable",
    priority: "Codeshare Partner Gold",
    bags: 2,
    status: "Auto-rebooked on AF 227 (04:10 UTC)",
    rebookingAction: "Rebooked on partner codeshare flight AF 227 + T3 Lounge voucher issued",
    hotelVoucher: "Complimentary Transit Hotel Voucher Issued ($120)",
    passengerCount: 1
  },
  {
    pnr: "AS-66512",
    name: "Sanjay Kumar",
    flightNumber: "6E 2108",
    route: "BOM → DEL → BLR",
    connectingFlight: "6E 409",
    connectionWindow: "45 mins window",
    risk: "Low Risk",
    priority: "Standard Economy",
    bags: 1,
    status: "On Schedule",
    rebookingAction: "Normal Connection",
    hotelVoucher: "Not Needed ($0)",
    passengerCount: 1
  }
];

export const passengerImpactSummary = {
  totalImpacted: 124,
  criticalConnectionsAtRisk: 24,
  missedConnections: 8,
  autoRebooked: 8,
  buggyTransfersDispatched: 16,
  hotelVouchersIssued: 4,
  totalHotelCost: "$0 (Recovered via partner codeshare & buggy protection)",
  paxProtectedRate: "93.5%"
};
