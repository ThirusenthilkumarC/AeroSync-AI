import { Router } from 'express';
import { getPassengers, getPassengerById, getPassengerImpact, createPassengerBooking } from '../controllers/passengers.controller.js';

const router = Router();

router.get('/impact', getPassengerImpact);
router.post('/book', createPassengerBooking);
router.get('/', getPassengers);
router.get('/:id', getPassengerById);

export default router;
