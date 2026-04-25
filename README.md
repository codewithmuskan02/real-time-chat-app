# Realtime Chat App (Slack/Discord Style)

Production-ready full-stack realtime chat application with direct messages, group rooms, online presence, read receipts, unread counters, and push notification primitives.

## Tech Stack

- Frontend: Next.js 14 (App Router), TailwindCSS, Zustand, Socket.io Client
- Backend: Node.js, Express, TypeScript, Socket.io
- Database: MongoDB + Mongoose
- Cache/Presence: Redis (Upstash-compatible)
- Auth: JWT access token (15m) + refresh token in HTTP-only cookie (7d)
- File Uploads: Cloudinary signed uploads

## Project Structure

- `client` - Next.js frontend
- `server` - Express + Socket.io backend

## Core Features

- Signup/login/logout/refresh auth flow with protected APIs
- 1:1 DMs and group rooms
- Realtime messaging, typing indicators, and presence
- Read receipts (`✓`, `✓✓`)
- Unread counters (Redis hash per user)
- Inline image/file message rendering
- Notification bell with total unread count
- Paginated messages (30 per request, infinite scroll upward)
- Optimistic send in chat window
- Mobile-responsive layout

## API Endpoints

Implemented under `server/src/routes`:

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `GET /api/auth/me`
- Users: `GET /api/users/search?q=`, `GET /api/users/:id`
- Rooms: `POST /api/rooms`, `GET /api/rooms`, `POST /api/rooms/dm/:userId`, `POST /api/rooms/:id/invite`, `DELETE /api/rooms/:id/members/:userId`
- Messages: `GET /api/messages/:roomId?page=1&limit=30`, `POST /api/messages/:roomId/read`
- Files: `POST /api/upload`
- Notifications: `GET /api/notifications/unread`, `POST /api/notifications/subscribe`

## Socket Events

- Client emits: `message:send`, `message:read`, `typing:start`, `typing:stop`
- Server emits: `message:receive`, `message:read:update`, `user:online`, `user:offline`, `typing:update`

## Architecture Diagram Description

1. Browser client authenticates against Express auth APIs.
2. Access token is used for REST and Socket.io authentication.
3. Express persists data in MongoDB (users, rooms, messages).
4. Socket.io handles realtime fanout and typing/read events.
5. Redis stores online user socket mapping and per-room unread counters.
6. Cloudinary stores uploaded message files/images via signed upload parameters from backend.

## Setup

### 1) Start MongoDB + Redis

```bash
docker-compose up -d
```

### 2) Configure environment files

- Copy `server/.env.example` to `server/.env` and fill all values.
- Copy `client/.env.local.example` to `client/.env.local`.

### 3) Install and run backend

```bash
cd server
npm install
npm run dev
```

### 4) Install and run frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3000`.

## Screenshot Placeholders

- `[ ] Login page screenshot`
- `[ ] Chat layout screenshot (sidebar + chat window)`
- `[ ] DM conversation screenshot`
- `[ ] Group room screenshot with unread badges`
- `[ ] Mobile responsive screenshot`
