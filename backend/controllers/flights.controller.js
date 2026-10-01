import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { 
  getFlightsService, getFlightByIdService, searchFlightsService, 
  createFlightService, updateFlightService, deleteFlightService 
} from '../services/flights.service.js';

export const getFlights = async (req, res, next) => {
  try {
    const flights = await getFlightsService(req.query);
    return sendSuccess(res, flights, 'Flights list retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

export const getFlightById = async (req, res, next) => {
  try {
    const flight = await getFlightByIdService(req.params.id);
    if (!flight) return sendError(res, 'Flight not found', 404);
    return sendSuccess(res, flight, 'Flight details retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

export const searchFlights = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const results = await searchFlightsService(query);
    return sendSuccess(res, results, 'Search results retrieved');
  } catch (err) {
    return next(err);
  }
};

export const createFlight = async (req, res, next) => {
  try {
    const newFlight = await createFlightService(req.body);
    return sendSuccess(res, newFlight, 'Flight created successfully', 201);
  } catch (err) {
    return next(err);
  }
};

export const updateFlight = async (req, res, next) => {
  try {
    const updated = await updateFlightService(req.params.id, req.body);
    if (!updated) return sendError(res, 'Flight not found to update', 404);
    return sendSuccess(res, updated, 'Flight updated successfully');
  } catch (err) {
    return next(err);
  }
};

export const deleteFlight = async (req, res, next) => {
  try {
    const deleted = await deleteFlightService(req.params.id);
    if (!deleted) return sendError(res, 'Flight not found to delete', 404);
    return sendSuccess(res, deleted, 'Flight deleted successfully');
  } catch (err) {
    return next(err);
  }
};
