import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSecurityConfig } from '../src/config/security.js';
import { issueCsrfToken, verifyCsrfToken } from '../src/utils/csrf.js';

test('security configuration requires strong independent secrets and production frontend origin', () => {
    const valid = { NODE_ENV: 'test', JWT_SECRET: 'jwt-secret-that-is-at-least-32-chars-long', CSRF_SECRET: 'csrf-secret-that-is-at-least-32-chars-long' };
    assert.doesNotThrow(() => validateSecurityConfig(valid));
    assert.throws(() => validateSecurityConfig({ ...valid, JWT_SECRET: 'short' }), /JWT_SECRET/);
    assert.throws(() => validateSecurityConfig({ ...valid, CSRF_SECRET: valid.JWT_SECRET }), /different/);
    assert.throws(() => validateSecurityConfig({ ...valid, NODE_ENV: 'production' }), /FRONTEND_URL/);
    assert.throws(() => validateSecurityConfig({ ...valid, NODE_ENV: 'production', FRONTEND_URL: 'https://site.example', COOKIE_SECURE: 'false' }), /disabled/);
    assert.throws(() => validateSecurityConfig({ ...valid, NODE_ENV: 'test', COOKIE_SAME_SITE: 'none' }), /COOKIE_SECURE/);
});

test('CSRF signatures verify only canonical, complete, unmodified tokens', () => {
    process.env.CSRF_SECRET ||= 'isolated-csrf-secret-for-unit-tests-123';
    const token = issueCsrfToken();
    assert.equal(verifyCsrfToken(token), true);
    assert.equal(verifyCsrfToken(`${token}.extra`), false);
    const tampered = `${token.slice(0, -1)}${token.endsWith('0') ? '1' : '0'}`;
    assert.equal(verifyCsrfToken(tampered), false);
    assert.equal(verifyCsrfToken('forged'), false);
    assert.equal(verifyCsrfToken(null), false);
});