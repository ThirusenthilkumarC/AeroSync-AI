import { Router } from 'express';
import { 
  getDisruptions, getDisruptionById, createDisruption, 
  updateDisruption, analyzeDisruption, getDisruptionCascade, getDisruptionForecast 
} from '../controllers/disruptions.controller.js';

const router = Router();

router.get('/', getDisruptions);
router.get('/:id', getDisruptionById);
router.post('/', createDisruption);
router.put('/:id', updateDisruption);
router.post('/:id/analyze', analyzeDisruption);
router.get('/:id/cascade', getDisruptionCascade);
router.get('/:id/forecast', getDisruptionForecast);

export default router;
