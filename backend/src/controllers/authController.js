import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { signToken, cookieOptions } from '../utils/jwt.js';
import { issueCsrfToken, csrfCookieOptions } from '../utils/csrf.js';

function setAuthCookie(res, user) {
    res.cookie('token', signToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 }), cookieOptions());
}

export const getCsrfToken = asyncHandler(async (_req, res) => {
    const csrfToken = issueCsrfToken();
    res.cookie('csrfToken', csrfToken, csrfCookieOptions());
    res.json({ success: true, csrfToken });
});

export const register = asyncHandler(async (req, res) => {
    if (await User.exists({ email: req.body.email })) throw new AppError('Email already in use.', 409);
    const user = await User.create({ ...req.body, passwordHash: req.body.password });
    setAuthCookie(res, user);
    res.status(201).json({ success: true, message: 'Account created successfully.', user });
});

export const login = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash +tokenVersion');
    if (!user || !(await user.comparePassword(req.body.password))) throw new AppError('Invalid email or password.', 401);
    setAuthCookie(res, user);
    res.json({ success: true, message: 'Logged in successfully.', user: user.toJSON() });
});

export const logout = asyncHandler(async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    const options = cookieOptions();
    res.clearCookie('token', { httpOnly: true, secure: options.secure, sameSite: options.sameSite, path: '/', domain: options.domain });
    res.clearCookie('csrfToken', { httpOnly: false, secure: options.secure, sameSite: options.sameSite, path: '/', domain: options.domain });
    res.json({ success: true, message: 'Logged out successfully.' });
});

export const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
});