# Mood Tracker

A modern full-stack mood tracking and journaling web application built with React, Vite, Express, SQLite and Prisma.

---

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Backend-Express-000000?logo=express)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socketdotio)
![Vitest](https://img.shields.io/badge/Testing-Vitest-6E9F18?logo=vitest)
![Cypress](https://img.shields.io/badge/E2E-Cypress-17202C?logo=cypress)

---

# Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Decision](#architecture-decision)
- [Project Structure](#project-structure)
- [Resources & API Design](#resources--api-design)
- [Database Schema](#database-schema)
- [Realtime Communication](#realtime-communication)
- [Testing Strategy](#testing-strategy)
- [API Testing](#api-testing)
- [Setup Guide](#setup-guide)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Conclusion](#conclusion)

---

# Project Overview

Mood Tracker is a personal journaling and mood tracking application.

Users can:

- create journal entries
- track moods
- organize personal skills
- visualize emotional patterns
- test realtime communication concepts
- experience a modern responsive UI

The project was developed as a learning-oriented full-stack web architecture project using modern JavaScript technologies.

---

# Features

## Authentication

- Register
- Login
- JWT Authentication
- Protected Routes

## Journal System

- Create journal entries
- Edit entries
- Delete entries
- Mood selection
- Custom moods
- Expandable long entries

## Mood Tracking

- Predefined moods
- Custom mood support
- Mood visualization
- Mood-based categorization

## Skills System

- Add personal skills
- Remove skills
- Practice tracking
- Mood-based recommendations

## Calendar View

- Journal visualization by date
- Mood overview
- Daily activity indicators

## Realtime Experiments

- Server-Sent Events (SSE)
- socket.io WebSockets
- Multi-tab synchronization

---

# Tech Stack

## Frontend

- React
- Vite
- React Router
- Axios
- CSS

## Backend

- Node.js
- Express
- Prisma ORM
- SQLite
- JWT
- bcryptjs
- socket.io

## Testing

- Vitest
- Cypress

---

# Architecture Decision

## Why Vite instead of Next.js?

Our application currently does not require SSR with Next.js.

The Mood Tracker is mainly an interactive web application with:

- authentication
- dashboard
- journal system
- skills management
- calendar functionality

SEO is not important because most content is only accessible after login.

Vite is therefore the better choice because it provides:

- simpler setup
- faster development
- excellent React integration
- lightweight architecture

---

# Project Structure

```txt
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── tests/

backend/
├── prisma/
├── src/
│   ├── middleware/
│   ├── routes/
│   ├── lib/
│   ├── utils/
│   └── tests/