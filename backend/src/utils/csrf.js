import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { AppError } from './errors.js';

const TOKEN_COOKIE = 'csrfToken';
const secret = () => process.env.CSRF_SECRET;

function signature(nonce) {
    return createHmac('sha256', secret()).update(nonce).digest('hex');
}

export function issueCsrfToken() {
    const nonce = randomBytes(24).toString('hex');
    return `${nonce}.${signature(nonce)}`;
}

export function csrfCookieOptions() {
    return {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'lax',
        path: '/',
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
        maxAge: Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
    };
}

export function verifyCsrfToken(token) {
    if (typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [nonce, supplied] = parts;
    if (!nonce || !supplied || !/^[a-f0-9]{48}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(supplied)) return false;
    const expected = Buffer.from(signature(nonce), 'hex');
    let actual;
    try { actual = Buffer.from(supplied, 'hex'); } catch { return false; }
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function requireCsrf(req, _res, next) {
    const cookie = req.cookies?.[TOKEN_COOKIE];
    const header = req.get('x-csrf-token');
    if (!cookie || !header || cookie !== header || !verifyCsrfToken(header)) {
        return next(new AppError('A valid CSRF token is required.', 403));
    }
    next();
}