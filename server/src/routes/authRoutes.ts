import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/logout', logout as any);
router.get('/me', authenticateToken as any, me as any);

export default router;
