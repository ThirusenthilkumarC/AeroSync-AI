import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getGatesService, getGateByIdService, updateGateService } from '../services/gates.service.js';

export const getGates = async (req, res, next) => {
  try {
    const list = await getGatesService(req.query.status);
    return sendSuccess(res, list, 'Gates dataset retrieved');
  } catch (err) {
    return next(err);
  }
};

export const getGateById = async (req, res, next) => {
  try {
    const item = await getGateByIdService(req.params.id);
    if (!item) return sendError(res, 'Gate record not found', 404);
    return sendSuccess(res, item, 'Gate details retrieved');
  } catch (err) {
    return next(err);
  }
};

export const updateGate = async (req, res, next) => {
  try {
    const updated = await updateGateService(req.params.id, req.body);
    if (!updated) return sendError(res, 'Gate record not found to update', 404);
    return sendSuccess(res, updated, 'Gate record updated');
  } catch (err) {
    return next(err);
  }
};
