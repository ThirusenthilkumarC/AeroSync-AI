import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getCrewService, getCrewByIdService, updateCrewService } from '../services/crew.service.js';

export const getCrew = async (req, res, next) => {
  try {
    const list = await getCrewService(req.query.status);
    return sendSuccess(res, list, 'Crew dataset retrieved');
  } catch (err) {
    return next(err);
  }
};

export const getCrewById = async (req, res, next) => {
  try {
    const item = await getCrewByIdService(req.params.id);
    if (!item) return sendError(res, 'Crew member not found', 404);
    return sendSuccess(res, item, 'Crew details retrieved');
  } catch (err) {
    return next(err);
  }
};

export const updateCrew = async (req, res, next) => {
  try {
    const updated = await updateCrewService(req.params.id, req.body);
    if (!updated) return sendError(res, 'Crew member not found to update', 404);
    return sendSuccess(res, updated, 'Crew record updated');
  } catch (err) {
    return next(err);
  }
};
