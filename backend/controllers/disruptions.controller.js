import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { 
  getDisruptionsService, getDisruptionByIdService, createDisruptionService, 
  updateDisruptionService, analyzeDisruptionService, getCascadeGraphService, getForecastService 
} from '../services/disruptions.service.js';

export const getDisruptions = async (req, res, next) => {
  try {
    const list = await getDisruptionsService();
    return sendSuccess(res, list, 'Disruptions list retrieved');
  } catch (err) {
    return next(err);
  }
};

export const getDisruptionById = async (req, res, next) => {
  try {
    const disruption = await getDisruptionByIdService(req.params.id);
    if (!disruption) return sendError(res, 'Disruption record not found', 404);
    return sendSuccess(res, disruption, 'Disruption details retrieved');
  } catch (err) {
    return next(err);
  }
};

export const createDisruption = async (req, res, next) => {
  try {
    const newDisruption = await createDisruptionService(req.body);
    return sendSuccess(res, newDisruption, 'Disruption created', 201);
  } catch (err) {
    return next(err);
  }
};

export const updateDisruption = async (req, res, next) => {
  try {
    const updated = await updateDisruptionService(req.params.id, req.body);
    if (!updated) return sendError(res, 'Disruption record not found to update', 404);
    return sendSuccess(res, updated, 'Disruption updated');
  } catch (err) {
    return next(err);
  }
};

export const analyzeDisruption = async (req, res, next) => {
  try {
    const analysis = await analyzeDisruptionService(req.params.id);
    return sendSuccess(res, analysis, 'Disruption impact analysis complete');
  } catch (err) {
    return next(err);
  }
};

export const getDisruptionCascade = async (req, res, next) => {
  try {
    const cascadeGraph = await getCascadeGraphService(req.params.id);
    return sendSuccess(res, cascadeGraph, 'Disruption cascade topology graph generated');
  } catch (err) {
    return next(err);
  }
};

export const getDisruptionForecast = async (req, res, next) => {
  try {
    const forecast = await getForecastService(req.params.id);
    return sendSuccess(res, forecast, 'Network ripple forecast computed');
  } catch (err) {
    return next(err);
  }
};
