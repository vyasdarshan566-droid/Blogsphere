import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
    const token = req.cookies?.token || (req.get('authorization')?.startsWith('Bearer ') ? req.get('authorization').slice(7) : null);
    if (!token) throw new AppError('Authentication required.', 401);
    let payload;
    try { payload = verifyToken(token); } catch { throw new AppError('Invalid or expired authentication token.', 401); }
    const user = await User.findById(payload.id).select('+tokenVersion');
    if (!user) throw new AppError('Invalid or expired authentication token.', 401);
    if (payload.tokenVersion !== (user.tokenVersion || 0)) throw new AppError('Session has expired. Please log in again.', 401);
    req.user = user;
    next();
});

export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const payload = verifyToken(token);
            const user = await User.findById(payload.id).select('+tokenVersion');
            if (user && payload.tokenVersion === (user.tokenVersion || 0)) req.user = user;
        } catch { req.user = undefined; }
    }
    next();
});