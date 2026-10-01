import { Router } from 'express';
import { runSimulation } from '../controllers/simulation.controller.js';

const router = Router();

router.post('/run', runSimulation);

export default router;
