import { Router } from 'express';
import { getGates, getGateById, updateGate } from '../controllers/gates.controller.js';

const router = Router();

router.get('/', getGates);
router.get('/:id', getGateById);
router.put('/:id', updateGate);

export default router;
