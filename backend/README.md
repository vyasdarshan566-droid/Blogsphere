# BlogSphere Backend

Node.js REST API built with Express, Mongoose, and MongoDB Atlas.

## Requirements

- Node.js 20 or newer
- MongoDB Atlas cluster (or a local MongoDB deployment)
- Atlas database user and network access configured for the machine running the API

## Setup

1. From `backend/`, install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and `CSRF_SECRET`. Each secret must contain at least 32 characters and they must be different. Never commit `.env` or production credentials.
3. In MongoDB Atlas, create a database user, allow the development machine's IP in Network Access, and paste the Atlas connection string into `MONGODB_URI`. URL-encode special characters in the database password.
4. Set `FRONTEND_URL` to the exact browser origin of the frontend. For deployment, serve the API and frontend over HTTPS. Cross-site deployments require `COOKIE_SAME_SITE=none` and secure cookies.
5. Start in development with `npm run dev`, or run `npm start` for the production process. The default port is `5000`.

The JSON health check is `GET /api/health`; it returns HTTP 200 only when Mongoose is connected and 503 otherwise. Start the server only after the configured database is available.

## Cookie and CSRF flow

Authentication is held in an HttpOnly `token` cookie. Obtain a signed, non-HttpOnly CSRF token from `GET /api/auth/csrf`; the response body includes `csrfToken` and the matching cookie is set. Send that value in `X-CSRF-Token` on login, registration, logout, and all other state-changing requests. Send cookies with browser requests (`credentials: 'include'` / Axios `withCredentials: true`). CORS allows only the configured frontend origin(s) and credentials. For cookie-authenticated requests on every POST/PATCH/PUT/DELETE route, use the same CSRF bootstrap/header flow.

## API endpoints

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Posts: `GET /api/posts` (page, limit, q/search, category, tag/tags, author, sort), `GET /api/posts/:slug`, `POST /api/posts`, `PATCH /api/posts/:id`, `DELETE /api/posts/:id`
- Comments: `GET/POST /api/posts/:id/comments`, `DELETE /api/comments/:id`
- Users: `GET /api/users/:id`, `PATCH /api/users/me`
- Admin: `GET /api/admin/dashboard`, `GET /api/admin/users`, `GET /api/admin/posts`, `DELETE /api/admin/posts/:id`, `PATCH /api/admin/users/:id/role`
- Health: `GET /api/health`

Post list results are published-only and include pagination metadata. Search uses a MongoDB text index across title, excerpt, and content; tags accept either `tag=value` or comma-separated `tags=value1,value2`. Sorting accepts `newest`, `oldest`, `popular`, or `title`; `popular` is view-count based, with publish date as a tiebreaker. Post details use shareable slugs, and comments load separately via `GET /api/posts/:id/comments` so a comment-list error does not hide the article. The current legacy frontend endpoints (`PUT /api/posts/:id`, `/api/posts/featured`, `/api/posts/my`, `/api/comments/post/:postId`, and `/api/admin/stats`) remain available where applicable.

Passwords are bcrypt-hashed. `passwordHash` is excluded by default and removed from serialization. Post mutations require the owner or an admin; comment deletion requires its author or an admin. Inputs, route IDs, and query parameters are validated.

Registration passwords require at least 12 characters with uppercase, lowercase, and numeric characters. Logout increments the account session version, revoking copied JWTs. Public profile responses omit email addresses. In production, 5xx and internal validation/database errors return sanitized messages without stack traces.

Comments are returned newest first with only required fields and author name/avatar. Post and comment references have asynchronous existence validators. Comment creation and post/user cascades run in MongoDB transactions, preventing concurrent comment creation from leaving orphan records. Atlas clusters support transactions; local test MongoDB also runs as a single-node replica set. Post deletion removes comments and the post atomically; admin user deletion removes authored and attached comments, posts, and the user in one transaction.

## Development data and tests

- `npm run seed` clears the configured database and inserts sample-only user, post, and comment data. It refuses to run in production and requires `ALLOW_DESTRUCTIVE_SEED=true` plus `SEED_USER_PASSWORD` (16+ characters). Use a dedicated development database; the sample login is `author@example.test` with the password you supplied in the development environment.
- `npm test` runs API integration tests against an ephemeral MongoDB instance via `mongodb-memory-server`. The first run needs network access to download its MongoDB binary (about 600 MB). Tests cover health/authentication, CSRF cookie flow, post CRUD and ownership, search filters, and comment permissions.

The security regression suite additionally checks duplicate-email behavior, bcrypt storage, invalid/expired/revoked sessions, cookie flags and clearing, CSRF mismatch/forgery rejection, CORS allowlisting, rate limiting, role authorization and revocation, public profile privacy, startup secret checks, and production error sanitization.