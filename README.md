# BlogSphere 🌐

A complete, production-ready blog publishing platform built with React, Node.js, Express, and MongoDB Atlas.

---

## Features

- ✅ User registration & login (JWT via httpOnly cookies)
- ✅ Secure bcrypt password hashing
- ✅ Role-based authorization (user / admin)
- ✅ Create, edit, delete blog posts
- ✅ Draft / publish workflow
- ✅ Comments with ownership controls
- ✅ Full-text search
- ✅ Category and tag filtering
- ✅ Pagination
- ✅ User profiles
- ✅ Admin dashboard (manage users & posts)
- ✅ Loading / empty / error states
- ✅ Toast notifications
- ✅ Fully responsive mobile design
- ✅ Helmet, CORS, rate-limiting security

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React 18 + Vite | UI framework + dev server |
| React Router v6 | Client-side routing |
| TanStack Query | Server state management |
| React Hook Form + Zod | Form validation |
| Axios | HTTP client |
| Framer Motion | Animations |
| Lucide React | Icons |
| react-hot-toast | Notifications |
| Tailwind CSS v4 | Styling |

### Backend
| Library | Purpose |
|---|---|
| Express.js | HTTP framework |
| Mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| cookie-parser | Cookie handling |
| helmet | Security headers |
| cors | CORS policy |
| express-rate-limit | Auth rate limiting |
| zod | Schema validation |
| slugify | URL slug generation |
| morgan | HTTP logging |

---

## Project Structure

```
BlogSphere/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── controllers/          # Business logic
│   │   │   ├── authController.js
│   │   │   ├── postController.js
│   │   │   ├── commentController.js
│   │   │   ├── userController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT middleware
│   │   │   └── errorHandler.js   # Centralized errors
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   └── Comment.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── errors.js
│   │   └── validations/
│   │       └── schemas.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js          # Axios instance
    │   │   └── index.js          # API functions
    │   ├── components/
    │   │   ├── blog/
    │   │   │   ├── PostCard.jsx
    │   │   │   ├── FeaturedPostCard.jsx
    │   │   │   └── Pagination.jsx
    │   │   ├── common/
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   ├── EmptyState.jsx
    │   │   │   └── ErrorMessage.jsx
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       ├── Footer.jsx
    │   │       └── Layout.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/                # 13 pages
    │   │   ├── HomePage.jsx
    │   │   ├── ExplorePage.jsx
    │   │   ├── BlogDetailPage.jsx
    │   │   ├── SearchPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── PostEditorPage.jsx  # Create + Edit
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── EditProfilePage.jsx
    │   │   ├── MyBlogsPage.jsx
    │   │   ├── AdminDashboardPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier works fine)

---

### 1. Clone & Setup

```bash
git clone <your-repo>
cd BlogSphere
```

---

### 2. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Go to **Database Access** → Add a database user
4. Go to **Network Access** → Allow your IP (or `0.0.0.0/0` for dev)
5. Click **Connect** → **Connect your application** → Copy the URI

The URI looks like:
```
mongodb+srv://username:password@cluster0.xxxxxxx.mongodb.net/blogsphere?retryWrites=true&w=majority
```

---

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — a long random string (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `CLIENT_ORIGIN` — `http://localhost:5173` for development

```bash
npm install
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

### 5. Create Admin User

Register normally, then in MongoDB Atlas or via Compass, update your user document:
```json
{ "role": "admin" }
```

Or use MongoDB Compass:
1. Connect to your cluster
2. Open `blogsphere` → `users` collection
3. Find your user → Edit → Change `role` to `"admin"`

---

## API Documentation

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login (sets cookie) |
| POST | `/api/auth/logout` | Yes | Logout (clears cookie) |
| GET | `/api/auth/me` | Yes | Get current user |

### Posts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | No | List posts (filter: `?q=`, `?category=`, `?tag=`, `?author=`, `?page=`, `?limit=`) |
| GET | `/api/posts/featured` | No | Top 6 posts by views |
| GET | `/api/posts/my` | Yes | My posts |
| GET | `/api/posts/:slug` | No | Get post by slug |
| POST | `/api/posts` | Yes | Create post |
| PUT | `/api/posts/:id` | Yes | Update post (owner/admin) |
| DELETE | `/api/posts/:id` | Yes | Delete post (owner/admin) |

### Comments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/comments/post/:postId` | Yes | Add comment |
| DELETE | `/api/comments/:id` | Yes | Delete comment (owner/admin) |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/:id` | No | Get user profile |
| PUT | `/api/users/:id` | Yes | Update profile (own/admin) |

### Admin (requires admin role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | All users paginated |
| DELETE | `/api/admin/users/:id` | Delete user + their posts |
| PATCH | `/api/admin/users/:id/role` | Update user role |
| GET | `/api/admin/posts` | All posts paginated |

---

## Security Notes

- Passwords hashed with bcrypt (cost factor 12)
- JWT stored in httpOnly, SameSite cookie (not localStorage)
- CORS configured via `CLIENT_ORIGIN` env var
- Rate limiting on auth endpoints (20 req / 15 min)
- Helmet sets security headers
- Ownership verified before modifying/deleting posts and comments
- Stack traces hidden in production responses
- `.env` files are gitignored

---

## Production Deployment

### Backend
```bash
NODE_ENV=production
# Set all env vars, use a production MongoDB URI
npm start
```

### Frontend
```bash
npm run build
# Serve the dist/ folder from any static host (Vercel, Netlify, etc.)
# Set VITE_API_BASE_URL to your production backend URL
```

---

## Post Categories

`Technology`, `Programming`, `Design`, `Business`, `Science`, `Health`, `Travel`, `Food`, `Lifestyle`, `Other`

---

## License

MIT
