import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getPassengersService, getPassengerByIdService, getPassengerImpactSummaryService } from '../services/passengers.service.js';

export const getPassengers = async (req, res, next) => {
  try {
    const list = await getPassengersService();
    return sendSuccess(res, list, 'Passengers list retrieved');
  } catch (err) {
    return next(err);
  }
};

export const getPassengerById = async (req, res, next) => {
  try {
    const item = await getPassengerByIdService(req.params.id);
    if (!item) return sendError(res, 'Passenger record not found', 404);
    return sendSuccess(res, item, 'Passenger record retrieved');
  } catch (err) {
    return next(err);
  }
};

export const getPassengerImpact = async (req, res, next) => {
  try {
    const summary = await getPassengerImpactSummaryService();
    return sendSuccess(res, summary, 'Passenger connection impact summary retrieved');
  } catch (err) {
    return next(err);
  }
};

export const createPassengerBooking = async (req, res, next) => {
  try {
    const body = req.body || {};
    const flightNumber = body.flightNumber || body.flight_number;
    const seatNumber = body.seatNumber || body.seat;
    const passengerName = body.passengerName || body.fullName || body.name;
    const flightId = body.flightId || body.flight_id || 'flt-6e1234';
    const origin = body.origin || 'DEL';
    const destination = body.destination || 'MAA';
    const email = (body.email || body.passengerEmail || '').trim().toLowerCase() || 'passenger@aerosync.aero';
    const phone = (body.phone || '').trim() || '+91 98765 43210';
    const cabin = body.cabin || body.cabinClass || 'Economy';
    const departure = body.departure || '18:30 UTC';
    const gate = body.gate || 'Gate B4';

    if (!flightNumber || !seatNumber || !passengerName) {
      return sendError(res, 'Flight number, seat selection, and passenger full name are required to issue e-ticket', 400);
    }

    const pnr = `AS-${Math.floor(10000 + Math.random() * 90000)}`;
    const ticketNumber = `098-${Date.now().toString().slice(-8)}`;

    const booking = {
      pnr,
      ticketNumber,
      passengerName: passengerName.trim(),
      email,
      phone,
      flightId,
      flightNumber,
      origin,
      destination,
      seatNumber,
      cabin,
      gate,
      departure,
      status: 'CONFIRMED',
      issuedAt: new Date().toISOString()
    };

    return sendSuccess(res, booking, 'Ticket reservation confirmed. Digital boarding pass generated.', 201);
  } catch (err) {
    return next(err);
  }
};
