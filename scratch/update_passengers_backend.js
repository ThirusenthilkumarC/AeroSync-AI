const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'passengers.controller.js');
const routesPath = path.join(__dirname, '..', 'backend', 'routes', 'passengers.routes.js');

let controllerContent = fs.readFileSync(controllerPath, 'utf8');

const bookingController = `
export const createPassengerBooking = async (req, res, next) => {
  try {
    const { flightId, flightNumber, origin, destination, seatNumber, passengerName, email, phone, cabin, departure, gate } = req.body || {};

    if (!flightNumber || !seatNumber || !passengerName) {
      return sendError(res, 'Flight number, seat selection, and passenger full name are required to issue e-ticket', 400);
    }

    const pnr = \`AS-\${Math.floor(10000 + Math.random() * 90000)}\`;
    const ticketNumber = \`098-\${Date.now().toString().slice(-8)}\`;

    const booking = {
      pnr,
      ticketNumber,
      passengerName: passengerName.trim(),
      email: (email || '').trim().toLowerCase() || 'passenger@aerosync.aero',
      phone: (phone || '').trim() || '+91 98765 43210',
      flightId: flightId || 'flt-6e1234',
      flightNumber,
      origin: origin || 'DEL',
      destination: destination || 'MAA',
      seatNumber,
      cabin: cabin || 'Economy',
      gate: gate || 'Gate B4',
      departure: departure || '18:30 UTC',
      status: 'CONFIRMED',
      issuedAt: new Date().toISOString()
    };

    return sendSuccess(res, booking, 'Ticket reservation confirmed. Digital boarding pass generated.', 201);
  } catch (err) {
    return next(err);
  }
};
`;

if (!controllerContent.includes('createPassengerBooking')) {
  controllerContent += bookingController;
  fs.writeFileSync(controllerPath, controllerContent, 'utf8');
  console.log('Added createPassengerBooking to backend/controllers/passengers.controller.js');
}

let routesContent = fs.readFileSync(routesPath, 'utf8');
if (!routesContent.includes('createPassengerBooking')) {
  routesContent = routesContent.replace(
    "import { getPassengers, getPassengerById, getPassengerImpact } from '../controllers/passengers.controller.js';",
    "import { getPassengers, getPassengerById, getPassengerImpact, createPassengerBooking } from '../controllers/passengers.controller.js';"
  );
  routesContent = routesContent.replace(
    "router.get('/impact', getPassengerImpact);",
    "router.get('/impact', getPassengerImpact);\nrouter.post('/book', createPassengerBooking);"
  );
  fs.writeFileSync(routesPath, routesContent, 'utf8');
  console.log('Added POST /api/passengers/book to backend/routes/passengers.routes.js');
}
