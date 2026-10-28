import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const protect = asyncHandler(async (req, res, next) => {
    // Read token from signed httpOnly cookie
    const token = req.cookies?.token;
    if (!token) throw new AppError('Not authenticated. Please log in.', 401);

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) throw new AppError('User no longer exists.', 401);

    req.user = user;
    next();
});

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }
        next();
    };
};

export const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.id).select('-passwordHash');
            if (user) req.user = user;
        } catch {
            // ignore invalid token for optional auth
        }
    }
    next();
});
