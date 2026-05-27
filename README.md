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