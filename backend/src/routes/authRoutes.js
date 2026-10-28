import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getCsrfToken, register, login, logout, getMe } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireCsrf } from '../utils/csrf.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20, message: { success: false, message: 'Too many requests, please try again later.' } });
router.get('/csrf', getCsrfToken);
router.post('/register', authLimiter, requireCsrf, validate(registerValidator), register);
router.post('/login', authLimiter, requireCsrf, validate(loginValidator), login);
router.post('/logout', authenticate, requireCsrf, logout);
router.get('/me', authenticate, getMe);
export default router;
