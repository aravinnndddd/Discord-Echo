import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { activityStore, sseClients } from "./store.js";

dotenv.config();

/* ================= ENV CHECK ================= */

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is missing");
}

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= CORS ================= */

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET"],
  }),
);

/* ================= DISCORD CLIENT ================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

/* ================= IMAGE RESOLVER ================= */

function resolveDiscordImage(appId, image) {
  if (!image) return null;

  if (image.startsWith("mp:external/")) {
    return image.replace(
      "mp:external/",
      "https://media.discordapp.net/external/",
    );
  }

  if (appId) {
    return `https://cdn.discordapp.com/app-assets/${appId}/${image}.png`;
  }

  return null;
}

/* ================= SSE HELPER ================= */

function sendSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((res) => res.write(payload));
}

/* ================= SPOTIFY EXTRACTOR ================= */

function extractSpotify(activities) {
  const spotify = activities.find((a) => a.name === "Spotify");
  if (!spotify) return null;

  return {
    song: spotify.details ?? null,
    artist: spotify.state ?? null,
    album: spotify.assets?.largeText ?? null,
    album_art_url: spotify.assets?.largeImage ?? null,
  };
}

/* ================= PRESENCE UPDATE ================= */

client.on("presenceUpdate", (_, presence) => {
  if (!presence?.user || presence.user.bot) return;

  const activities = presence.activities.map((a) => ({
    name: a.name,
    type: ActivityType[a.type],
    details: a.details ?? null,
    state: a.state ?? null,
    platform: a.platform ?? null,
    startedAt: a.timestamps?.start ?? null,
    assets: {
      largeImage: resolveDiscordImage(a.applicationId, a.assets?.largeImage),
      smallImage: resolveDiscordImage(a.applicationId, a.assets?.smallImage),
      spotifyAlbumArt: extractSpotify([a])?.album_art_url ?? null,
      largeText: a.assets?.largeText ?? null,
      smallText: a.assets?.smallText ?? null,
    },
  }));

  const payload = {
    userId: presence.user.id,
    username: presence.user.username,
    avathar: presence.user.displayAvatarURL({
      dynamic: true,
      size: 256,
    }),
    status: presence.status,
    activities,
    updatedAt: new Date().toISOString(),
  };

  activityStore.set(presence.user.id, payload);
  sendSSE(payload);

  console.log("⚡ Presence Update:", presence.user.username);
});

/* ================= REST API ================= */

app.get("/api/activities", (_, res) => {
  res.json([...activityStore.values()]);
});

app.get("/api/activities/:userId", (req, res) => {
  const data = activityStore.get(req.params.userId);
  if (!data) return res.status(404).json({ message: "User not found" });
  res.json(data);
});

/* ================= SSE API ================= */

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ message: "connected" })}\n\n`);
  sseClients.add(res);

  req.on("close", () => sseClients.delete(res));
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`🌐 API running on port ${PORT}`);
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
