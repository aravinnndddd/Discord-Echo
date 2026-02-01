# Discord Echo

A self-hosted Discord presence & activity API 

This service listens to Discord presence updates and exposes:

- User online status
- Activities (VS Code, Games, Custom status)
- Spotify activity (song, artist, album, album art)
- REST API
- Optional real-time SSE stream

Built for portfolios, dashboards, and personal websites.

---

## ✨ Features

- 🟢 Discord online / idle / dnd status
- 💻 VS Code activity (file & workspace info)
- 🎮 Game activity (e.g. Valorant)
- 🎧 Spotify activity with album art
- 🌐 REST API
- ⚡ Optional Server-Sent Events (SSE)
- 🔐 Secure CORS with multiple origins
- 📦 In-memory storage (easy to extend to DB)

---

## 🧱 Tech Stack

- Node.js
- discord.js v14
- Express
- CORS
- dotenv

---

## 📁 Project Structure

```
Your_BOT/
├── src/
│   ├── index.js
│   └── store.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🤖 Discord Bot Setup

1. Go to **Discord Developer Portal**
2. Create an application → Add Bot
3. Enable **Privileged Gateway Intents**:
   - Presence Intent
   - Server Members Intent

4. Copy the **Bot Token**
5. Invite the bot to your server

> ⚠️ Users must NOT be invisible to emit presence updates.

---

## ⚙️ Environment Variables

Create a `.env` file using `.env.example`.

```env
DISCORD_TOKEN=your_discord_bot_token_here
ALLOWED_ORIGINS=http://localhost:5173,your domain
PORT=3000
```

- `DISCORD_TOKEN` → Discord bot token
- `ALLOWED_ORIGINS` → Comma-separated list of allowed frontend origins
- `PORT` → API port (default: 3000)

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Start the server

```bash
npm start
```

You should see:

```
✅ Logged in as <bot-name>
🌐 API running on port 3000
```

---

## 📡 API Endpoints

### Get all tracked users

```
GET /api/activities
```

### Get activity for a specific user

```
GET /api/activities/:userId
```

### Real-time stream (optional)

```
GET /api/stream
```

---

## 📦 Example Response

```json
{
  "userId": "xxxxxxxxxxxxxx",
  "username": "name",
  "avathar": "https://cdn.discordapp.com/avatars/...",
  "status": "online",
  "activities": [
    {
      "name": "Code",
      "type": "Playing",
      "details": "In portfolio - 0 problems found",
      "state": "Working on hero.tsx",
      "assets": {
        "largeImage": "https://media.discordapp.net/external/...",
        "smallImage": "https://media.discordapp.net/external/..."
      }
    }
  ],
  "updatedAt": "2026-01-25T15:42:10.000Z"
}
```

> ⚠️ Field names like `avathar` are intentionally kept as-is.

---

## ⚠️ Important Notes

- Presence updates are **event-based**
- If no activity changes → no updates
- Invisible users do not emit presence data
- Storage is **in-memory only**
  - Restarting the server clears data

---

## 🛠️ Possible Extensions

- PostgreSQL / MongoDB persistence
- Redis caching
- Activity history & analytics
- Authentication layer
- Docker support
- Frontend dashboard

---

## 📄 License

MIT License

You are free to use, modify, and distribute this project.



