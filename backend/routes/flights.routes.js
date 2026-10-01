import { Router } from 'express';
import { 
  getFlights, getFlightById, searchFlights, 
  createFlight, updateFlight, deleteFlight 
} from '../controllers/flights.controller.js';

const router = Router();

router.get('/search', searchFlights);
router.get('/', getFlights);
router.get('/:id', getFlightById);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

export default router;
