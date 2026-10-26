import { Router } from 'express';
import { login, register, forgotPassword, getMe } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.get('/me', getMe);

export default router;
