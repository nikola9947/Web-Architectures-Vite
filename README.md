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

## Deployment-Überblick

| Bestandteil | Läuft als | Hostname / Pfad | Wird ausgeliefert von |
|---|---|---|---|
| Frontend (React) | Statisches Build (`dist/`) | `https://DEINE-DOMAIN.de` | Express mit `express.static` |
| Backend (Express) | Node.js-App | `https://DEINE-DOMAIN.de/api` | konsoleH Node.js |
| Datenbank (SQL) | MySQL/MariaDB | `localhost` auf dem Server | konsoleH DB-Verwaltung |

Das Frontend wird als Production-Build erstellt und vom Express-Backend statisch ausgeliefert. API-Routen liegen weiterhin unter /api. Für clientseitige React-Routen wird ein SPA-Fallback auf index.html genutzt.

## 4a. Datenbankumstellung für Hetzner

Lokal verwendet die Anwendung aktuell SQLite:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

## 5. Backend als Node.js-App konfigurieren

Für das Deployment wird die gesamte Anwendung als eine Node.js-App betrieben. Das bedeutet: Express liefert sowohl die API unter `/api/...` als auch das gebaute React-Frontend aus `frontend/dist` aus.

### Port-Konfiguration

In einer Hosting-Umgebung wie Hetzner Webhosting L gibt die Plattform den Port vor. Deshalb darf der Server nicht fest auf `3001` oder `3000` lauschen.

Im Backend wird deshalb verwendet:

```js
const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`)
})


## 6. Hochladen, installieren und migrieren

Da die Anwendung als All-in-One Node.js-App deployed wird, liefert Express sowohl die API als auch das React-Frontend aus. Deshalb wird nur ein Verzeichnis auf dem Server betrieben: das Backend mit dem fertigen Frontend-Build im `public/`-Ordner.

### Lokale Vorbereitung

Zuerst wird das Frontend gebaut:

```bash
cd frontend
npm run build
```

Danach wird der Inhalt des `dist/`-Ordners in den `public/`-Ordner des Backends kopiert:

```bash
cp -r dist/* ../backend/public/
```

Unter Windows kann alternativ PowerShell verwendet werden:

```powershell
cd frontend
npm run build

Remove-Item -Recurse -Force ..\backend\public\*
Copy-Item -Recurse -Force .\dist\* ..\backend\public\
```

Der Express-Server liefert anschließend den Inhalt aus `backend/public/` statisch aus.

### Deployment auf dem Server

Auf dem Server wird der Backend-Code in das Arbeitsverzeichnis der Hauptdomain geladen:

```bash
cd ~/your-mood-tracker.de
git clone <repository-url> .
```

Falls `backend/public/` nicht im Git-Repository enthalten ist, wird der gebaute Frontend-Inhalt separat per SFTP oder SCP nach `backend/public/` hochgeladen.

### Produktionsabhängigkeiten installieren

Auf dem Server werden die Abhängigkeiten reproduzierbar installiert:

```bash
npm ci
```

`npm ci` verwendet exakt die Versionen aus der `package-lock.json` und ist deshalb besser für Deployments geeignet als `npm install`.

### Prisma vorbereiten

Danach wird der Prisma Client erzeugt:

```bash
npx prisma generate
```

### Migrationen auf Produktionsdatenbank ausführen

Für die Live-Datenbank wird verwendet:

```bash
npx prisma migrate deploy
```

In Produktion wird bewusst nicht `prisma migrate dev` genutzt, weil dieser Befehl für Entwicklung gedacht ist und Datenbanken zurücksetzen oder neue Migrationen erzeugen kann.

### Neustart

Nach Installation, Migration und Setzen der Umgebungsvariablen wird die Node.js-App in konsoleH neu gestartet.

### Tests nach dem Deployment

Nach dem Neustart werden folgende Punkte geprüft:

| Test                                          | Erwartung                                       |
| --------------------------------------------- | ----------------------------------------------- |
| `https://www.your-mood-tracker.de`            | React-App wird angezeigt                        |
| `https://www.your-mood-tracker.de/login`      | Direkter Aufruf funktioniert durch SPA-Fallback |
| `https://www.your-mood-tracker.de/api/health` | Backend antwortet                               |
| Login                                         | Cookie wird gesetzt                             |
| Geschützte Routen                             | Daten werden geladen                            |
| Logout                                        | Cookie wird gelöscht                            |


Der All-in-One-Build wurde lokal getestet. Das Frontend wurde mit `npm run build` gebaut und in `backend/public` kopiert. Express liefert die React-App über `http://localhost:3001` aus, während die API weiterhin unter `/api/...` erreichbar ist. Der direkte Aufruf von `/login` funktioniert durch den SPA-Fallback.

## 7. Cookies und Authentifizierung in der All-in-One-Architektur

In der All-in-One-Variante laufen Frontend und Backend über dieselbe Domain. Das React-Frontend wird von Express statisch ausgeliefert und die API liegt unter `/api`.

Beispiel:

```txt
https://www.your-mood-tracker.de
https://www.your-mood-tracker.de/api/health
```

### Warum entfällt CORS?

CORS ist nur notwendig, wenn Browser-Anfragen von einer anderen Origin kommen. In dieser Architektur kommen Frontend und API von derselben Origin.

Deshalb ist keine spezielle CORS-Konfiguration für die Kommunikation zwischen Frontend und API notwendig.

### Cookie-Konfiguration

Der Login setzt einen JWT als HttpOnly-Cookie:

```js
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
})
```

### Warum HttpOnly?

`httpOnly: true` verhindert, dass JavaScript im Browser den Token auslesen kann. Das schützt den JWT besser vor XSS-Angriffen.

### Warum secure abhängig von NODE_ENV?

In Produktion läuft die Anwendung über HTTPS. Deshalb soll der Cookie dort nur verschlüsselt übertragen werden.

Lokal wird über HTTP getestet. Deshalb wird `secure` nur in Produktion aktiviert:

```js
secure: process.env.NODE_ENV === 'production'
```

### Warum SameSite Lax?

`sameSite: 'lax'` reicht aus, weil Frontend und API auf derselben Domain laufen. Es ist kein `SameSite=None` notwendig, da keine Cross-Site-Requests verwendet werden.

`SameSite=None` wäre nur nötig, wenn Frontend und Backend auf komplett unterschiedlichen Sites liegen würden. Für diese Architektur wäre es unnötig schwächer.

### Logout

Beim Logout muss der Cookie mit denselben Attributen gelöscht werden:

```js
res.clearCookie('token', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
})
```

Wenn die Attribute nicht übereinstimmen, kann es passieren, dass der Browser den Cookie nicht richtig entfernt.

### Trust Proxy

Da die Node.js-App auf Hetzner hinter einem Apache-Reverse-Proxy läuft, wird in Express gesetzt:

```js
app.set('trust proxy', 1)
```

Dadurch kann Express korrekt erkennen, dass die ursprüngliche Anfrage über HTTPS kam.

### Frontend Requests

Bei Same-Origin-Anfragen sendet der Browser Cookies standardmäßig mit. Deshalb ist `credentials: 'include'` nicht zwingend notwendig. Da die App bereits mit Axios und `withCredentials: true` arbeitet, kann diese Einstellung aber bleiben.

### Test

Der Auth-Flow wurde lokal über die All-in-One-App getestet:

```txt
http://localhost:3001
```

Geprüft wurde:

* Registrierung funktioniert
* Login setzt einen Cookie
* geschützte API-Routen laden Daten
* Logout löscht den Cookie
* Weiterleitung zur Login-Seite funktioniert

## Studio-Session 11: Deployment – All-in-One Node.js App

Für das Deployment wird die Anwendung als eine gemeinsame Node.js-App betrieben. Express liefert dabei sowohl das fertige React-Frontend als auch die API aus.

### Deployment-Überblick

| Bestandteil       | Läuft als                  | Hostname / Pfad                        | Wird ausgeliefert von        |
| ----------------- | -------------------------- | -------------------------------------- | ---------------------------- |
| Frontend (React)  | statisches Build (`dist/`) | `https://www.your-mood-tracker.de`     | Express mit `express.static` |
| Backend (Express) | Node.js-App                | `https://www.your-mood-tracker.de/api` | konsoleH Node.js             |
| Datenbank         | MySQL/MariaDB              | `localhost` auf dem Server             | konsoleH DB-Verwaltung       |

### Begründung der All-in-One-Architektur

In dieser Variante laufen Frontend und Backend über dieselbe Domain. Die React-App wird vorher mit Vite gebaut und anschließend von Express als statisches Frontend ausgeliefert. Die API bleibt unter dem Pfad `/api` erreichbar.

Dadurch wird keine separate API-Subdomain benötigt. Außerdem entfällt CORS, weil Frontend und Backend dieselbe Origin verwenden. Auch der JWT-Cookie ist einfacher zu handhaben, weil er bei Same-Origin-Anfragen automatisch vom Browser mitgesendet wird.

Der Nachteil ist, dass der Express-Server zwei Aufgaben übernimmt: Er verarbeitet API-Anfragen und liefert gleichzeitig das Frontend aus. Deshalb ist die Reihenfolge der Middleware wichtig: API-Routen müssen vor `express.static` und dem SPA-Fallback registriert werden.


## 2. Frontend für Produktion bauen

Lokal läuft das Frontend während der Entwicklung über den Vite-Dev-Server auf Port `5173`. In Produktion wird kein Vite-Dev-Server verwendet. Stattdessen wird das Frontend einmal gebaut und anschließend von Express als statisches Build ausgeliefert.

### Build erstellen

```bash
cd frontend
npm run build
```

Dabei entsteht ein `dist/`-Ordner:

```txt
frontend/
└── dist/
    ├── index.html
    └── assets/
```

Ausgeliefert wird später nur der Inhalt dieses Builds, nicht der Quellcode aus `src/`.

### Relative API-Pfade

Da Frontend und Backend in der All-in-One-Architektur über dieselbe Domain laufen, werden API-Aufrufe relativ ausgeführt.

Statt:

```js
http://localhost:3001/api/auth/login
```

wird verwendet:

```js
/api/auth/login
```

Dadurch funktioniert derselbe Code lokal und in Produktion. Im Browser wird der relative Pfad automatisch zur aktuellen Origin aufgelöst.

### Vite Dev Proxy

Während der Entwicklung läuft das Frontend weiterhin auf `localhost:5173`, während das Backend auf `localhost:3001` läuft. Damit relative `/api`-Aufrufe trotzdem funktionieren, wird ein Dev-Proxy in `vite.config.js` eingerichtet.

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  }
})
```

### Vorteil

Dadurch wird keine `VITE_API_BASE_URL` mehr benötigt. Die Anwendung nutzt überall dieselben relativen Pfade:

```txt
/api/...
```

Im lokalen Entwicklungsmodus leitet Vite diese Anfragen an Express weiter. In Produktion beantwortet Express diese Anfragen direkt selbst.


## Session 12 – Sicherheitsscan

### Verwendetes Verfahren

Das Deployment wurde durch einen externen Sicherheitsscan überprüft.

### Ergebnisse

#### Finding 1

Noch ausstehend – wird nach Durchführung des Scans ergänzt.

#### Finding 2

Noch ausstehend – wird nach Durchführung des Scans ergänzt.

#### Finding 3

Noch ausstehend – wird nach Durchführung des Scans ergänzt.

### Zusammenfassung

Zum Zeitpunkt der Dokumentation wurden keine kritischen Sicherheitsprobleme festgestellt bzw. die identifizierten Probleme wurden behoben. Die finale Bewertung erfolgt nach dem vollständigen Sicherheitsscan.

## Security Review (Session 12)

Ein automatisierter Security Scan mit CodeSniper wurde durchgeführt.

### Wichtigste Findings

1. Fehlende Authentifizierung auf Journal-Routen
   - behoben durch authenticateToken Middleware

2. Hardcodierte Benutzer-ID in Mood-Routen
   - behoben durch Nutzung von req.user.id

3. Fehlende Content Security Policy (CSP)
   - behoben durch CSP-Meta-Tag im Frontend

### Ergebnis

Keine kritischen Authentifizierungsprobleme mehr vorhanden.
JWT-Authentifizierung erfolgt über HttpOnly Cookies.
Helmet sorgt für zusätzliche Security Header.


## Performance-Messung und Asset-Optimierung

Für die Performance-Analyse wurde ein Lighthouse-Audit in Google Chrome durchgeführt.

### Baseline-Messung

| Messwert                       | Ergebnis |
| ------------------------------ | -------- |
| Performance Score              | 81       |
| Largest Contentful Paint (LCP) | 2,5 s    |
| Cumulative Layout Shift (CLS)  | 0,065    |

### Analyse

Der Performance-Score liegt bereits im guten Bereich. Der CLS-Wert ist niedrig, wodurch kaum sichtbare Layout-Sprünge während des Ladens auftreten.

Der größte Optimierungshebel liegt beim Largest Contentful Paint (LCP), da große Bilder oder andere sichtbare Inhalte im oberen Bereich der Seite die Ladezeit beeinflussen können.

### Optimierungsmaßnahmen

* Verwendung von Vite Production Builds
* Gehashte Assets für langfristiges Browser-Caching
* Cache-Control Header für statische Assets
* SPA-Fallback über Express
* Vorbereitung für moderne Bildformate wie WebP
* Verwendung von festen Größenangaben (`width` und `height`) zur Vermeidung von Layout Shifts

### Ergebnis

Die Anwendung erreicht bereits vor weiteren Optimierungen einen Lighthouse Performance Score von 81 Punkten. Weitere Verbesserungen können durch optimierte Bilder (WebP/AVIF), Lazy Loading und kleinere JavaScript-Bundles erzielt werden.

### Analyse der JavaScript-Bundles

Nach dem Produktions-Build ergaben sich folgende Größen:

| Datei | Größe |
|---------|---------|
| CSS Bundle | 27.83 kB |
| JavaScript Bundle | 294.62 kB |
| JavaScript (gzip) | 95.41 kB |

Die erzeugten Bundles liegen bereits in einem komprimierten und optimierten Format vor. Das JavaScript-Bundle wird durch Vite automatisch minifiziert und zusätzlich durch Gzip-Kompression deutlich reduziert.

Obwohl Lighthouse weiteres Einsparpotenzial bei JavaScript meldete, zeigte die Analyse der erzeugten Produktionsdateien, dass die Anwendung bereits relativ kompakte Bundles verwendet. Für zukünftige Versionen könnten zusätzliche Optimierungen durch Code-Splitting und Lazy Loading einzelner Komponenten umgesetzt werden.

## Landing Page

Für den finalen Polish wurde eine ungeschützte Landing Page ergänzt. Sie ist vor dem Login erreichbar und erklärt zuerst den Nutzen der Anwendung statt nur einzelne Features aufzulisten.

### Above the fold

Die Landing Page beginnt mit einer klaren Nutzen-Headline, einem kurzen erklärenden Subtext und einem direkten Call-to-Action zur Registrierung.

### Nutzen statt Features

Die Seite beschreibt, wie Mood Tracker beim Reflektieren von Stimmungen, beim Schreiben von Journal-Einträgen und beim Finden passender Coping Skills unterstützt.

### Reibung minimieren

Der primäre CTA führt direkt zur Registrierung. Zusätzlich gibt es einen Login-Link für bestehende Nutzerinnen und Nutzer.

## Landing Page

A dedicated landing page was added as the public entry point of the application.

### Above the Fold
The landing page presents a clear value proposition, a short description and a primary call-to-action.

### Features & Benefits
Instead of generic stock photos, the page uses mood icons and interactive UI previews inspired by the actual application.

### Reduced Friction
Users can directly navigate to registration or login pages through clearly visible call-to-action buttons.