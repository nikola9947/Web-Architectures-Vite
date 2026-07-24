import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { generateCsrfToken } from "../middleware/csrf.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable must be set and contain at least 32 characters."
  );
}

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "24h"
    }
  );
};

export const authenticateToken = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: "Nicht eingeloggt."
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: payload.userId,
      email: payload.email
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Ungültiges Token."
    });
  }
};

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/"
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/"
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Zu viele Anmeldeversuche. Bitte versuche es in 15 Minuten erneut."
  }
});

router.post("/register", authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Alle Felder sind erforderlich."
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: "E-Mail bereits vergeben."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    const token = createToken(user);
    const csrfToken = generateCsrfToken();

    res.cookie("token", token, authCookieOptions);
    res.cookie("csrfToken", csrfToken, csrfCookieOptions);

    return res.status(201).json({
      user
    });

  } catch (err) {
    console.error("Register failed:", err);

    return res.status(500).json({
      error: "Registrierung fehlgeschlagen."
    });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "E-Mail und Passwort sind erforderlich."
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: "E-Mail oder Passwort ungültig."
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({
        error: "E-Mail oder Passwort ungültig."
      });
    }

    const token = createToken(user);
    const csrfToken = generateCsrfToken();

    res.cookie("token", token, authCookieOptions);
    res.cookie("csrfToken", csrfToken, csrfCookieOptions);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Login failed:", err);

    return res.status(500).json({
      error: "Login fehlgeschlagen."
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", authCookieOptions);

  res.clearCookie("csrfToken", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  return res.json({
    message: "Logout erfolgreich."
  });
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: "Nicht eingeloggt."
      });
    }

    return res.json({
      user
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Benutzer konnte nicht geladen werden."
    });
  }
});

console.log("Registered auth routes:");
console.log(router.stack.map((r) => r.route?.path));

export default router;