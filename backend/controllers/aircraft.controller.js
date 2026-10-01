import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getAircraftService, getAircraftByIdService, updateAircraftService } from '../services/aircraft.service.js';

export const getAircraft = async (req, res, next) => {
  try {
    const list = await getAircraftService(req.query.status);
    return sendSuccess(res, list, 'Aircraft dataset retrieved');
  } catch (err) {
    return next(err);
  }
};

export const getAircraftById = async (req, res, next) => {
  try {
    const item = await getAircraftByIdService(req.params.id);
    if (!item) return sendError(res, 'Aircraft record not found', 404);
    return sendSuccess(res, item, 'Aircraft details retrieved');
  } catch (err) {
    return next(err);
  }
};

export const updateAircraft = async (req, res, next) => {
  try {
    const updated = await updateAircraftService(req.params.id, req.body);
    if (!updated) return sendError(res, 'Aircraft record not found to update', 404);
    return sendSuccess(res, updated, 'Aircraft record updated');
  } catch (err) {
    return next(err);
  }
};
