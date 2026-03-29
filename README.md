# JobPortal 2.0

Production-oriented full-stack job portal: **React (Vite) + Tailwind CSS + Framer Motion + Axios** on the frontend, and **Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt** on the backend.

## Features

- **Authentication:** Sign up / login with JWT; roles **job seeker** and **recruiter**; password hashing with bcrypt.
- **Job seekers:** Profile (skills, bio, resume URL), browse jobs with **search + filters** (location, role/title, skills), **apply** with cover letter + resume, **view applications**, **save jobs** (bookmarks).
- **Recruiters:** Post / edit / delete jobs, **view applicants** per job, **accept / reject** applications (pending → accepted / rejected).
- **UI:** Glass-style layout, Framer Motion transitions, responsive layout, loading skeletons, **toast** notifications, **dark mode** toggle.
- **Optional:** Resume upload via **Cloudinary** when `CLOUDINARY_*` env vars are set.

## Project layout

```
/client    # Vite + React frontend
/server    # Express API (MVC)
```

## Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** cluster (or local MongoDB) and connection string

## Environment variables

### Server (`server/.env`)

Copy from `server/.env.example`:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (required) |
| `JWT_SECRET` | Long random string for signing tokens (required) |
| `JWT_EXPIRES_IN` | Optional, default `7d` |
| `PORT` | API port, default `5000` |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173` or your Vercel URL) |
| `CLOUDINARY_*` | Optional; enables `POST /api/upload/resume` |

### Client (`client/.env`)

Copy from `client/.env.example`:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the API (e.g. `http://localhost:5000` or your Render/Railway URL) |

## Run locally

**1. MongoDB**

Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), allow your IP (or `0.0.0.0/0` for dev), and copy the SRV connection string.

**2. Backend**

```bash
cd server
copy .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, CLIENT_URL=http://localhost:5173
npm install
npm run dev
```

**3. Frontend** (new terminal)

```bash
cd client
copy .env.example .env
# VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Open **http://localhost:5173**.

## Sample data

With `MONGODB_URI` set in `server/.env`:

```bash
cd server
npm run seed
```

Demo accounts (password `DemoPass123`):

- **Seeker:** `seeker@demo.com`
- **Recruiter:** `recruiter@demo.com`

## API summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (JWT) |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/jobs` | List jobs (query: `page`, `limit`, `search`, `location`, `role`, `skills`) |
| GET | `/api/jobs/:id` | Job detail |
| POST | `/api/jobs` | Create job (recruiter) |
| PUT | `/api/jobs/:id` | Update job (owner) |
| DELETE | `/api/jobs/:id` | Delete job (owner) |
| GET | `/api/jobs/saved` | Saved jobs (seeker) |
| POST | `/api/jobs/:id/save` | Bookmark job (seeker) |
| DELETE | `/api/jobs/:id/save` | Remove bookmark |
| GET | `/api/jobs/:id/applicants` | Applicants for a job (recruiter) |
| POST | `/api/apply/:jobId` | Apply (seeker) |
| GET | `/api/applications` | List applications (role-based) |
| PUT | `/api/applications/:id/status` | Set status (recruiter) |
| POST | `/api/upload/resume` | Multipart `file` (Cloudinary required) |

Health check: `GET /health`

## Deployment

### Deploy on Render (API + static frontend)

Use **two** Render resources from the same Git repo: a **Web Service** (Node API) and a **Static Site** (Vite build). There is **no `SESSION_SECRET`** in this project; auth uses **JWT** — set **`JWT_SECRET`** on the server only.

**0. Prerequisites**

- Code on **GitHub** (or GitLab/Bitbucket) connected to Render.
- **MongoDB Atlas** URI; in Atlas → Network Access, allow **`0.0.0.0/0`** (or Render’s egress IPs) so the API can connect.

**1. Backend — Web Service**

1. Render Dashboard → **New +** → **Web Service** → connect the repo.
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Instance type:** Free tier is fine for testing.
6. **Environment** (Environment → Add Environment Variable):

   | Key | Notes |
   |-----|--------|
   | `MONGODB_URI` | Atlas connection string (required). |
   | `JWT_SECRET` | Long random string (required). **Not** `SESSION_SECRET`. |
   | `CLIENT_URL` | Your **frontend** URL once it exists, e.g. `https://your-app.onrender.com` (no trailing slash). You can add a placeholder and update after step 2. |
   | `PORT` | **Do not set** — Render injects `PORT`. The server already uses `process.env.PORT`. |

   Optional: `JWT_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

7. **Create Web Service** and wait for deploy. Copy the service URL, e.g. `https://job-portal-api.onrender.com`.

**2. Frontend — Static Site**

1. **New +** → **Static Site** → same repo.
2. **Root Directory:** `client`
3. **Build Command:** `npm install && npm run build`
4. **Publish directory:** `dist`
5. **Environment variables** (must exist **before** build — Vite bakes them in):

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | Your **API** URL from step 1, e.g. `https://job-portal-api.onrender.com` (no trailing slash). |

6. Deploy. Copy the static URL, e.g. `https://job-portal-web.onrender.com`.

**3. CORS**

1. Open the **Web Service** → **Environment**.
2. Set **`CLIENT_URL`** to the **exact** static site URL (scheme + host, no path, no trailing slash).
3. **Manual Deploy** → **Clear build cache & deploy** (or save and redeploy) so the API picks up `CLIENT_URL`.

**4. Single-page app (React Router)**

Direct visits to routes like `/jobs` must serve `index.html`. In the **Static Site** → **Redirects/Rewrites**, add a rule so all paths fall back to the SPA (Render’s UI may label this as a rewrite to `/index.html` with status **200**). If your host reads Netlify-style rules, `client/public/_redirects` is included for that pattern.

**5. Health check (optional)**

On the Web Service, set health check path to `/health`.

---

### Backend (Railway) / Frontend (Vercel / Netlify)

Same ideas: run **`npm install`** + **`npm start`** from `server/` with the same env vars; build `client/` with `VITE_API_URL` pointing at the deployed API.

Redeploy the **frontend** whenever `VITE_API_URL` changes (Vite inlines it at build time).

## Security notes

- Use a strong `JWT_SECRET` in production.
- Restrict MongoDB Atlas IP allowlist in production.
- Prefer HTTPS everywhere; `helmet` and `express-mongo-sanitize` are enabled on the API.
- Validate and limit upload size (multer limit is 5 MB).

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production build |
| `server` | `npm run dev` | API with `--watch` |
| `server` | `npm start` | API production |
| `server` | `npm run seed` | Seed demo users & jobs |

## License

Use and modify for your own projects.
