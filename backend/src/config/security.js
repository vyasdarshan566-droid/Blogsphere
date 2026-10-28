export function validateSecurityConfig(env = process.env) {
    const secretNames = ['JWT_SECRET', 'CSRF_SECRET'];
    for (const name of secretNames) {
        if (typeof env[name] !== 'string' || env[name].length < 32) {
            throw new Error(`${name} must be configured with at least 32 characters.`);
        }
    }
    if (env.JWT_SECRET === env.CSRF_SECRET) {
        throw new Error('JWT_SECRET and CSRF_SECRET must be different values.');
    }
    const sameSite = env.COOKIE_SAME_SITE || 'lax';
    if (!['strict', 'lax', 'none'].includes(sameSite)) {
        throw new Error('COOKIE_SAME_SITE must be strict, lax, or none.');
    }
    if (sameSite === 'none' && env.NODE_ENV !== 'production' && env.COOKIE_SECURE !== 'true') {
        throw new Error('COOKIE_SECURE=true is required with SameSite=None outside production.');
    }
    if (env.NODE_ENV === 'production' && !(env.FRONTEND_URL || env.CLIENT_ORIGIN)) {
        throw new Error('FRONTEND_URL or CLIENT_ORIGIN must be configured in production.');
    }
    if (env.NODE_ENV === 'production' && env.COOKIE_SECURE === 'false') {
        throw new Error('Secure authentication cookies cannot be disabled in production.');
    }
}