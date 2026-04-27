# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased] — v2.0.0 Online Multiplayer

### Added — Backend
- `Room` domain entity (code, size, streak, players, board, status, winner)
- `Board` entity + `WinnerChecker`, `BoardOps`, `streakFor` domain services (server-side game logic)
- `RoomManager` — in-memory room store (create, join, lookup by socket, auto-remove on end)
- `socketHandler` — socket.io events: `create-room`, `join-room`, `place-move`, `disconnect`
- JWT auth on socket handshake — unauthenticated connections are rejected
- `main.ts` migrated to `http.createServer` + socket.io attached to same port

### Added — Frontend
- `socketClient` — singleton socket.io-client with JWT Bearer auth
- `useOnlineGame` hook — phase state machine (`connecting → waiting/joining → playing → ended`) + all server event subscriptions
- `OnlineRoom` page — lobby with Create Room / Join by code, waiting screen, game-over screen
- `OnlineBoardGame` component — board driven by server state; only active player's clicks are forwarded
- `OnlineRoom.css` — neon room code display, pulsing waiting hint, status bar
- `InputSizeForm` — Online button (green gradient) navigates to `/online` with board size
- `/online` protected route added to router

## [1.3.0] - 2026-04-27

### Added — Backend
- `User` domain entity (id, username, email, passwordHash, createdAt)
- `AuthError` domain errors: `InvalidCredentialsError` (→ HTTP 401), `UserAlreadyExistsError` (→ HTTP 409)
- `UserRepository` port + `MongoUserRepository` implementation (unique email index)
- `RegisterUseCase` (bcrypt hash, 10 rounds) and `LoginUseCase` (JWT, 7d expiry)
- `POST /auth/register` and `POST /auth/login` routes with zod validation
- `authenticate` middleware — verifies JWT Bearer token, attaches `req.user`
- All `/replay` routes protected behind `authenticate`; DELETE scoped to replay owner
- Optional `userId` field on `Replay` entity and `ReplaySchema` (backward-compatible)
- `env.JWT_SECRET` added to zod-validated env schema

### Added — Frontend
- `AuthApi` port + `HttpAuthApi` implementation (JWT stored in `localStorage`)
- `HttpReplayApi` now injects `Authorization: Bearer` header on every request
- `AuthContext` + `AuthProvider`: `user`, `login`, `register`, `logout`; bootstraps from stored token on load
- `Login` and `Register` pages with hi-tech glass-card styling
- `ProtectedRoute` wrapper — redirects unauthenticated users to `/login`
- NavBar shows username and Logout button when authenticated; hides Replay link when logged out

## [1.2.1] - 2026-04-27

### Fixed
- CI failure on `setup-node@v4` for the backend job: `backend/.gitignore` was excluding `package-lock.json`, so the cache-dependency-path could not be resolved and `npm ci` would have failed. Removed the rule and committed the existing lockfile.

## [1.2.0] - 2026-04-27

### Added
- **MinimaxBot** — Minimax search with alpha-beta pruning and a sliding-window heuristic for non-terminal evaluation
  - Adaptive depth: 9 (3×3), 5 (4×4), 4 (5×5), 3 (6×6+) for interactive response time
  - Center-first move ordering for stronger pruning
  - 6 unit tests (centre opening, immediate win, immediate block, draws, full board, depth cap)
- **Bot difficulty selector** on the home form — Easy (greedy) / Hard (minimax) pill chips with `role=radio`
- Strategy factory `makeBot(difficulty)` keyed on `Difficulty = 'easy' | 'hard'`
- Backend `GetReplayByIdUseCase` and `GET /replay/:id` route (404 on miss via new `ReplayNotFoundError`)
- Frontend `LoadReplays` use case wrapping `ReplayApi.list/getById` so the presentation layer is fully port-driven
- Optional `at` timestamp on every `Move` (ISO 8601, both backend and frontend); domain factory normalises string → Date
- `MoveDTO` carrying `at?: string` for HTTP boundaries (separate from internal Move type)
- **GitHub Actions CI** — lint/typecheck/test/build for backend and frontend on push and PR to `main`/`develop`

### Changed
- `useGame(size, isSinglePlayer, difficulty)` now accepts a difficulty parameter; bot is constructed once per game session via `useRef`
- `PLACE` reducer action receives the bot instance, keeping the reducer pure
- `ReplayController` constructor now takes `getReplayById` use case
- Centralized error handler maps `ReplayNotFoundError` → HTTP 404 (was 500)

### Fixed
- Type alignment between zod-validated request body and domain `Move`: previously implicit `string` vs `Date` for `at`; now explicit DTO ↔ entity conversion

## [1.1.1] - 2026-04-27

### Added
- Hi-tech dark theme with design tokens (CSS custom properties) for backgrounds, accents, radii, and shadows
- Sticky glass navbar with branded `> XO-Game` wordmark and pill-shaped active nav
- Glass-card layout for input form, replay list, and replay detail
- Mode-coded accent bar on replay list cards (pink for single-player, cyan for multi-player)
- Animated modal popup (fade-in backdrop blur, slide-up panel)
- Neon glow on board cells (cyan for X, pink for O) with subtle hover and click animations

### Changed
- Default fonts: Inter (UI) and JetBrains Mono / system mono (labels and code)
- Replay list `Replay.tsx` now uses an info grid with uppercase mono labels
- Replay detail consolidates metadata + board + step navigation into a single glass card
- Buttons share global styles (hover lift + accent border) instead of inline color props

### Fixed
- Text caret no longer blinks on board cells when clicked (added `user-select: none` and tap-highlight reset)

### Removed
- `react-icon` (typo) entry from `frontend/pnpm-lock.yaml` (only `react-icons` is used)

## [1.1.0] - 2026-04-26

### Added
- TypeScript across backend and frontend (strict mode)
- Clean Architecture layout for both apps:
  - **Backend:** `domain/`, `application/`, `infrastructure/` + composition root in `src/main.ts`
  - **Frontend:** `domain/`, `application/`, `infrastructure/`, `presentation/` + composition root in `src/main.tsx`
- Backend: zod validation on POST `/replay`, CORS whitelist (`CORS_ORIGINS`), rate limiting (100 req / 15 min / IP), centralized error handler
- Backend: env validation at startup via zod (fails fast on misconfig)
- Frontend: `BotStrategy` interface (Strategy Pattern) with `GreedyBot` implementation
- Frontend: `useGame` hook (`useReducer` state machine) replacing racing useEffects
- Frontend: `Popup` modal replacing blocking `alert()` calls
- Frontend: `VITE_API_URL` env support (no more hardcoded URLs)
- Unit tests (Vitest):
  - Backend: 17 tests across `Replay` entity and `SaveReplayUseCase`
  - Frontend: 9 tests across `winnerChecker` and `GreedyBot`
- `backend/README.md` and `frontend/README.md` documenting architecture and usage
- `.env.example` files for both apps
- Root `.gitignore`

### Changed
- Backend entry point: `server.js` → `src/main.ts`
- Backend dependency injection: explicit wiring in composition root (no global singletons)
- Frontend pages and components migrated from `.jsx` to `.tsx`
- Game logic (`findWinner`, bot moves, board ops) extracted from `BoardGame.jsx` into pure domain services

### Removed
- Legacy `backend/server.js`, `backend/routers/replay.js`, `backend/models/Replay.js`
- Legacy `frontend/src/{components,pages}/*.jsx`, `App.jsx`, `main.jsx`, `index.css`, `App.css`
- `vite.config.js` (replaced by `vite.config.ts`)
- Hardcoded URL `http://localhost:8081` in frontend source

### Fixed
- Race condition between two `useEffect` blocks watching winner/draw on `BoardGame.jsx`
- CORS open to all origins (now whitelisted)

## [1.0.0] - 2025-08-27

### Added
- Initial XO Game release: React + Vite frontend, Express + MongoDB backend
- Single-player vs greedy bot, multiplayer, board sizes 3+
- Replay save / list / delete

[1.2.1]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.2.1
[1.2.0]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.2.0
[1.1.1]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.1.1
[1.1.0]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.1.0
[1.0.0]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.0.0

[1.3.0]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.3.0
