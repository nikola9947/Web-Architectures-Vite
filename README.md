# Mood Tracker

## Autorin

Nikola Bryks

## Projektbeschreibung

Mood Tracker ist eine Full-Stack-Webanwendung zur Erfassung von Stimmungen, Journal-Einträgen und persönlichen Coping Skills.

Die Anwendung ermöglicht Benutzerinnen und Benutzern:

- Stimmungen zu dokumentieren
- persönliche Journal-Einträge zu verfassen
- passende Coping Skills zu verwalten
- Einträge über eine Kalenderansicht abzurufen
- ihre Aktivitäten und Stimmungshistorie im Dashboard auszuwerten

Das Projekt wurde im Rahmen der Vorlesung Web Architectures entwickelt.

---

# Verwendete Technologien

## Frontend

- React
- Vite
- React Router
- Axios
- Socket.io Client

## Backend

- Node.js
- Express
- Socket.io
- JWT Authentication
- Cookie Parser
- CORS

## Datenbank

- Prisma ORM
- SQLite (Entwicklung)
- MySQL/MariaDB (Deployment)

## Testing

- Vitest
- Cypress

## Weitere Bibliotheken

- Resend
- React Email

---

# Architekturentscheidung

Für dieses Projekt wurde React mit Vite verwendet.

Die Anwendung wird hauptsächlich nach einem Login genutzt und benötigt keine Suchmaschinenoptimierung. Dadurch bringt Server Side Rendering keinen relevanten Vorteil.

Deshalb wurde eine Client-Side-Rendering Architektur mit React gewählt.

Das Frontend kommuniziert über REST-Endpunkte mit dem Express-Backend.

---

# Systemarchitektur

| Bestandteil | Technologie |
|------------|------------|
| Frontend | React + Vite |
| Backend | Express |
| Authentifizierung | JWT + HttpOnly Cookies |
| Datenbank | Prisma |
| Echtzeitkommunikation | Socket.io |

---

# Bestandsaufnahme des Backends

## src/index.js

Verantwortlich für:

- Serverstart
- Middleware
- Routing
- Socket.io Initialisierung
- CORS Konfiguration

Greift nicht direkt auf Datenbanktabellen zu.

## auth.routes.js

Verantwortlich für:

- Registrierung
- Login
- Logout

Greift auf die User-Tabelle zu.

## moods.routes.js

Verantwortlich für:

- Mood Tracking
- Mood History

Greift auf Mood-Daten zu.

## skills.routes.js

Verantwortlich für:

- Abruf aller Skills
- Verwaltung persönlicher Skills
- Skill Tracking

Greift auf Skills und User Skills zu.

## events.routes.js

Verantwortlich für:

- Kalenderdaten
- Terminverwaltung

Greift auf Event-Daten zu.

## journal.routes.js

Verantwortlich für:

- Journal Einträge
- Bearbeiten von Einträgen
- Löschen von Einträgen

Greift auf Journaldaten zu.

---

# Analyse der Architektur

Folgende Punkte wurden identifiziert:

- Geschäftslogik befand sich teilweise direkt in Route-Dateien.
- Journal-Funktionalität wurde in einen eigenen Kontext ausgelagert.
- Service-Layer wurde eingeführt.
- HTTP-Logik und Geschäftslogik wurden getrennt.

---

# Bounded Contexts

## Auth Context

Verantwortlich für:

- Registrierung
- Login
- Logout
- JWT Verwaltung

Begriffe:

- User
- Authentication
- Session

---

## Mood Context

Verantwortlich für:

- Stimmungseinträge
- Mood History

Begriffe:

- Mood
- Mood Entry
- Intensity

---

## Journal Context

Verantwortlich für:

- Journal Einträge
- Bearbeitung von Einträgen

Begriffe:

- Journal Entry
- Title
- Content

---

## Skills Context

Verantwortlich für:

- Coping Skills
- Skill Tracking

Begriffe:

- Skill
- Practice
- Recommendation

---

# Kommunikation der Kontexte

## Dashboard

Benötigt:

- Mood Daten
- Journal Daten
- Skill Daten

Dashboard kennt jedoch keine internen Implementierungsdetails der einzelnen Module.

## Skills

Benötigt Mood-Daten, um passende Coping Skills vorzuschlagen.

---

# Service Layer

Geschäftslogik wurde aus Route-Dateien ausgelagert.

Beispiel:

### Vorher

Route:

- Validierung
- Datenbankzugriff
- HTTP Antwort

alles in einer Datei.

### Nachher

Route:

- Request entgegennehmen
- Service aufrufen
- Response senden

Service:

- Validierung
- Geschäftslogik
- Datenbankzugriff

---

# Modulstruktur

```text
backend/
├── modules/
│   ├── journal/
│   │   ├── journal.routes.js
│   │   └── journal.service.js
│
├── routes/
│   ├── auth.js
│   ├── moods.js
│   ├── skills.js
│   └── events.js
│
├── middleware/
│   └── auth.js
│
├── prisma/
│   └── schema.prisma
│
└── src/index.js
```

---

# Öffentliche Modulschnittstellen

## Journal Service

Öffentlich:

- createEntry()
- getEntries()
- updateEntry()
- deleteEntry()

Intern:

- validateEntry()

---

## Auth Service

Öffentlich:

- registerUser()
- loginUser()
- logoutUser()

Intern:

- generateToken()
- hashPassword()

---

# Frontend-Struktur

```text
frontend/
├── features/
│   ├── auth/
│   ├── journal/
│   ├── moods/
│   ├── skills/
│   └── calendar/
│
├── shared/
│   ├── components/
│   └── lib/
│
└── pages/
```

---

# Echtzeitkommunikation

Socket.io wird verwendet.

Anwendungsfall:

- Neue Journal-Einträge können an andere Clients übertragen werden.
- Dashboard kann in Echtzeit aktualisiert werden.

---

# Authentifizierung

Authentifizierung erfolgt über:

- JWT
- HttpOnly Cookies

Cookie-Einstellungen:

```js
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
}
```

---

# CORS Konfiguration

Frontend:

```text
https://www.your-mood-tracker.de
```

Backend:

```text
https://api.your-mood-tracker.de
```

Konfiguration:

```js
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true
}))
```

Warum?

Der Browser erlaubt Cookies nur, wenn:

- credentials aktiviert ist
- der Origin explizit erlaubt wird

---

# Testing

## Unit Tests

Vitest wird verwendet.

Getestet werden:

- Services
- Hilfsfunktionen
- Validierungen

## End-to-End Tests

Cypress wird verwendet.

Getestet werden:

- Registrierung
- Login
- Mood Tracking
- Journal
- Skills

---

# Deployment Architektur

| Bestandteil | Läuft als | Hostname |
|------------|------------|------------|
| Frontend | Statisches Vite Build | www.your-mood-tracker.de |
| Backend | Node.js Anwendung | api.your-mood-tracker.de |
| Datenbank | MySQL/MariaDB | Serverdatenbank |

---

# Frontend Deployment

Build erstellen:

```bash
npm run build
```

Hochgeladen wird ausschließlich:

```text
dist/
```

inklusive:

```text
.htaccess
index.html
assets/
```

---

# .htaccess

Verwendet für:

- SPA Routing
- HTTPS Weiterleitung
- Cache Header

SPA Fallback:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

---

# Backend Deployment

Serverstart:

```js
const PORT = process.env.PORT || 3001
```

Node.js wird über Hetzner Webhosting gestartet.

---

# Umgebungsvariablen

## backend/.env.example

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DBNAME"

JWT_SECRET="your-secret"

NODE_ENV="production"

FRONTEND_ORIGIN="https://www.your-mood-tracker.de"

RESEND_API_KEY="re_xxxxxxxxx"

APP_URL="https://www.your-mood-tracker.de"

CLIENT_URL="https://www.your-mood-tracker.de"
```

## frontend/.env.example

```env
VITE_API_BASE_URL="https://api.your-mood-tracker.de/api"
```

---

# Erkenntnisse

Durch die Aufteilung in Bounded Contexts und die Einführung eines Service Layers wurde die Anwendung besser wartbar.

Die Trennung von Frontend, Backend und Datenbank erleichtert zukünftige Erweiterungen sowie ein Deployment in produktiven Umgebungen.

Die modulare Struktur ermöglicht außerdem eine spätere Migration einzelner Bereiche in eigenständige Services.