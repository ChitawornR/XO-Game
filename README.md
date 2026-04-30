<h1 align="center">
  <br>
  XO-GAME
  <br>
</h1>

<h4 align="center">Tic-Tac-Toe with Single/Multiplayer, Smart Bot, JWT Auth, Real-time Online Multiplayer & Replay.</h4>

<p align="center">
  <a href="https://xo-game-pink-nine.vercel.app/"><strong>🎮 Play Live Demo →</strong></a>
</p>

> **Live demo:** https://xo-game-pink-nine.vercel.app/
> Frontend on Vercel · Backend on Render · MongoDB Atlas.
> Note: the backend runs on Render's free tier, so the first request after a long idle may take ~30 seconds (cold start).

## Features

- **Selectable board size** — 3×3, 4×4, 5×5, … (streak: 3 in a row for 3×3, otherwise 4)
- **Three play modes** — Single-player vs bot · Local multiplayer · Real-time online multiplayer
- **Smart bot** — checks for an immediate win, then blocks the player's win, then falls back to random
- **JWT authentication** — register/login, password hashed with bcrypt; replays scoped per user
- **Online multiplayer** — socket.io rooms, create/join by room code, server-authoritative game state
- **Replay** — every finished match (offline or online) is saved; step through moves on `/replay`
- **Mobile-responsive** — works from phones to desktop
- **Clean Architecture** — domain / application / infrastructure / presentation, fully typed (TypeScript)

## Tech Stack

- **Frontend:** React 19 · Vite · TypeScript · React Router · socket.io-client
- **Backend:** Node.js · Express · TypeScript · socket.io · Mongoose · zod · bcrypt · JWT · express-rate-limit
- **Database:** MongoDB (local or Atlas)
- **CI/CD:** GitHub Actions · Vercel (frontend) · Render (backend)

## Requirements

- **Node.js ≥ 18 (LTS)** — check with `node -v`
- **npm ≥ 10** — check with `npm -v`
- **MongoDB** running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string
  - Local default: `mongodb://localhost:27017/XOGame`
  - GUI (optional): [MongoDB Compass](https://www.mongodb.com/try/download/compass)
- **Git**

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ChitawornR/XO-Game.git
cd XO-Game
```

### 2. Set up environment variables

**Backend** — copy the example file and fill in the values:

```bash
cp backend/.env.example backend/.env
```

`backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/XOGame
PORT=8081
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=replace_with_a_random_32char_secret
```

> `JWT_SECRET` must be at least 16 characters. Generate one with:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Frontend** — copy the example file (default value works for local dev):

```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:8081
```

### 3. Install dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

## Run

Open **two terminals** — one for each app.

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:8081`

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

App opens at `http://localhost:5173`

## Other scripts

| Directory | Command | Description |
|---|---|---|
| `backend` | `npm test` | Run backend unit tests (Vitest) |
| `backend` | `npm run typecheck` | TypeScript type-check without emitting |
| `backend` | `npm run build` | Compile to `dist/` |
| `backend` | `npm start` | Run compiled build (`dist/main.js`) |
| `frontend` | `npm test` | Run frontend unit tests (Vitest) |
| `frontend` | `npm run typecheck` | TypeScript type-check without emitting |
| `frontend` | `npm run build` | Production build to `dist/` |
| `frontend` | `npm run lint` | ESLint check |

## Architecture (Clean Architecture)

Both apps follow the same dependency rule — outer layers depend on inner layers, never the other way around.

```
domain          → entities, pure game rules (Board, WinnerChecker, BotStrategy)
application     → use cases / hooks / ports (interfaces)
infrastructure  → Express, Mongoose, socket.io, fetch, env
presentation    → React pages & components (frontend only)
```

**Why it matters:** the game logic (`findWinner`, `BotStrategy`, `Board`) is pure TypeScript with no React or DB dependency, so it's unit-tested in isolation and can be reused on the server (the online room runs the same `WinnerChecker` server-side).

## Design Notes & Algorithm

### Objective
- A flexible XO game with selectable board size and three play modes.
- Persist game history (winner, board size, moves, mode) to MongoDB for replay.
- Clean separation of concerns between frontend (React + Vite) and backend (Node.js + Express).

### Scope
- **Modes:** Single-player (vs bot), Local multiplayer (alternate turns), Online multiplayer (real-time via socket.io).
- **Board size:** any `size ≥ 3` (3×3, 4×4, 5×5, …).
- **Win condition:** `streak = size === 3 ? 3 : 4` — match in any row, column, or diagonal.
- **Persisted shape:** `{ winner, size, moves, isSinglePlayer, userId? }`.
- **Replay page:** list, step through moves, delete (owner-scoped).
- **Auth:** register / login with email + password; replays are tied to the logged-in user.

### Actors
- **Player:** picks mode/size, plays, views replays, deletes their own replays.
- **Bot:** picks the next move in single-player.
- **Server:** validates online moves, checks the winner authoritatively, and broadcasts `game-updated` to both clients.

### Main User Flow
1. **Home:** pick mode (Single / Local / Online) and board size ≥ 3.
2. **Game:**
   - Render the N×N board.
   - X starts; players alternate turns.
   - After each move, check Win / Draw.
   - On game end, build the payload and POST it to `/replay` (or save server-side for online matches).
3. **Replay:** list games (newest first), open one to step through moves, delete unwanted entries.

### Win-rule Detection
- `findWinner(board, streak)` is a pure function that scans every row, column, and both diagonals for `streak` cells in a row of the same player. Returns `'X' | 'O' | null`.
- Triggered by a `useEffect` after each board update on the client; the server runs the **same** function for online matches so the result is authoritative.

### Bot Strategy (Single-player)
The bot picks a move using a 3-tier rule, in order:
1. **Win if possible** — for every empty cell, simulate placing the bot's mark; if `findWinner` returns the bot, take that cell.
2. **Block opponent** — for every empty cell, simulate the player's mark; if it would win, take that cell to block.
3. **Random** — pick any empty cell uniformly at random.

(The plan is to swap this Greedy strategy for a Minimax + alpha-beta bot via the `BotStrategy` interface — the rest of the game doesn't need to change.)

### Online Multiplayer Flow
1. Player A creates a room → server generates a room code, picks `size`, returns the code.
2. Player B joins by code → server marks the room `playing` and emits an initial `game-updated` to both clients.
3. On each `place-move`, the server validates the move (right turn, empty cell, in bounds), updates the board, runs `findWinner`, and emits the new state.
4. On game end, the server saves a replay for **both** users so each side can review it from `/replay`.

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — generous free tier, auto-detects Vite, deploys on every push, preview URL per PR, global CDN.
- **Backend** → [Render](https://render.com) (free plan) — supports long-lived Node + WebSocket connections (unlike serverless), env vars via dashboard.
- **Database** → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free **M0** cluster.
- **Trade-off:** Render free dynos cold-start (~30s) after idling; acceptable for a demo.

## Development Docs

- [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) — roadmap, architecture decisions, AI workflow, Gitflow
- [`CHECKLIST.md`](./CHECKLIST.md) — phase-by-phase progress
- [`CHANGELOG.md`](./CHANGELOG.md) — release notes (Keep a Changelog · SemVer)
