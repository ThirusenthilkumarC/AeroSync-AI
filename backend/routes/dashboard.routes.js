import { Router } from 'express';
import { getDashboardSummary, getNetworkHealth } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/summary', getDashboardSummary);
router.get('/network-health', getNetworkHealth);

export default router;
