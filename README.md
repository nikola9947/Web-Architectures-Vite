## Architektur-Entscheidung: SSR/Next.js oder Vite?

Unsere App braucht aktuell kein SSR mit Next.js. Der Mood Tracker ist hauptsächlich eine interaktive Web-App mit Login, Dashboard, Journal, Skills und Kalender, also eher ein persönliches Tool als eine öffentlich indexierbare Website. SEO ist für uns kaum relevant, weil die wichtigsten Inhalte erst nach dem Login sichtbar sind und nicht von Suchmaschinen gefunden werden müssen. Deshalb ist Vite für unser Projekt besser geeignet: Es ist einfacher, schneller im Development und passt gut zu einer clientseitigen React-App mit vielen Nutzerinteraktionen.

## Ressourcen unseres Projekts

### Ressourcen

- users
- moods
- journal_entries
- skills
- user_skills

### Hierarchie

- Ein `journal_entry` gehört zu einem `user`.
- Ein `mood` kann mit einem `journal_entry` verknüpft sein.
- `skills` sind allgemeine Ressourcen.
- `user_skills` verbinden einen `user` mit bestimmten `skills`.


## API-Tests ohne Frontend

Wir haben unsere REST-API zusätzlich unabhängig vom Frontend getestet. Dafür wurde HoppScotch verwendet, um Requests direkt an das Express-Backend zu senden und Responses zu prüfen.

### Getestete Endpoints

| Methode | Endpoint | Zweck |
|---|---|---|
| POST | /api/auth/register | Nutzer registrieren |
| POST | /api/auth/login | Nutzer anmelden |
| GET | /api/entries | Journal-Einträge laden |
| POST | /api/entries | Journal-Eintrag erstellen |
| DELETE | /api/entries/:id | Journal-Eintrag löschen |

---

## Fehlerfälle

### 1. Login mit falschem Passwort

#### Request

```txt
POST /api/auth/login



## Datenschema unseres Projekts

```txt
users                  mood_entries              journal_entries
----------------       -----------------------   -------------------------
id                     id                        id
email                  user_id (FK → users)      user_id (FK → users)
username               mood                      title
password               intensity                 content
created_at             notes                     mood_id (FK → mood_entries)
updated_at             created_at                mood_text
                                                 created_at
                                                 updated_at


skills                 user_skills
----------------       -------------------------
id                     id
name                   user_id (FK → users)
description            skill_id (FK → skills)
category               practiced_count
for_moods              last_practiced
instructions           created_at
created_at


## Architekturentscheidung: Datenbank, Redis oder Object Store

In unserer App müssen Nutzer, Login-Daten, Mood-Einträge, Journal-Einträge, Skills und User-Skills dauerhaft in der Datenbank liegen, weil diese Daten strukturiert sind und langfristig gespeichert werden sollen. Redis wäre höchstens für kurzfristige Daten wie Sessions, Rate-Limits oder temporäre Live-Events sinnvoll, aber nicht als Hauptspeicher. Ein Cloud Object Store wie S3 wäre langfristig nur relevant, wenn Nutzer Bilder, Audio-Dateien oder Anhänge zu Journal-Einträgen hochladen könnten; aktuell reicht die normale Datenbank aus.


### API-Struktur-Entscheidung

Wir verwenden hauptsächlich ein flaches REST-Design mit einzelnen Ressourcen-Endpunkten, z. B.:

```txt
/api/entries
/api/moods
/api/skills
/api/auth
## Testing Strategy – Test-Pyramide

| Ebene | Was testen wir bei uns? | Tool |
|---|---|---|
| Unit | Reine Hilfsfunktionen, z. B. Eingabevalidierung für Login/Register oder Datum-Formatierung | Vitest |
| Integration | Backend-Routen, z. B. POST /api/auth/register erstellt User und POST /api/entries erstellt Journal-Eintrag | Vitest |
| E2E | Kompletter User-Flow: Registrieren/Login, Mood auswählen, Journal-Eintrag erstellen, Skill hinzufügen | Cypress |

### Kritische Bereiche im Projekt

| Bereich | Warum kritisch? |
|---|---|
| Login/Register/Auth | Wenn das kaputtgeht, können User sich nicht anmelden oder registrieren. |
| Mood- und Journal-Einträge speichern | Wenn das kaputtgeht, verliert die App ihren Hauptnutzen, weil keine persönlichen Daten gespeichert werden können. |

## Agent als Test-Schreiber

Für größere Testabdeckung verwenden wir den Agenten gezielt als Unterstützung beim Schreiben von Unit Tests.

### Beispiel-Prompt Frontend

```txt
Schreibe Vitest Unit Tests für validatePassword aus frontend/src/utils/validation.js.
Decke folgende Fälle ab:
- Normalfall
- leerer Input
- ungültiger Typ
- Passwort genau 6 Zeichen lang

## Echtzeit-Bedarf im Projekt

| Frage | Unsere Antwort |
|---|---|
| Gibt es Daten in unserer App, die sich ändern können, während ein anderer Nutzer die Seite offen hat? | Ja, theoretisch könnten Mood-Einträge, Journal-Einträge oder Skills von einem anderen eingeloggten Gerät erstellt oder geändert werden. In der aktuellen Nutzung ist die App aber hauptsächlich als persönliche Single-User-App gedacht. |
| Müssen Änderungen sofort sichtbar sein – oder reicht ein Reload? | Für unser Projekt reicht ein Reload oder erneutes Laden der Daten. Es ist nicht kritisch, wenn ein neuer Mood- oder Journal-Eintrag erst nach Aktualisieren der Seite sichtbar wird. |
| Ist die Kommunikation einseitig oder bidirektional? | Für unsere App wäre sie eher einseitig: Der Server könnte Clients informieren, wenn neue Einträge vorhanden sind. Der Client sendet Daten weiterhin über normale HTTP-Requests. |
| Wie viele Clients könnten gleichzeitig verbunden sein? | Realistisch wenige Clients, z. B. ein Nutzer mit Browser auf Laptop und eventuell Smartphone. Kein großes Mehrbenutzer-Szenario. |

### Technologieentscheidung

Für den produktiven Einsatz ist in unserem Mood Tracker aktuell keine echte Echtzeit-Kommunikation notwendig. Die wichtigsten Funktionen sind Login, Mood-Tracking, Journal-Einträge und Skills. Diese Daten werden bewusst durch Nutzeraktionen gespeichert und müssen nicht live auf anderen Geräten erscheinen.

Ein normaler Reload oder erneutes Laden der Daten nach dem Speichern reicht aus. Für eine Lernübung kann aber **SSE (Server-Sent Events)** eingebaut werden, weil unser Szenario eher Server-zu-Client-Updates betrifft, z. B. eine Benachrichtigung: „Neuer Journal-Eintrag gespeichert“. WebSockets wären für unser Projekt zu groß, weil wir keinen Chat, kein kollaboratives Editing und kein Multiplayer-Verhalten brauchen.

**Entscheidung:** SSE als Lernübung, aber nicht produktiv notwendig.

## SSE Lernübung

Wir haben SSE als Lernübung eingebaut, obwohl es produktiv nicht zwingend notwendig ist.

### Implementierung

- Backend: `GET /api/events`
- Frontend: `EventSource` in `JournalPage.jsx`
- Eventname: `entries-updated`
- Auslöser: Wenn ein neuer Journal-Eintrag erstellt wird
- Effekt: Offene Clients laden ihre Entry-Liste automatisch neu

### Test

Testablauf:

1. App in zwei Browser-Tabs öffnen.
2. In beiden Tabs zum Journal gehen.
3. In Tab 1 einen neuen Journal-Eintrag speichern.
4. In Tab 2 erscheint der neue Eintrag automatisch ohne Seiten-Reload.

### Prompt-Iteration 1

> Implementiere SSE für neue Einträge.

Problem: Die Beschreibung war zu allgemein. Es war nicht klar, welcher Endpoint genutzt wird, welcher Eventname gesendet wird und welche Liste aktualisiert werden soll.

### Prompt-Iteration 2

> Implementiere einen SSE-Endpoint `GET /api/events` in meinem Express-Backend. Wenn ein neuer Journal-Eintrag via `POST /api/entries` angelegt wird, soll der Server allen verbundenen Clients ein Event `entries-updated` senden. Im Frontend soll `JournalPage.jsx` mit `EventSource` auf dieses Event hören und `loadData()` ausführen.

Verbesserung: Der zweite Prompt war genauer, weil Endpoint, Ressource, Eventname und Frontend-Reaktion konkret benannt wurden.


## WebSocket Lernübung mit socket.io

Wir haben zusätzlich zu normalen HTTP-Requests eine socket.io-Verbindung eingebaut. Diese ist für unser Mood-Tracker-Projekt nicht zwingend produktiv notwendig, aber als Lernübung sinnvoll.

### Umsetzung

- Backend: socket.io läuft auf dem gleichen Server wie Express.
- Frontend: `socket.io-client` verbindet sich mit `http://localhost:3001`.
- Eventname: `journal-entry-created`
- Ablauf:
  1. Nutzer erstellt über `POST /api/entries` einen neuen Journal-Eintrag.
  2. Danach sendet das Frontend `socket.emit('journal-entry-created', data)`.
  3. Der Server empfängt das Event.
  4. Der Server leitet es mit `socket.broadcast.emit(...)` an alle anderen Clients weiter.
  5. Andere offene Tabs laden ihre Journal-Liste neu.

### Prompt-Iteration 1

> Integriere socket.io, damit neue Einträge live angezeigt werden.

Problem: Die Beschreibung war zu ungenau. Es war nicht klar, welches Event genutzt wird, welche Ressource betroffen ist und ob der ursprüngliche Sender das Event ebenfalls erhalten soll.

### Prompt-Iteration 2

> Integriere socket.io in mein Express-Backend auf Port 3001. Wenn ein Client das Event `journal-entry-created` sendet, soll der Server dieses Event mit `socket.broadcast.emit` an alle anderen verbundenen Clients weiterleiten. Im Frontend soll nach erfolgreichem `POST /api/entries` zusätzlich `socket.emit('journal-entry-created')` ausgeführt werden. Andere Tabs sollen darauf reagieren und `loadData()` ausführen.

Verbesserung: Der zweite Prompt benennt Port, Eventnamen, Ressource, Broadcast-Verhalten und Frontend-Reaktion konkret.

## SSE vs. WebSockets – Direktvergleich

| Kriterium | SSE | WebSockets |
|---|---|---|
| Richtung | Server → Client | Bidirektional |
| Komplexität im Code | Gering | Mittel |
| Reconnect bei Verbindungsabbruch | Automatisch durch den Browser | socket.io übernimmt Reconnect automatisch |
| Geeignet für unser Projekt | ✅ Ja | ⚠️ Als Lernübung ja, produktiv eher nicht nötig |
| Warum? | Unser Mood Tracker braucht hauptsächlich Benachrichtigungen vom Server an offene Clients, z. B. wenn ein neuer Journal-Eintrag erstellt wurde. Dafür reicht SSE aus. | WebSockets sind stärker, wenn beide Seiten dauerhaft aktiv Events senden müssen, z. B. Chat, Multiplayer oder kollaboratives Bearbeiten. Unser Projekt braucht das nicht zwingend. |

### Verhalten bei Server-Neustart

Wenn der Server neu startet, verlieren aktuell alle verbundenen Clients kurzzeitig ihre Verbindung.

Bei **SSE** schließt der offene Event-Stream. Der Browser versucht automatisch, die Verbindung wieder aufzubauen. Sobald der Server wieder läuft, verbindet sich der Client erneut mit `GET /api/events`.

Bei **socket.io** wird die WebSocket-Verbindung ebenfalls getrennt. `socket.io-client` versucht automatisch, sich neu zu verbinden. Nach erfolgreichem Reconnect kann der Client wieder Events empfangen.

Wichtig: Events, die während des Server-Neustarts passieren, werden in unserer aktuellen Implementierung nicht zwischengespeichert. Wenn in dieser Zeit ein Update passiert, kann der Client es verpassen. Da unsere App die Daten aber beim Laden der Seite und nach eigenen Aktionen erneut über HTTP lädt, ist das für unser Projekt nicht kritisch.

## Architektur-Einschätzung: Echtzeit-Kommunikation

Langfristig würden bei unserem Mood Tracker vor allem Journal- und Mood-Listen von einfacher Echtzeit-Kommunikation profitieren, weil Einträge theoretisch in mehreren offenen Tabs oder auf mehreren Geräten entstehen können. Für Login, Registrierung, Skills und statische Skill-Empfehlungen ist Echtzeit-Kommunikation dagegen nicht sinnvoll, da diese Funktionen nur auf direkte Nutzeraktionen reagieren. Polling alle 5 Sekunden wäre für Kalender, Dashboard-Zusammenfassungen oder Journal-Listen die ehrlichere Lösung, wenn wir nur gelegentlich prüfen wollen, ob neue Daten existieren, ohne eine dauerhafte Verbindung zu halten. Wir stimmen dieser Einschätzung zu, weil unser Projekt keine echte bidirektionale Kommunikation wie Chat oder kollaboratives Schreiben benötigt; SSE oder sogar Polling reicht für unseren Anwendungsfall aus.