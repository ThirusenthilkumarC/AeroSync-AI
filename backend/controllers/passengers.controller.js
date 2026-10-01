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
