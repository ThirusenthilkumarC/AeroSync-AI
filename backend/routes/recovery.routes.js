import { Router } from 'express';
import { 
  getRecoveryPlans, getRecoveryPlanById, generateRecovery, 
  approveRecovery, rejectRecovery, getExplanation, 
  validateRecovery, autoReplan, getDecisionReplay 
} from '../controllers/recovery.controller.js';

const router = Router();

router.get('/plans', getRecoveryPlans);
router.get('/plans/:id', getRecoveryPlanById);
router.post('/generate', generateRecovery);
router.post('/validate', validateRecovery);
router.post('/auto-replan', autoReplan);
router.post('/:id/approve', approveRecovery);
router.post('/:id/reject', rejectRecovery);
router.get('/:id/explanation', getExplanation);
router.get('/:id/replay', getDecisionReplay);

export default router;
