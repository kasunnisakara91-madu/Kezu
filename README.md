# 🦋 CRIMINAL-API 🦋
**Powered by DCT TEAM**

A production-ready, high-performance Music & Song API platform with secure Admin Panel, User Management, API Key generation, and a real database-backed Coin/Credit billing system.

---

## 🌟 Key Features

- **Real Music & Song Catalog**: High-speed real-time search, deep song metadata, playable audio streams, and direct audio download links.
- **Dynamic Coin Billing System**:
  - Configurable coin pricing per endpoint (`/api/search`: 1 coin, `/api/song`: 1 coin, `/api/download`: 2 coins, `/api/health`: 0 coins).
  - Coins never go negative.
  - Transparent transaction audit history (CREDIT / DEBIT, balance before/after, reasons).
  - Welcome bonus coins on new user registration (configurable by Admin).
- **Dual Authentication**:
  - `Authorization: Bearer YOUR_API_KEY`
  - Query parameter `?apikey=YOUR_API_KEY`
  - Header `x-api-key: YOUR_API_KEY`
- **User Dashboard**:
  - Live coin balance with butterfly glow
  - API Key with one-click copy, reveal/hide, and instant revocation/regeneration
  - Total, successful, and failed request counters
  - Real-time API request log table & Coin transaction history
- **Interactive API Studio (`/tester`)**:
  - Built-in browser request tester (no external tool like Postman needed)
  - Live latency counter (ms), status inspector, remaining coin balance
  - Embedded audio stream player with seek bar and volume controls
- **Full-featured Enterprise Admin Panel**:
  - Metrics overview (Users, Active, Banned, Total calls, Coins used/circulating)
  - User management (search, grant coins, deduct coins, ban/unban, reset keys, delete)
  - Coin rules & per-endpoint pricing configuration
  - Endpoint toggles & error log inspection
  - System settings (maintenance mode with broadcast message, signup gates, rate limits)

---

## 🚀 API Endpoints

| Method | Endpoint | Default Cost | Description |
|---|---|---|---|
| `GET` | `/api/search?q={query}` | 1 Coin | Search global tracks, artists, albums & audio preview streams |
| `GET` | `/api/song?q={query}` | 1 Coin | Detailed metadata, bitrate, lyrics snippet, and direct stream URL |
| `GET` | `/api/download?q={query}` | 2 Coins | High-speed audio download link resolver (256-320kbps format) |
| `GET` | `/api/health` | 0 Coins (Free) | Service uptime, engine status, and database health |

---

## 🛠️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Port (default 3000)
PORT=3000

# MongoDB Connection String (leave empty for automatic persistent local storage)
MONGODB_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/criminal_api?retryWrites=true&w=majority"

# JWT Secret for user and admin token signing
JWT_SECRET="criminal_api_super_secret_jwt_key_dct_team_2026"

# Default Admin Credentials
ADMIN_EMAIL="admin@criminal-api.dct"
ADMIN_PASSWORD="Admin@Criminal2026!"

# API Base URL
API_BASE_URL="http://localhost:3000"
```

---

## 🚢 Production Deployment

### 🚂 Deploying on Railway

1. Push this repository to GitHub.
2. In Railway, click **New Project** → **Deploy from GitHub repo**.
3. Add a **MongoDB** plugin database or supply an external `MONGODB_URL`.
4. In project **Variables**, set:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `PORT=3000`
5. Railway will automatically run:
   - Build: `npm run build`
   - Start: `npm run start` (or `tsx server.ts`)

### 🌐 Deploying on Render

1. Create a new **Web Service** pointing to your repository.
2. Runtime: **Node**.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add the environment variables (`MONGODB_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

---

## 🎵 Custom Song Scripts Integration

If you have custom song search and download scripts:
Place your script in `server/scripts/custom_song_engine.js` exporting:
```javascript
export async function searchSongs(query) { ... }
export async function getSongDetails(queryOrId) { ... }
export async function getDownloadInfo(queryOrId) { ... }
```
The server will automatically load your custom scripts without modifying core routing or coin logic.

---

## 👑 Credits

Developed and engineered by **DCT TEAM**.
🦋 CRIMINAL-API 🦋 — All Rights Reserved.
