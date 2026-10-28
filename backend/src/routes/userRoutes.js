import { Router } from 'express';
import { z } from 'zod';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireCsrf } from '../utils/csrf.js';
import { idParamsValidator } from '../validators/postValidators.js';

const profileValidator = z.object({
    name: z.string().trim().min(2).max(60).optional(),
    bio: z.string().max(300).optional(),
    avatar: z.string().url().max(2048).optional().or(z.literal('')),
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

const router = Router();
router.get('/:id', validate(idParamsValidator, 'params'), getProfile);
router.patch('/me', authenticate, requireCsrf, validate(profileValidator), updateProfile);
router.put('/:id', authenticate, requireCsrf, validate(idParamsValidator, 'params'), validate(profileValidator), (req, res, next) => {
    if (req.params.id !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'You can only update your own profile.' });
    next();
}, updateProfile);

export default router;
