import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-with-sufficient-length-123456';
process.env.CSRF_SECRET ||= 'test-csrf-secret-with-sufficient-length';
process.env.AUTH_RATE_LIMIT_MAX = '20';

const { default: app } = await import('../src/app.js');

test('authentication endpoints return 429 after the configured rate limit', async () => {
    let limited = false;
    for (let attempt = 0; attempt < 30 && !limited; attempt += 1) {
        const response = await request(app).post('/api/auth/login').send({ email: 'rate@example.test', password: 'invalid' });
        limited = response.status === 429;
    }
    assert.equal(limited, true);
});