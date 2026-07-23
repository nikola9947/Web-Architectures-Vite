import crypto from "crypto";

/**
 * Erzeugt einen zufälligen CSRF-Token.
 */
export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Überprüft den CSRF-Token.
 *
 * Voraussetzungen:
 * - Cookie: csrfToken
 * - Header: X-CSRF-Token
 *
 * Login, Register und Logout werden nicht geprüft.
 */
export function verifyCsrf(req, res, next) {
  // Sichere HTTP-Methoden benötigen keinen CSRF-Schutz
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Auth-Routen überspringen
  if (req.path.startsWith("/api/auth/")) {
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get("X-CSRF-Token");

  if (!cookieToken) {
    return res.status(403).json({
      error: "CSRF cookie missing."
    });
  }

  if (!headerToken) {
    return res.status(403).json({
      error: "CSRF header missing."
    });
  }

  try {
    const cookieHash = crypto
      .createHash("sha256")
      .update(cookieToken)
      .digest();

    const headerHash = crypto
      .createHash("sha256")
      .update(headerToken)
      .digest();

    if (!crypto.timingSafeEqual(cookieHash, headerHash)) {
      return res.status(403).json({
        error: "Invalid CSRF token."
      });
    }
  } catch (err) {
    console.error("CSRF verification failed:", err);

    return res.status(403).json({
      error: "Invalid CSRF token."
    });
  }

  next();
}