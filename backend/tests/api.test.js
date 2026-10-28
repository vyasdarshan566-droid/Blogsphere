import test, { before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../src/middleware/errorHandler.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-sufficient-length-123456';
process.env.CSRF_SECRET = 'test-csrf-secret-with-sufficient-length';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.AUTH_RATE_LIMIT_MAX = '1000';

let mongod;
let app;
let mongoose;
let User;
let Post;
let Comment;

beforeEach(async () => {
    if (!mongoose?.connection.readyState) return;
    await Promise.all([Comment.deleteMany({}), Post.deleteMany({}), User.deleteMany({})]);
});

before(async () => {
    mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    process.env.MONGODB_URI = mongod.getUri();
    ({ default: app } = await import('../src/app.js'));
    ({ default: mongoose } = await import('mongoose'));
    ({ User } = await import('../src/models/User.js'));
    ({ Post } = await import('../src/models/Post.js'));
    ({ Comment } = await import('../src/models/Comment.js'));
    await mongoose.connect(process.env.MONGODB_URI);
    await Promise.all([User.init(), Post.init(), Comment.init()]);
});

after(async () => {
    if (mongoose?.connection.readyState) await mongoose.disconnect();
    await mongod?.stop();
});

async function csrf(agent) {
    const response = await agent.get('/api/auth/csrf').expect(200);
    return response.body.csrfToken;
}

async function register(agent, email, name = 'Test Author') {
    const csrfToken = await csrf(agent);
    const response = await agent.post('/api/auth/register').set('X-CSRF-Token', csrfToken).send({
        name, email, password: 'StrongPass123',
    }).expect(201);
    assert.equal(response.body.user.passwordHash, undefined);
    return response.body.user;
}

test('health reports database connectivity and protected routes reject unauthenticated requests', async () => {
    await request(app).get('/api/health').expect(200).expect(({ body }) => assert.equal(body.database, 'connected'));
    await request(app).get('/api/auth/me').expect(401);
    await request(app).post('/api/posts').send({}).expect(401);
    await request(app).get('/api/admin/dashboard').expect(401);
    await request(app).get('/api/admin/users').expect(401);
    await request(app).patch('/api/users/me').send({ name: 'Unauthenticated' }).expect(401);
});

test('register, login, me, logout, and passwordHash secrecy', async () => {
    const agent = request.agent(app);
    const user = await register(agent, 'auth@example.test');
    await agent.get('/api/auth/me').expect(200).expect(({ body }) => {
        assert.equal(body.user._id, user._id);
        assert.equal(body.user.passwordHash, undefined);
    });
    const loginAgent = request.agent(app);
    let token = await csrf(loginAgent);
    await loginAgent.post('/api/auth/login').set('X-CSRF-Token', token)
        .send({ email: 'auth@example.test', password: 'StrongPass123' }).expect(200);
    await loginAgent.get('/api/auth/me').expect(200);
    token = await csrf(agent);
    await agent.post('/api/auth/logout').set('X-CSRF-Token', token).expect(200);
    await agent.get('/api/auth/me').expect(401);
});

test('post CRUD, unique slugs, search/category/tag filtering, and ownership checks', async () => {
    const owner = request.agent(app);
    const stranger = request.agent(app);
    await register(owner, 'owner@example.test', 'Owner');
    await register(stranger, 'stranger@example.test', 'Stranger');
    const ownerCsrf = await csrf(owner);
    const strangerCsrf = await csrf(stranger);
    const payload = { title: 'A Secure Backend', excerpt: 'A post about backend testing.', content: 'This is sufficiently long content for a published integration test post.', category: 'Technology', tags: ['security', 'testing'], status: 'published' };
    const created = await owner.post('/api/posts').set('X-CSRF-Token', ownerCsrf).send(payload).expect(201);
    const second = await owner.post('/api/posts').set('X-CSRF-Token', ownerCsrf).send(payload).expect(201);
    assert.notEqual(created.body.data.slug, second.body.data.slug);

    await stranger.patch(`/api/posts/${created.body.data._id}`).set('X-CSRF-Token', strangerCsrf).send({ title: 'Changed title' }).expect(403);
    await stranger.delete(`/api/posts/${created.body.data._id}`).set('X-CSRF-Token', strangerCsrf).expect(403);
    await owner.patch(`/api/posts/${created.body.data._id}`).set('X-CSRF-Token', ownerCsrf).send({ title: 'Updated Secure Backend' }).expect(200);
    await request(app).get('/api/posts').query({ q: 'backend', category: 'Technology', tag: 'testing', sort: 'newest' }).expect(200).expect(({ body }) => assert.ok(body.data.length >= 1));
    await owner.delete(`/api/posts/${second.body.data._id}`).set('X-CSRF-Token', ownerCsrf).expect(200);
    await owner.delete(`/api/posts/${created.body.data._id}`).set('X-CSRF-Token', ownerCsrf).expect(200);
    assert.equal(await Post.countDocuments({}), 0);
});

test('discovery searches title, excerpt and content; supports filters, pagination, and view-based popularity', async () => {
    const owner = request.agent(app);
    await register(owner, 'discovery-author@example.test', 'Discovery Author');
    const token = await csrf(owner);
    const create = (title, excerpt, content, category, tags) => owner.post('/api/posts').set('X-CSRF-Token', token).send({
        title, excerpt, content, category, tags, status: 'published',
    }).expect(201);
    const titlePost = await create('Quartz Signal Discovery', 'A distinct short summary for readers.', 'A sufficiently long general content text.', 'Technology', ['quartz', 'search']);
    const excerptPost = await create('Distinctive Editorial Story', 'Violet excerpt keyword appears here.', 'A sufficiently long general content text.', 'Design', ['violet']);
    const contentPost = await create('Another Editorial Piece', 'Another distinct readable summary.', 'Cobalt content keyword appears in this sufficiently long article body.', 'Technology', ['cobalt', 'search']);

    await request(app).get('/api/posts').query({ q: 'Quartz' }).expect(200).expect(({ body }) => assert.deepEqual(body.data.map((post) => post._id), [titlePost.body.data._id]));
    await request(app).get('/api/posts').query({ q: 'Violet' }).expect(200).expect(({ body }) => assert.deepEqual(body.data.map((post) => post._id), [excerptPost.body.data._id]));
    await request(app).get('/api/posts').query({ q: 'Cobalt' }).expect(200).expect(({ body }) => assert.deepEqual(body.data.map((post) => post._id), [contentPost.body.data._id]));
    await request(app).get('/api/posts').query({ category: 'Technology' }).expect(200).expect(({ body }) => assert.ok(body.data.every((post) => post.category === 'Technology')));
    await request(app).get('/api/posts').query({ tag: 'quartz' }).expect(200).expect(({ body }) => assert.deepEqual(body.data.map((post) => post._id), [titlePost.body.data._id]));

    const firstPage = await request(app).get('/api/posts').query({ author: titlePost.body.data.author, limit: 1, page: 1 }).expect(200);
    assert.equal(firstPage.body.pagination.page, 1);
    assert.equal(firstPage.body.data.length, 1);
    const secondPage = await request(app).get('/api/posts').query({ author: titlePost.body.data.author, limit: 1, page: 2 }).expect(200);
    assert.equal(secondPage.body.pagination.page, 2);
    assert.notEqual(firstPage.body.data[0]._id, secondPage.body.data[0]._id);

    await Post.updateOne({ _id: titlePost.body.data._id }, { $set: { views: 5 } });
    await Post.updateOne({ _id: excerptPost.body.data._id }, { $set: { views: 95 } });
    await request(app).get('/api/posts').query({ author: titlePost.body.data.author, sort: 'popular' }).expect(200)
        .expect(({ body }) => assert.equal(body.data[0]._id, excerptPost.body.data._id));

    await assert.rejects(Post.create({
        title: 'Missing Author Reference', excerpt: 'This excerpt is long enough.', content: 'This content is definitely long enough to pass validation.',
        category: 'Technology', author: new mongoose.Types.ObjectId(), status: 'published',
    }), /Post author must reference an existing user/);
});

test('comments are created, listed, and deletable only by author or admin', async () => {
    const author = request.agent(app);
    const commenter = request.agent(app);
    const outsider = request.agent(app);
    await register(author, 'post-author@example.test', 'Post Author');
    const commenterUser = await register(commenter, 'commenter@example.test', 'Commenter');
    await register(outsider, 'outsider@example.test', 'Outsider');
    const authorToken = await csrf(author);
    const commenterToken = await csrf(commenter);
    const outsiderToken = await csrf(outsider);
    const post = await author.post('/api/posts').set('X-CSRF-Token', authorToken).send({
        title: 'Commentable Blog Entry', excerpt: 'A sufficiently descriptive excerpt.', content: 'Content that is long enough for the post validation rules in tests.', category: 'Programming', status: 'published',
    }).expect(201);
    await request(app).post(`/api/posts/${post.body.data._id}/comments`).send({ content: 'Anonymous attempt' }).expect(401);
    await commenter.post(`/api/posts/${post.body.data._id}/comments`).set('X-CSRF-Token', commenterToken).send({ content: '   ' }).expect(400);
    await commenter.post(`/api/posts/${post.body.data._id}/comments`).set('X-CSRF-Token', commenterToken).send({ content: 'x'.repeat(1001) }).expect(400);
    await commenter.post(`/api/posts/${post.body.data._id}/comments`).set('X-CSRF-Token', commenterToken).send({ content: 'A useful comment.' }).expect(201);
    const listing = await request(app).get(`/api/posts/${post.body.data._id}/comments`).expect(200);
    const commentId = listing.body.data[0]._id;
    assert.equal(listing.body.data[0].author.name, 'Commenter');
    assert.ok(Number.isFinite(new Date(listing.body.data[0].createdAt).getTime()));
    await outsider.delete(`/api/comments/${commentId}`).set('X-CSRF-Token', outsiderToken).expect(403);
    await commenter.delete(`/api/comments/${commentId}`).set('X-CSRF-Token', commenterToken).expect(200);
    assert.equal(await Comment.countDocuments({}), 0);

    await commenter.post(`/api/posts/${post.body.data._id}/comments`).set('X-CSRF-Token', commenterToken).send({ content: 'Cascade cleanup comment.' }).expect(201);
    await author.delete(`/api/posts/${post.body.data._id}`).set('X-CSRF-Token', authorToken).expect(200);
    assert.equal(await Comment.countDocuments({ post: post.body.data._id }), 0);
    await assert.rejects(Comment.create({ post: post.body.data._id, author: commenterUser._id, content: 'Orphan reference' }), /Comment must reference an existing published post/);
});

test('registration rejects duplicate emails case-insensitively and stores only bcrypt hashes', async () => {
    const agent = request.agent(app);
    const created = await register(agent, 'duplicate@example.test');
    let csrfToken = await csrf(agent);
    await agent.post('/api/auth/register').set('X-CSRF-Token', csrfToken).send({
        name: 'Second Author', email: 'DUPLICATE@example.test', password: 'StrongPass123',
    }).expect(409);

    const stored = await User.findById(created._id).select('+passwordHash');
    assert.notEqual(stored.passwordHash, 'StrongPass123');
    assert.match(stored.passwordHash, /^\$2[aby]\$/);
    assert.equal(await bcrypt.compare('StrongPass123', stored.passwordHash), true);
    assert.equal(JSON.stringify(stored).includes(stored.passwordHash), false);
    const publicProfile = await request(app).get(`/api/users/${created._id}`).expect(200);
    assert.equal(publicProfile.body.data.email, undefined);
});

test('invalid credentials and invalid or expired sessions are rejected', async () => {
    const user = await User.create({ name: 'Session User', email: 'session@example.test', passwordHash: 'StrongPass123' });
    const agent = request.agent(app);
    let csrfToken = await csrf(agent);
    await agent.post('/api/auth/login').set('X-CSRF-Token', csrfToken)
        .send({ email: user.email, password: 'WrongPassword123' }).expect(401);
    await agent.post('/api/auth/login').set('X-CSRF-Token', csrfToken)
        .send({ email: 'missing@example.test', password: 'WrongPassword123' }).expect(401);

    await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.jwt').expect(401);
    const expired = jwt.sign({ id: user._id, tokenVersion: 0 }, process.env.JWT_SECRET, { expiresIn: -1 });
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`).expect(401);
});

test('logout expires the HttpOnly cookie and revokes copied session tokens', async () => {
    const agent = request.agent(app);
    const csrfForRegister = await csrf(agent);
    const registered = await agent.post('/api/auth/register').set('X-CSRF-Token', csrfForRegister).send({
        name: 'Logout User', email: 'logout@example.test', password: 'StrongPass123',
    }).expect(201);
    const user = registered.body.user;
    const authToken = registered.headers['set-cookie'].find((cookie) => cookie.startsWith('token=')).match(/^token=([^;]+)/)[1];
    const csrfToken = await csrf(agent);
    const response = await agent.post('/api/auth/logout').set('X-CSRF-Token', csrfToken).expect(200);
    const clearedCookie = response.headers['set-cookie'].find((cookie) => cookie.startsWith('token='));
    assert.match(clearedCookie, /HttpOnly/i);
    assert.match(clearedCookie, /Expires=Thu, 01 Jan 1970|Max-Age=0/i);
    const clearedCsrf = response.headers['set-cookie'].find((cookie) => cookie.startsWith('csrfToken='));
    assert.match(clearedCsrf, /Expires=Thu, 01 Jan 1970|Max-Age=0/i);
    await agent.get('/api/auth/me').expect(401);
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${authToken}`).expect(401);
    assert.equal((await User.findById(user._id).select('+tokenVersion')).tokenVersion, 1);
});

test('CSRF rejects missing, mismatched and forged tokens; validation responds with 400', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({ name: 'Test', email: 'csrf@example.test', password: 'StrongPass123' }).expect(403);
    const csrfResponse = await agent.get('/api/auth/csrf').expect(200);
    const valid = csrfResponse.body.csrfToken;
    const csrfCookie = csrfResponse.headers['set-cookie'].find((cookie) => cookie.startsWith('csrfToken='));
    assert.ok(csrfCookie);
    assert.doesNotMatch(csrfCookie, /HttpOnly/i);
    await agent.post('/api/auth/register').set('X-CSRF-Token', `${valid}.extra`).send({}).expect(403);
    await agent.post('/api/auth/register').set('X-CSRF-Token', 'forged').send({}).expect(403);
    await request(app).post('/api/auth/register').set('X-CSRF-Token', valid).send({}).expect(403);
    await agent.post('/api/auth/register').set('X-CSRF-Token', `${valid.slice(0, -1)}0`).send({}).expect(403);
    await agent.post('/api/auth/register').set('X-CSRF-Token', valid).send({ name: 'X', email: 'bad-email', password: 'weak' }).expect(400);
});

test('cookie flags are appropriate in production and configured SameSite is honored', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousSameSite = process.env.COOKIE_SAME_SITE;
    process.env.NODE_ENV = 'production';
    process.env.COOKIE_SAME_SITE = 'strict';
    try {
        const csrfResponse = await request(app).get('/api/auth/csrf').expect(200);
        const csrfToken = csrfResponse.body.csrfToken;
        const response = await request(app).post('/api/auth/register').set('Cookie', `csrfToken=${csrfToken}`).set('X-CSRF-Token', csrfToken).send({
            name: 'Cookie User', email: 'cookie@example.test', password: 'StrongPass123',
        }).expect(201);
        const authCookie = response.headers['set-cookie'].find((cookie) => cookie.startsWith('token='));
        assert.match(authCookie, /HttpOnly/i);
        assert.match(authCookie, /Secure/i);
        assert.match(authCookie, /SameSite=Strict/i);
    } finally {
        process.env.NODE_ENV = previousNodeEnv;
        if (previousSameSite === undefined) delete process.env.COOKIE_SAME_SITE;
        else process.env.COOKIE_SAME_SITE = previousSameSite;
    }
});

test('CORS allows configured development origin and rejects untrusted origins', async () => {
    const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173').expect(200);
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.equal(allowed.headers['access-control-allow-credentials'], 'true');
    const rejected = await request(app).get('/api/health').set('Origin', 'https://attacker.invalid').expect(403);
    assert.equal(rejected.headers['access-control-allow-origin'], undefined);
    assert.equal(allowed.headers['x-powered-by'], undefined);
    assert.ok(allowed.headers['x-content-type-options']);
});

test('regular users cannot use admin APIs or change roles; admins can change roles', async () => {
    const regular = await User.create({ name: 'Regular Member', email: 'regular-admin@example.test', passwordHash: 'StrongPass123' });
    const admin = await User.create({ name: 'Admin Member', email: 'real-admin@example.test', passwordHash: 'StrongPass123', role: 'admin' });
    const target = await User.create({ name: 'Role Target', email: 'role-target@example.test', passwordHash: 'StrongPass123' });
    const regularToken = jwt.sign({ id: regular._id, tokenVersion: 0 }, process.env.JWT_SECRET);
    const adminToken = jwt.sign({ id: admin._id, tokenVersion: 0 }, process.env.JWT_SECRET);
    const userAgent = request.agent(app);
    const adminAgent = request.agent(app);
    const userCsrf = await csrf(userAgent);
    const adminCsrf = await csrf(adminAgent);

    await request(app).get('/api/admin/dashboard').set('Cookie', `token=${regularToken}`).expect(403);
    await request(app).patch(`/api/admin/users/${target._id}/role`).set('Cookie', `token=${regularToken}; csrfToken=${userCsrf}`)
        .set('X-CSRF-Token', userCsrf).send({ role: 'admin' }).expect(403);
    await request(app).patch(`/api/admin/users/${target._id}/role`).set('Cookie', `token=${adminToken}; csrfToken=${adminCsrf}`)
        .set('X-CSRF-Token', adminCsrf).send({ role: 'admin' }).expect(200);
    assert.equal((await User.findById(target._id)).role, 'admin');
    const promotedToken = jwt.sign({ id: target._id, tokenVersion: 0 }, process.env.JWT_SECRET);
    await request(app).get('/api/admin/dashboard').set('Cookie', `token=${promotedToken}`).expect(401);
    const currentToken = jwt.sign({ id: target._id, tokenVersion: 1 }, process.env.JWT_SECRET);
    await request(app).get('/api/admin/dashboard').set('Cookie', `token=${currentToken}`).expect(200);
    await request(app).patch(`/api/admin/users/${regular._id}/role`).set('Cookie', `token=${adminToken}; csrfToken=${adminCsrf}`)
        .set('X-CSRF-Token', adminCsrf).send({ role: 'owner' }).expect(400);
    await request(app).patch(`/api/admin/users/${target._id}/role`).set('Cookie', `token=${adminToken}; csrfToken=${adminCsrf}`)
        .set('X-CSRF-Token', adminCsrf).send({ role: 'user' }).expect(200);
    await request(app).get('/api/admin/dashboard').set('Cookie', `token=${currentToken}`).expect(401);
});

test('public profile and API responses never expose password hashes or private email', async () => {
    const user = await User.create({ name: 'Private Profile', email: 'private@example.test', passwordHash: 'StrongPass123' });
    const profile = await request(app).get(`/api/users/${user._id}`).expect(200);
    assert.equal(profile.body.data.passwordHash, undefined);
    assert.equal(profile.body.data.email, undefined);
    const loginAgent = request.agent(app);
    const csrfToken = await csrf(loginAgent);
    const login = await loginAgent.post('/api/auth/login').set('X-CSRF-Token', csrfToken)
        .send({ email: user.email, password: 'StrongPass123' }).expect(200);
    assert.equal(JSON.stringify(login.body).includes('passwordHash'), false);
});

test('production error responses hide stack traces, secrets, and internal error messages', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const oldConsoleError = console.error;
    process.env.NODE_ENV = 'production';
    console.error = () => {};
    const response = {
        statusCode: 0,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
    try {
        errorHandler(new Error('database password: private-secret'), {}, response, () => {});
    } finally {
        console.error = oldConsoleError;
        process.env.NODE_ENV = previousNodeEnv;
    }
    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, { success: false, message: 'Internal server error.' });

    process.env.NODE_ENV = 'production';
    try {
        const validationResponse = { ...response, statusCode: 0, body: undefined };
        errorHandler(Object.assign(new Error('mongodb internal validation detail'), { name: 'ValidationError', errors: {} }), {}, validationResponse, () => {});
        assert.deepEqual(validationResponse.body, { success: false, message: 'Invalid request.' });
    } finally {
        process.env.NODE_ENV = previousNodeEnv;
    }
});

