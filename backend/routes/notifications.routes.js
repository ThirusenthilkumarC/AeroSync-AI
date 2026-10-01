import { Router } from 'express';
import { getNotifications, markAsRead, createNotification } from '../controllers/notifications.controller.js';

const router = Router();

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);

export default router;
