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
  if (
    req.originalUrl.startsWith("/api/auth/")
  ) {
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get("X-CSRF-Token");

  // ===== DEBUG =====
  console.log("========== CSRF ==========");
  console.log("URL:       ", req.originalUrl);
  console.log("Method:    ", req.method);
  console.log("Cookie:    ", cookieToken);
  console.log("Header:    ", headerToken);
  console.log("==========================");
  // ==================

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

  if (cookieToken !== headerToken) {
    return res.status(403).json({
      error: "Invalid CSRF token."
    });
  }

  next();
}