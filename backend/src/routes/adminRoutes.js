import { Router } from 'express';
import { z } from 'zod';
import {
    getDashboard,
    getUsers,
    getPostsAdmin,
    deletePostAdmin,
    deleteUserAdmin,
    updateUserRole,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { requireCsrf } from '../utils/csrf.js';
import { idParamsValidator } from '../validators/postValidators.js';

const pageValidator = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
const router = Router();
router.use(authenticate, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/stats', getDashboard);
router.get('/users', validate(pageValidator, 'query'), getUsers);
router.delete('/users/:id', requireCsrf, validate(idParamsValidator, 'params'), deleteUserAdmin);
router.get('/posts', validate(pageValidator, 'query'), getPostsAdmin);
router.delete('/posts/:id', requireCsrf, validate(idParamsValidator, 'params'), deletePostAdmin);
router.patch('/users/:id/role', requireCsrf, validate(idParamsValidator, 'params'), validate(z.object({ role: z.enum(['user', 'admin']) })), updateUserRole);
export default router;
