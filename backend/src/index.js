import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import moodRoutes from "./routes/moods.js";
import entryRoutes from "./routes/entries.js";
import skillRoutes from "./routes/skills.js";

dotenv.config();

// --------------------------------------------------
// Grundsetup
// --------------------------------------------------

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3001;

// __dirname für ES Modules nachbauen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wichtig für Hetzner / Apache Reverse Proxy
app.set("trust proxy", 1);

// --------------------------------------------------
// Allgemeine Middleware
// --------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Lokal braucht Vite CORS.
// Live auf Hetzner läuft Frontend + Backend auf derselben Domain.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

if (!isProduction) {
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
}

// --------------------------------------------------
// Socket.IO
// --------------------------------------------------

const io = new Server(server, {
  cors: isProduction
    ? undefined
    : {
        origin: allowedOrigins,
        credentials: true,
      },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// --------------------------------------------------
// 1) API-Routen ZUERST
// --------------------------------------------------
// Alles unter /api wird zuerst behandelt.
// Dadurch verschluckt der SPA-Fallback keine API-Anfragen.

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Mood Tracker API läuft",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/skills", skillRoutes);

// Unbekannte API-Pfade bekommen JSON statt React-HTML
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
  });
});

// --------------------------------------------------
// 2) Statische React-Dateien ausliefern
// --------------------------------------------------
// Dein Frontend liegt in:
// Web-Architectures-Vite/frontend/dist
//
// index.js liegt in:
// Web-Architectures-Vite/backend/src/index.js
//
// Deshalb: ../../frontend/dist

const distPath = path.join(__dirname, "../../frontend/dist");
const indexHtmlPath = path.join(distPath, "index.html");

if (fs.existsSync(indexHtmlPath)) {
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Dateien im assets-Ordner sind von Vite gehasht.
        // Die dürfen lange gecacht werden.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );
        }
      },
    })
  );

  console.log("✅ React Build gefunden:", distPath);
} else {
  console.warn("⚠️ Kein React Build gefunden.");
  console.warn("⚠️ Führe im frontend-Ordner aus: npm run build");
}

// --------------------------------------------------
// 3) SPA-Fallback
// --------------------------------------------------
// Wichtig für direkte URLs wie:
// /login
// /dashboard
// /skills
//
// Express kennt diese Routen nicht.
// Deshalb bekommt React immer index.html.
// React Router entscheidet dann im Browser, welche Seite gezeigt wird.
//
// Wir nutzen app.use statt app.get("*"),
// weil Express 5 bei app.get("*") Probleme machen kann.

app.use((req, res, next) => {
  if (!fs.existsSync(indexHtmlPath)) {
    return res.status(500).send(`
      <h1>Mood Tracker Backend läuft</h1>
      <p>Die API läuft, aber der React-Build wurde nicht gefunden.</p>
      <p>Bitte im frontend-Ordner ausführen:</p>
      <pre>npm run build</pre>
      <p>API-Test: <a href="/api/health">/api/health</a></p>
    `);
  }

  // index.html darf NICHT hart gecacht werden.
  // Sonst bekommen Besucher nach einem neuen Deployment eventuell alte App-Dateien.
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(indexHtmlPath);
});

// --------------------------------------------------
// Globaler Error Handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: isProduction ? "Something went wrong" : err.message,
  });
});

// --------------------------------------------------
// Server starten
// --------------------------------------------------

server.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
  console.log(`✅ API erreichbar unter: http://localhost:${PORT}/api/health`);
  console.log(`✅ Frontend erreichbar unter: http://localhost:${PORT}`);
});