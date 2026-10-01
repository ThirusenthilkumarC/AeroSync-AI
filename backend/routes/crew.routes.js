import { Router } from 'express';
import { getCrew, getCrewById, updateCrew } from '../controllers/crew.controller.js';

const router = Router();

router.get('/', getCrew);
router.get('/:id', getCrewById);
router.put('/:id', updateCrew);

export default router;
