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

