export default function RegisterSuccessEmail(username) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f8f8f6;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:18px;padding:32px;color:#163352;">
          <h1 style="margin-top:0;color:#163352;">
            Willkommen beim Mood Tracker, ${username}!
          </h1>

          <p>
            Dein Account wurde erfolgreich erstellt.
          </p>

          <p>
            Du kannst jetzt deine Stimmung, Journal-Einträge und Skills verwalten.
          </p>

          <a
            href="http://localhost:5173"
            style="display:inline-block;margin-top:16px;background:#163352;color:#f8f8f6;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold;"
          >
            Mood Tracker öffnen
          </a>
        </div>
      </body>
    </html>
  `
}