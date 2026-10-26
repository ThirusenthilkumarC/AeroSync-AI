import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const login = async (req, res, next) => {
  try {
    const { email, password, station } = req.body || {};

    if (!email || !email.trim()) {
      return sendError(res, 'Official Airline Email / Staff ID is required', 400);
    }

    if (!password || !password.trim()) {
      return sendError(res, 'OCC Security PIN / Password is required', 400);
    }

    // Demo or valid airline credentials
    const token = `AEROSYNC_OCC_TOKEN_${Buffer.from(email).toString('base64').substring(0, 16)}_${Date.now()}`;

    const user = {
      id: 'USR-OCC-2026-88',
      name: 'Capt. Neha Sharma',
      email: email.trim().toLowerCase(),
      role: 'CHIEF OPS CONTROLLER',
      clearanceLevel: 'SEC-LEVEL 4',
      station: station || 'DEL',
      airline: 'Air India',
      token
    };

    return sendSuccess(res, { token, user }, 'Authentication successful. OCC Terminal authorized.');
  } catch (err) {
    return next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, department, station } = req.body || {};

    if (!name || !name.trim()) {
      return sendError(res, 'Full Staff Name is required', 400);
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return sendError(res, 'Valid official airline email is required', 400);
    }

    return sendSuccess(
      res, 
      { 
        clearanceId: `REQ-${Date.now().toString().slice(-6)}`,
        status: 'PENDING_APPROVAL',
        staffName: name.trim(),
        email: email.trim().toLowerCase(),
        department: department || 'Operations Control Center',
        station: station || 'DEL'
      }, 
      'Clearance request registered. Verification token dispatched to Chief Controller.', 
      201
    );
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email || !email.trim() || !email.includes('@')) {
      return sendError(res, 'A valid official airline email is required', 400);
    }

    return sendSuccess(
      res, 
      { email: email.trim().toLowerCase(), dispatchedAt: new Date().toISOString() }, 
      'One-Time OCC Emergency Dispatch PIN generated and sent to terminal.'
    );
  } catch (err) {
    return next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = {
      id: 'USR-OCC-2026-88',
      name: 'Capt. Neha Sharma',
      email: 'ops.controller@aerosync.aero',
      role: 'CHIEF OPS CONTROLLER',
      clearanceLevel: 'SEC-LEVEL 4',
      station: 'DEL',
      airline: 'Air India'
    };
    return sendSuccess(res, user, 'Authenticated controller profile retrieved');
  } catch (err) {
    return next(err);
  }
};
