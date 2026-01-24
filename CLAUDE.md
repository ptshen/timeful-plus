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
