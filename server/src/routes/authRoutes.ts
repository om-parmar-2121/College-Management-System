import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.get('/me', authenticateToken as any, me as any);

export default router;
