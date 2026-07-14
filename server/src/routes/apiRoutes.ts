import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/crudController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all CRUD routes to ensure security
router.use(authenticateToken as any);

router.get('/:table', getAll as any);
router.get('/:table/:id', getById as any);
router.post('/:table', create as any);
router.put('/:table/:id', update as any);
router.delete('/:table/:id', remove as any);

export default router;
