import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { fetchSummaryService, fetchNetworkHealthService } from '../services/dashboard.service.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summaryData = await fetchSummaryService();
    return sendSuccess(res, summaryData, 'Dashboard summary retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

export const getNetworkHealth = async (req, res, next) => {
  try {
    const healthData = await fetchNetworkHealthService();
    return sendSuccess(res, healthData, 'Network health metrics retrieved successfully');
  } catch (err) {
    return next(err);
  }
};
