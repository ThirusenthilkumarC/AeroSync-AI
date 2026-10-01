import { Router } from 'express';
import { getAircraft, getAircraftById, updateAircraft } from '../controllers/aircraft.controller.js';

const router = Router();

router.get('/', getAircraft);
router.get('/:id', getAircraftById);
router.put('/:id', updateAircraft);

export default router;
