# BlogSphere — Implementation Plan

## Architecture Overview

```
BlogSphere/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB connection, env
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, error, rate-limit
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helpers, token utils
│   │   └── validations/      # Zod schemas
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── api/              # Axios instances + API calls
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Navbar, Footer, Sidebar
│   │   │   ├── blog/         # PostCard, PostList, etc.
│   │   │   ├── ui/           # Buttons, Inputs, etc.
│   │   │   └── common/       # Loading, Error, Empty states
│   │   ├── contexts/         # AuthContext, ThemeContext
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components (13 pages)
│   │   ├── utils/            # formatters, validators
│   │   └── App.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Implementation Phases

### Phase 1 — Backend Foundation
1. Initialize Node.js project
2. Setup Express server with Helmet, CORS, rate-limit
3. Connect MongoDB Atlas via Mongoose
4. Create User, Post, Comment models
5. Setup JWT utility (httpOnly cookies)
6. Auth middleware (verifyToken, requireRole)
7. Centralized error handler

### Phase 2 — Backend API Routes
1. Auth: register, login, logout, me
2. Posts: CRUD, search, filter, paginate
3. Comments: create, delete
4. Users: profile, update
5. Admin: stats, manage users/posts

### Phase 3 — Frontend Foundation
1. Vite + React project
2. Tailwind CSS + shadcn/ui
3. React Router setup
4. Axios instance with interceptors
5. AuthContext + protected routes
6. TanStack Query provider

### Phase 4 — Frontend Pages
1. Home, Explore, Post Details
2. Login, Register
3. Create/Edit blog
4. Dashboard, Profile, My Blogs
5. Admin Dashboard
6. Search Results
7. 404 page

### Phase 5 — Polish & Config
1. Loading, error, empty states
2. Toast notifications
3. Mobile responsive nav
4. .env.example files
5. README + API docs
6. .gitignore
