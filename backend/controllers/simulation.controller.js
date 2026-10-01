import { sendSuccess } from '../utils/responseHandler.js';
import { runSimulationService } from '../services/simulation.service.js';

export const runSimulation = async (req, res, next) => {
  try {
    const simulationResult = await runSimulationService(req.body);
    return sendSuccess(res, simulationResult, 'What-If simulation completed successfully');
  } catch (err) {
    return next(err);
  }
};
