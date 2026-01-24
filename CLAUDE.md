# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timeful (formerly Schej.it) is a scheduling/availability polling platform that helps groups find the best meeting time through availability polls with calendar integration (Google, Outlook, Apple).

**Tech Stack:**
- Frontend: Vue 2 + Vuetify + TailwindCSS
- Backend: Go 1.20 + Gin framework
- Database: MongoDB 6.0
- Infrastructure: Docker Compose

## Development Commands

### Docker (Primary Development Method)
```bash
make up              # Start with source build
make up-ghcr         # Start with pre-built images (faster)
make down            # Stop services
make dev             # Start with live logs
make logs            # View all logs
make shell-db        # MongoDB shell (mongosh schej-it)
```

### Frontend (in /frontend)
```bash
npm run serve        # Dev server at http://localhost:8080
npm run build        # Production build to /dist
```

### Backend (in /server)
```bash
go build             # Build binary
go test ./...        # Run tests
```

### Formatting
Frontend uses Prettier: 2-space tabs, no semicolons

## Architecture

### Backend Structure (/server)
- `main.go` - Entry point, Gin router setup on port 3002, API routes under `/api`
- `routes/` - API endpoints (events.go, auth.go, user.go, folders.go, stripe.go)
- `services/` - External integrations
  - `calendar/` - Google, Outlook, Apple calendar providers (interface-based design)
  - `auth/` - OAuth handlers
- `models/` - MongoDB document schemas (Event, User, Response, Attendee)
- `db/` - Database layer with global collection references
- `middleware/` - Session/cookie authentication
- `utils/` - Helper functions

### Frontend Structure (/frontend/src)
- `main.js` - Vue entry point
- `views/` - Route pages (Event.vue, Group.vue, Home.vue, Settings.vue)
- `components/` - Reusable components organized by feature
- `utils/services/` - API calls to backend

### Key Patterns
- Session-based authentication via cookies
- Calendar providers implement a common interface for parallel async fetching
- Event types: `specific_dates`, `dow` (day of week), `group` (availability groups)
- Frontend uses Vuex for state, Vue Router for navigation
- Custom error package in `server/errs/`

## Configuration

Environment variables in `.env` (see `.env.example`):
- `ENCRYPTION_KEY` (required) - For database encryption
- `CLIENT_ID`/`CLIENT_SECRET` - Google OAuth (optional, enables login/calendars)
- `MICROSOFT_CLIENT_ID`/`MICROSOFT_CLIENT_SECRET` - Outlook calendar (optional)
- `SELF_HOSTED_PREMIUM=true` - Unlocks premium features for self-hosted

Frontend config in `config.js` (copy from `config.example.js`):
- `googleClientId` - Must match `CLIENT_ID` in `.env`
- `microsoftClientId` - Must match `MICROSOFT_CLIENT_ID` in `.env`

## API Documentation

Swagger UI available at `/swagger/index.html` when backend is running.

## Production Deployment Tutorial (Vercel + Railway)

**Architecture:**
- Frontend: Vercel (Vue 2 SPA)
- Backend: Railway (Go + Docker)
- Database: MongoDB Atlas (managed)

### Deployment Files

| File | Purpose |
|------|---------|
| `/vercel.json` | Vercel config with API proxy rewrites |
| `/railway.json` | Railway config using Dockerfile.backend |
| `/frontend/public/config.js` | Runtime OAuth credentials |

---

### Step 1: Set Up MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account
2. Click **"Build a Database"** → Select **"M0 FREE"** tier
3. Choose a cloud provider and region closest to your users
4. Click **"Create Deployment"**
5. **Create database user:**
   - Username: `timeful-admin` (or your choice)
   - Password: Click "Autogenerate Secure Password" and **save it**
   - Click "Create Database User"
6. **Configure network access:**
   - Click "Add My Current IP Address" for testing
   - For production, click "Add IP Address" → enter `0.0.0.0/0` → "Allow Access from Anywhere"
7. Click **"Finish and Close"**
8. **Get connection string:**
   - Click "Database" in sidebar → "Connect" button on your cluster
   - Select "Drivers" → Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://timeful-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

### Step 2: Set Up Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Navigate to **"APIs & Services"** → **"Credentials"**
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. If prompted, configure OAuth consent screen first:
   - User Type: External
   - App name: "Timeful"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue" through scopes and test users
6. Back to Credentials → Create OAuth client ID:
   - Application type: **"Web application"**
   - Name: "Timeful Production"
   - **Authorized JavaScript origins:**
     - `https://your-vercel-domain.vercel.app` (temporary)
     - `https://timeful.app` (if using custom domain)
   - **Authorized redirect URIs:**
     - `https://your-vercel-domain.vercel.app/auth`
     - `https://timeful.app/auth` (if using custom domain)
7. Click **"Create"**
8. **Save the Client ID and Client Secret** - you'll need both

---

### Step 3: Deploy Backend to Railway

1. Go to https://railway.app and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your Timeful repository
4. Railway will detect the Dockerfile. If it doesn't:
   - Go to Settings → Build → Set Dockerfile Path to `Dockerfile.backend`
5. **Add environment variables** (Settings → Variables → "New Variable"):

   ```
   MONGO_URI=mongodb+srv://timeful-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGO_DB_NAME=schej-it
   ENCRYPTION_KEY=<run: openssl rand -base64 32>
   CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
   CLIENT_SECRET=<your-google-client-secret>
   BASE_URL=https://your-vercel-domain.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
   SELF_HOSTED_PREMIUM=true
   ```

   Generate ENCRYPTION_KEY locally:
   ```bash
   openssl rand -base64 32
   ```

6. Click **"Deploy"** and wait for build to complete
7. Go to **Settings → Networking → Generate Domain**
8. **Copy your Railway URL** (e.g., `timeful-backend-production.up.railway.app`)
9. **Verify deployment:** Visit `https://YOUR_RAILWAY_URL/api/health` - should return `{"status":"ok"}`

---

### Step 4: Update vercel.json with Railway URL

Edit `/vercel.json` and replace `YOUR_RAILWAY_DOMAIN`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://timeful-backend-production.up.railway.app/api/:path*" }
  ]
}
```

---

### Step 5: Update Frontend Config

Edit `/frontend/public/config.js` with your OAuth credentials:

```javascript
window.__TIMEFUL_CONFIG__ = {
  googleClientId: "123456789-xxxxx.apps.googleusercontent.com",
  microsoftClientId: "",  // Optional: Add if using Outlook
  disableAnalytics: false,
}
```

---

### Step 6: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your Timeful repository
4. **Configure build settings:**
   - Framework Preset: `Other`
   - Root Directory: `/` (leave default)
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm ci`
5. Click **"Deploy"**
6. **Copy your Vercel URL** (e.g., `timeful-xxxx.vercel.app`)

---

### Step 7: Update OAuth Redirect URIs

Now that you have your Vercel URL, update Google OAuth:

1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Click on your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins:**
   - `https://your-actual-vercel-url.vercel.app`
4. Add to **Authorized redirect URIs:**
   - `https://your-actual-vercel-url.vercel.app/auth`
5. Click **"Save"**

---

### Step 8: Update Railway Environment Variables

Update BASE_URL and CORS with your actual Vercel URL:

1. Go to Railway → Your project → Variables
2. Update:
   ```
   BASE_URL=https://your-actual-vercel-url.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-actual-vercel-url.vercel.app
   ```
3. Railway will automatically redeploy

---

### Step 9: Verify Deployment

1. **Frontend loads:** Visit `https://your-vercel-url.vercel.app`
2. **API responds:** Visit `https://your-vercel-url.vercel.app/api/auth/status`
3. **Create an event:** Test the full flow without login
4. **Google login:** Click sign in and complete OAuth flow
5. **Calendar integration:** Connect Google Calendar and verify events appear

---

### Step 10: Custom Domain (Optional)

**For Vercel (frontend):**
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add `timeful.app` (or your domain)
3. Add DNS records at your registrar:
   - Type: CNAME, Name: `@` or `www`, Value: `cname.vercel-dns.com`

**For Railway (backend):**
1. Railway → Settings → Networking → Custom Domain
2. Add `api.timeful.app`
3. Add DNS record: CNAME `api` → your Railway domain

**After custom domains:**
1. Update `vercel.json` rewrites to use `https://api.timeful.app/api/:path*`
2. Update Railway env vars: `BASE_URL` and `CORS_ALLOWED_ORIGINS` to `https://timeful.app`
3. Update Google OAuth origins and redirect URIs with custom domain

---

### Troubleshooting

**"CORS error" in browser console:**
- Verify `CORS_ALLOWED_ORIGINS` in Railway matches your Vercel URL exactly (no trailing slash)

**"OAuth redirect mismatch" error:**
- Ensure redirect URI in Google Console exactly matches `https://your-domain/auth`

**API calls return 502/504:**
- Check Railway logs for errors
- Verify `MONGO_URI` is correct and IP is whitelisted in Atlas

**Login doesn't persist:**
- If using different domains for frontend/backend, cookies may need `SameSite=None; Secure`

---

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `MONGO_DB_NAME` | Yes | `schej-it` |
| `ENCRYPTION_KEY` | Yes | Generate with `openssl rand -base64 32` |
| `CLIENT_ID` | Yes* | Google OAuth Client ID |
| `CLIENT_SECRET` | Yes* | Google OAuth Client Secret |
| `BASE_URL` | Yes | Frontend URL (e.g., `https://timeful.app`) |
| `CORS_ALLOWED_ORIGINS` | Yes | Frontend URL (same as BASE_URL) |
| `MICROSOFT_CLIENT_ID` | No | Azure OAuth Client ID (for Outlook) |
| `MICROSOFT_CLIENT_SECRET` | No | Azure OAuth Client Secret |
| `SELF_HOSTED_PREMIUM` | No | `true` to unlock premium features |

*Required for Google login and calendar integration

---

### Known Limitations

- **Dynamic meta tags**: Event-specific OG images/titles don't work without SSR (Go backend serving HTML)
- **Session cookies**: May need `SameSite=None; Secure` if frontend/backend domains differ
