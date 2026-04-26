# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

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

[1.1.1]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.1.1
[1.1.0]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.1.0
[1.0.0]: https://github.com/ChitawornR/XO-Game/releases/tag/v1.0.0
