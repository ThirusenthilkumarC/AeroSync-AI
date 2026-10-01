import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getNotificationsService, markNotificationAsReadService, createNotificationService } from '../services/notifications.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const list = await getNotificationsService();
    return sendSuccess(res, list, 'Notifications list retrieved');
  } catch (err) {
    return next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const updated = await markNotificationAsReadService(req.params.id);
    if (!updated) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (err) {
    return next(err);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const newNotif = await createNotificationService(req.body);
    return sendSuccess(res, newNotif, 'Notification created', 201);
  } catch (err) {
    return next(err);
  }
};
