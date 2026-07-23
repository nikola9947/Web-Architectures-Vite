import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable must be set and contain at least 32 characters."
  );
}

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
      error: "Authentication token fehlt."
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
    console.error("JWT verification failed:", err);

    return res.status(401).json({
      error: "Ungültiges Authentifizierungs-Token."
    });
  }
};