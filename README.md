# Mood Tracker

## Projektbeschreibung

Mood Tracker ist eine Full-Stack-Web-App zum Erfassen von Stimmungen,
Journal-Einträgen und Skills.

Tech Stack:
- React + Vite
- Express
- Prisma + SQLite
- JWT Auth
- Vitest
- Cypress

## Architekturentscheidung

Meine App braucht kein SSR mit Next.js, weil SEO kaum relevant ist.
Die App ist hauptsächlich eine interaktive Nutzeranwendung mit Login.
Deshalb ist Vite besser geeignet.

## Ressourcen

- users
- mood_entries
- journal_entries
- skills
- user_skills

## Testing Strategy

| Ebene | Tool |
|---|---|
| Unit | Vitest |
| Integration | Vitest |
| E2E | Cypress |

## Echtzeit-Kommunikation

SSE und WebSockets wurden als Lernübung eingebaut.
Produktiv wäre Echtzeit für unser Projekt nicht zwingend notwendig.

# Async Messaging – Notifications

## Notification-Bedarf im Projekt

| Event in unserer App | Notification sinnvoll? | Typ | Kanal | Begründung |
|---|---|---|---|---|
| Neuer Journal-Eintrag gespeichert | Nein | – | – | Persönliche Aktion des Nutzers, keine andere Person betroffen |
| Mood-Eintrag erstellt | Nein | – | – | Nur lokale persönliche Information |
| Passwort geändert | Ja | Transactional | E-Mail | Sicherheitsrelevant, Nutzer sollte informiert werden |
| Registrierung erfolgreich | Ja | Transactional | E-Mail | Bestätigung für den Nutzer |
| Login von neuem Gerät (zukünftig möglich) | Ja | Transactional | E-Mail | Sicherheitsrelevant |
| Wöchentliche Mood-Zusammenfassung (zukünftig möglich) | Optional | Product | E-Mail | Kein Zeitdruck, eher Reflexion und Statistik |
| Daily Reminder zum Journaling (zukünftig möglich) | Optional | Product | Push | Nutzer soll an regelmäßige Nutzung erinnert werden |

---

## Analyse des Notification-Bedarfs

### Muss der Nutzer sofort reagieren?

In unserem aktuellen Projekt gibt es kaum Events, die eine sofortige Reaktion benötigen. Die meisten Funktionen sind persönliche Aktionen wie Mood-Tracking oder Journal-Schreiben. Deshalb reicht für sicherheitsrelevante Ereignisse eine E-Mail aus.

### Gibt es Marketing-Content?

Aktuell nein. Unsere App enthält keine Werbung, Newsletter oder Marketing-Kampagnen. Falls später Reminder oder Zusammenfassungen eingebaut werden, müssten Nutzer dafür explizit zustimmen (Opt-in).

### Wie viele Notifications pro Stunde wären realistisch?

Sehr wenige. Da die App hauptsächlich als persönlicher Mood Tracker genutzt wird, würden wahrscheinlich nur einzelne Sicherheits- oder Reminder-Events pro Stunde auftreten.

---

## Kanalentscheidung

### Passwortänderung → E-Mail

Wenn ein Passwort geändert wird, soll der Nutzer eine E-Mail erhalten. Dieses Event ist sicherheitsrelevant und sollte dauerhaft nachvollziehbar sein. Eine E-Mail eignet sich besser als Push, weil sie persistent bleibt und später noch gelesen werden kann.

### Daily Reminder → Push Notification

Ein zukünftiger täglicher Reminder wäre besser als Push Notification geeignet. Der Nutzer soll kurzfristig daran erinnert werden, einen neuen Journal- oder Mood-Eintrag zu erstellen. Dafür sind Push Notifications schneller und direkter als E-Mails.

---

## Architekturentscheidung

Für unseren aktuellen Mood Tracker sind Notifications nur begrenzt notwendig. Die App ist hauptsächlich als persönliche Single-User-Anwendung gedacht und enthält keine zeitkritischen Multiuser-Workflows wie Chats oder Task-Zuweisungen.

Deshalb würden wir aktuell hauptsächlich auf einfache Transactional E-Mails setzen. Push Notifications wären nur für optionale Reminder oder zukünftige Mobile-Features sinnvoll.

## Transactional E-Mail mit Resend

Für unser Projekt wurde als konkretes Event die erfolgreiche Registrierung ausgewählt. Nach dem Erstellen eines Accounts erhält der Nutzer eine Transactional E-Mail als Bestätigung.

Der Versand erfolgt über Resend. Das Template wird mit React Email erstellt. Der Mailversand blockiert den HTTP-Request nicht, weil die Funktion nach dem erfolgreichen Erstellen des Users gestartet wird, ohne dass die Registrierung auf den Mailversand warten muss.

### Prompt-Iteration 1

> Implementiere E-Mail-Benachrichtigungen für Registrierung.

Problem: Zu allgemein, Template-Inhalt und technischer Ablauf waren nicht genau genug.

### Prompt-Iteration 2

> Implementiere eine Transactional E-Mail für erfolgreiche Registrierung. Stack: Express, Resend, React Email. Das Template soll den Nutzernamen enthalten und einen Link zur App anzeigen. Der API-Key kommt aus der .env-Datei. Der Mailversand darf den Register-Request nicht blockieren und Fehler sollen per try/catch geloggt werden.

Verbesserung: Event, Template-Inhalt, .env-Nutzung, Fehlerbehandlung und nicht-blockierender Versand wurden konkretisiert.

## Web Push Entscheidung

Web Push ist für unseren aktuellen Mood Tracker nicht zwingend notwendig. Die App ist hauptsächlich persönlich und enthält keine Events, bei denen sofort reagiert werden muss.

Sinnvoll wäre Web Push langfristig für optionale Reminder, z. B. „Heute noch keinen Mood eingetragen“ oder „Zeit für deinen Journal-Eintrag“. Dafür wäre ein explizites Opt-in nötig.

Für sicherheitsrelevante Events wie Registrierung oder Passwortänderung ist E-Mail besser geeignet, weil sie dauerhaft nachvollziehbar ist.


## Template- und Notification-Prüfung

### Geprüftes Event

Transactional E-Mail bei erfolgreicher Registrierung.

| Check | Ergebnis | Begründung |
|---|---|---|
| Enthält das Template alle Infos, die der Nutzer braucht? | Ja | Die Mail nennt den Account-Erfolg und erklärt kurz, dass der Nutzer Mood Tracker jetzt verwenden kann. |
| Gibt es einen direkten Deep Link? | Teilweise | Aktuell führt der Button zur App-Startseite. Besser wäre ein direkter Link zum Dashboard: `/dashboard`. |
| Ist der Betreff klar und unter 50 Zeichen? | Ja | „Willkommen beim Mood Tracker“ ist kurz und eindeutig. |
| Ist der Body unter 120 Zeichen? | Teilweise | Für E-Mail ist der Body länger akzeptabel. Für Push Notifications wäre er zu lang. |

### Verbesserung nach Prüfung

Nach der ersten Version wurde klar, dass der Link zu allgemein war. Statt nur auf die Startseite zu verlinken, sollte die Mail direkt zum Dashboard führen.

### Prompt-Iteration 1

```txt
Erstelle eine Registrierungs-E-Mail für Mood Tracker.

## Bestandsaufnahme des Backends

| Datei                | Verantwortung                                          | Greift auf andere Bereiche zu?                    |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| server.js / index.js | Startet Express, Middleware, Routen, SSE und Socket.io | Ja, bindet alle Module zusammen                   |
| routes/auth.js       | Registrierung, Login, Logout, JWT-Erstellung           | Greift auf User-Daten zu                          |
| routes/users.js      | Aktuellen Benutzer laden                               | Nutzt User-Daten                                  |
| routes/moods.js      | Mood-Einträge erstellen und abrufen                    | Teilweise Verbindung zu Skills-Empfehlungen       |
| routes/entries.js    | Journal-Einträge erstellen, lesen und löschen          | Nutzt User- und Mood-Daten                        |
| routes/skills.js     | Skills verwalten und Empfehlungen liefern              | Greift auf User-Skills und Mood-bezogene Daten zu |
| middleware/auth.js   | JWT prüfen und Benutzer authentifizieren               | Wird von mehreren Modulen verwendet               |
| utils/database.js    | Datenbankzugriffe kapseln                              | Wird von allen Datenmodulen verwendet             |

## Analyse möglicher Verbesserungen

Folgende Bereiche enthalten aktuell Geschäftslogik direkt in den Route-Dateien:

* routes/skills.js enthält Empfehlungslogik für Skills basierend auf Stimmungen.
* routes/moods.js enthält Logik zum Speichern und Verarbeiten von Mood-Daten.
* routes/entries.js enthält Logik zum Erstellen und Verwalten von Journal-Einträgen.
* routes/auth.js enthält Login-, Passwort- und Token-Logik.

Langfristig wäre es sinnvoll, diese Logik in eigene Service-Klassen oder Service-Dateien auszulagern.

### Mögliche Modulgrenzen

#### Auth Modul

Verantwortlich für:

* Registrierung
* Login
* Logout
* JWT-Verwaltung

#### Mood Modul

Verantwortlich für:

* Mood-Einträge
* Mood-Auswertungen
* Dashboard-Daten

#### Journal Modul

Verantwortlich für:

* Journal-Einträge
* Historie
* Kalenderansicht

#### Skills Modul

Verantwortlich für:

* Skills
* Skill-Empfehlungen
* User-Skills

#### User Modul

Verantwortlich für:

* Benutzerprofil
* Einstellungen
* Benutzerinformationen

## Fazit

Die aktuelle Struktur funktioniert für ein kleines Projekt gut. Mit zunehmender Größe würde jedoch immer mehr Geschäftslogik direkt in den Route-Dateien landen. Deshalb wäre eine Aufteilung in Auth-, Mood-, Journal-, Skills- und User-Module sinnvoll, damit Verantwortlichkeiten klar getrennt bleiben und Änderungen leichter umgesetzt werden können.

## Bounded Contexts unseres Projekts

Für unseren Mood Tracker ergeben sich vier sinnvolle Bounded Contexts:

```txt
Auth & Users Context        Mood Tracking Context       Journal Context          Skills Context
────────────────────        ─────────────────────       ───────────────          ──────────────
User                        MoodEntry                   JournalEntry             Skill
Session / JWT               Mood                        EntryContent             UserSkill
Password Hash               Intensity                   MoodText                 SkillRecommendation
Login / Register            Notes                       CreatedAt                PracticeCount
```

### Auth & Users Context

Dieser Kontext ist verantwortlich für Registrierung, Login, Logout und die Benutzeridentität.
Der Begriff `User` bedeutet hier vor allem: eine Person mit E-Mail, Passwort-Hash und Authentifizierungsstatus.

### Mood Tracking Context

Dieser Kontext ist verantwortlich für das Erfassen von Stimmungen.
Ein `MoodEntry` besteht aus Mood, Intensität, optionalen Notizen und einem Zeitpunkt.

### Journal Context

Dieser Kontext ist verantwortlich für persönliche Journal-Einträge.
Ein `JournalEntry` enthält Titel, Textinhalt, optional eine Stimmung und Erstellungs- bzw. Änderungszeitpunkte.

### Skills Context

Dieser Kontext ist verantwortlich für Coping Skills und Empfehlungen.
Ein `Skill` ist hier eine Strategie oder Übung, die zu bestimmten Stimmungen passen kann. `UserSkill` beschreibt, welche Skills ein Nutzer gespeichert oder geübt hat.

## Kommunikation zwischen den Kontexten

Der Mood Tracking Context übergibt dem Skills Context die aktuelle Stimmung, damit passende Coping Skills empfohlen werden können. Der Skills Context braucht dafür nur den Mood-Namen, aber keine internen Details wie Notizen oder Intensität.

Der Journal Context nutzt die Benutzeridentität aus dem Auth & Users Context, damit Einträge dem richtigen Nutzer zugeordnet werden. Er braucht dafür nur die `userId`, aber keine Passwort- oder Login-Details.

## Service Layer im Journal Context

Für den Modularen Monolithen wurde der Journal Context exemplarisch refactored. Die HTTP-Logik liegt nun in `journal.routes.js`, während Validierung, Datenbankzugriffe und Geschäftslogik in `journal.service.js` ausgelagert wurden.

Refactored wurden mindestens zwei Handler:

* `GET /api/entries`
* `POST /api/entries`

Zusätzlich wurden auch `GET /api/entries/:id`, `PUT /api/entries/:id` und `DELETE /api/entries/:id` in dieselbe Struktur übertragen.

### Neue Struktur

```txt
backend/src/modules/journal/
├── journal.routes.js
└── journal.service.js
```

### Verantwortlichkeiten

| Datei              | Verantwortung                                            |
| ------------------ | -------------------------------------------------------- |
| journal.routes.js  | HTTP-Input lesen, Service aufrufen, HTTP-Response senden |
| journal.service.js | Validierung, Datenbankzugriffe, Journal-Geschäftslogik   |

### Prompt-Iteration 1

```txt
Refactore meine Journal-Routen in einen Service Layer.
```

Problem: Die Beschreibung war zu allgemein. Es war nicht klar, welche Handler zuerst refactored werden sollen und wie Fehler behandelt werden.

### Prompt-Iteration 2

```txt
Refactore GET /api/entries und POST /api/entries.
Die Routen sollen nur HTTP-Logik enthalten.
Validierung, Mood-Auflösung und Datenbankzugriffe sollen in journal.service.js ausgelagert werden.
Nutze ValidationError für fehlende Pflichtfelder und NotFoundError für nicht gefundene Einträge.
```

Verbesserung: Der zweite Prompt benennt konkrete Handler, Datei-Struktur, Fehlerarten und Verantwortlichkeiten.


## Modulare Ordnerstruktur

Für den Modularen Monolithen wurden die Bounded Contexts aus der Analyse in eine neue Ordnerstruktur übertragen. Jeder fachliche Bereich bekommt langfristig einen eigenen Ordner unter `modules/`.

```txt
backend/src/
├── modules/
│   ├── auth/
│   │   ├── auth.routes.js
│   │   └── auth.service.js
│   ├── journal/
│   │   ├── journal.routes.js
│   │   └── journal.service.js
│   ├── moods/
│   │   ├── moods.routes.js
│   │   └── moods.service.js
│   └── skills/
│       ├── skills.routes.js
│       └── skills.service.js
├── middleware/
├── utils/
└── index.js


## Modulschnittstellen und Zugriffsschutz

Im Modularen Monolithen sollen Module nicht direkt auf interne Daten anderer Module zugreifen. Wenn ein Modul Daten aus einem anderen Bereich benötigt, soll es eine öffentliche Service-Funktion dieses Moduls verwenden.

### Prüfung unseres Codes

Aktuell ist der `Journal Context` bereits als eigenes Modul umgesetzt:

```txt
backend/src/modules/journal/
├── journal.routes.js
└── journal.service.js
```

Die anderen Bereiche wie Auth, Moods und Skills existieren teilweise noch als klassische Route-Dateien unter `routes/`. Deshalb gibt es aktuell noch keine vollständige Trennung aller Module. Der wichtigste erkennbare Verstoß ist, dass mehrere alte Route-Dateien direkt auf Datenbanktabellen zugreifen, anstatt öffentliche Service-Funktionen eines Moduls zu verwenden.

### Bewertung

| Bereich | Aktueller Zustand                                                | Bewertung                                               |
| ------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Journal | Eigener Service Layer vorhanden                                  | Gut getrennt                                            |
| Auth    | Logik noch direkt in Route-Datei                                 | Sollte später in `auth.service.js` ausgelagert werden   |
| Moods   | Datenbankzugriff noch direkt in Route-Datei                      | Sollte später in `moods.service.js` ausgelagert werden  |
| Skills  | Datenbankzugriff und Empfehlungslogik noch direkt in Route-Datei | Sollte später in `skills.service.js` ausgelagert werden |

## Definierte Modulschnittstellen

### journal.service.js

Öffentliche Funktionen:

```txt
getEntries(userId)
getEntryById(entryId, userId)
createEntry(body, userId)
updateEntry(entryId, body, userId)
deleteEntry(entryId, userId)
```

Interne Funktionen:

```txt
createValidationError(message)
resolveMoodValue(body)
```

Das Journal-Modul bietet also nur Funktionen an, die Journal-Einträge lesen, erstellen, ändern oder löschen. Die Route-Datei ruft diese Funktionen auf und enthält selbst nur HTTP-Logik.

### Geplante Schnittstellen für weitere Module

#### auth.service.js

Öffentlich:

```txt
registerUser(data)
loginUser(email, password)
getCurrentUserFromToken(token)
logoutUser()
```

Intern:

```txt
hashPassword(password)
comparePassword(password, hash)
createToken(user)
validateRegisterData(data)
```

#### moods.service.js

Öffentlich:

```txt
getMoodsForUser(userId)
createMood(data, userId)
getLatestMoodForUser(userId)
```

Intern:

```txt
validateMoodData(data)
normalizeMoodName(mood)
```

#### skills.service.js

Öffentlich:

```txt
getAllSkills()
getSkillsForMood(mood)
getUserSkills(userId)
addSkillToUser(userId, skillId)
removeSkillFromUser(userId, skillId)
markSkillAsPracticed(userId, skillId)
```

Intern:

```txt
validateSkillExists(skillId)
normalizeMoodFilter(mood)
```

## Fazit

Der aktuelle Stand erfüllt den ersten Schritt in Richtung Modularer Monolith, weil der Journal Context bereits von den klassischen Route-Dateien getrennt wurde. Langfristig sollten Auth, Moods und Skills ebenfalls in eigene Module mit Service Layer überführt werden, damit keine Route-Datei direkt Logik oder Datenbankzugriffe anderer Kontexte enthält.


## Architektur-Review der modularen Monolith-Struktur

Nach dem ersten Umbau wurde die modulare Struktur des Backends überprüft.

| Prüffrage                                                                  | Einschätzung                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gibt es noch Route-Handler mit Geschäftslogik?                             | Ja. Der `Journal Context` wurde bereits in Routes und Service getrennt. In den alten Dateien unter `routes/`, z. B. `moods.js`, `skills.js` und `auth.js`, liegt aber noch Geschäftslogik direkt in den Route-Handlern.                                               |
| Gibt es Service-Dateien, die direkt auf Daten anderer Module zugreifen?    | Im aktuell umgesetzten `journal.service.js` wird nur auf Journal-Daten zugegriffen. Da die anderen Module noch nicht vollständig als Services umgesetzt sind, ist die Trennung dort noch nicht vollständig prüfbar.                                                   |
| Welches Modul hat die meisten eingehenden Abhängigkeiten?                  | Der Auth/User-Bereich ist zentral, weil fast alle geschützten Funktionen eine Benutzeridentität benötigen. Das ist grundsätzlich normal, kann aber ein Warnsignal sein, wenn zu viel fachliche Logik direkt vom Auth-Modul abhängt.                                   |
| Welches Modul wäre am einfachsten später als eigener Service extrahierbar? | Das Skills-Modul wäre am einfachsten extrahierbar, weil Skills und Skill-Empfehlungen fachlich relativ eigenständig sind. Es benötigt hauptsächlich die `userId` und optional einen Mood-Namen, muss aber nicht tief in Auth-, Journal- oder Mood-Details eingreifen. |

### Microservices-Vorbereitung

Am einfachsten wäre langfristig das `Skills`-Modul als eigener Service auszulagern. Es hat klare fachliche Aufgaben wie Skill-Liste, Empfehlungen und User-Skills und benötigt von anderen Modulen hauptsächlich einfache Eingaben wie `userId` oder `mood`. Auth wäre dagegen schwerer zu extrahieren, weil fast alle anderen Bereiche von der Benutzeridentität abhängen.


## Bonus: Frontend modularisieren

Langfristig kann auch das Frontend nach Features statt nach Dateitypen strukturiert werden. Aktuell liegen Seiten und Komponenten noch klassisch in `pages/` und `components/`. Für größere Projekte wäre eine Feature-Struktur übersichtlicher.

### Geplante Struktur

```txt
frontend/src/
├── features/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── auth.api.js
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   └── MoodTracker.jsx
│   ├── journal/
│   │   ├── JournalPage.jsx
│   │   ├── useJournal.js
│   │   └── journal.api.js
│   ├── skills/
│   │   ├── SkillsPage.jsx
│   │   └── skills.api.js
│   └── calendar/
│       └── CalendarPage.jsx
├── shared/
│   ├── components/
│   │   └── Header.jsx
│   └── lib/
│       └── api.js
└── App.jsx