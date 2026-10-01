import { Router } from 'express';
import { getPassengers, getPassengerById, getPassengerImpact } from '../controllers/passengers.controller.js';

const router = Router();

router.get('/impact', getPassengerImpact);
router.get('/', getPassengers);
router.get('/:id', getPassengerById);

export default router;
