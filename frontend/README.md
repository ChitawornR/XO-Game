# XO-Game — Frontend

React 19 + Vite + TypeScript frontend for the XO-Game project.

---

## Stack

| Layer | Tool |
|---|---|
| UI | React 19 + react-router-dom 7 |
| Build | Vite 7 + TypeScript 5 |
| Testing | Vitest + @testing-library/react |
| Icons | react-icons 5 |

---

## Scripts

```bash
pnpm dev        # Start the Vite dev server
pnpm build      # Type-check then build for production
pnpm preview    # Preview the production build locally
pnpm test       # Run all unit tests with Vitest
pnpm typecheck  # Run tsc --noEmit (no output files)
pnpm lint       # Run ESLint
```

---

## Environment Variables

Copy `.env.example` to `.env` and set:

```
VITE_API_URL=http://localhost:8081   # Base URL for the Express backend
```

If `VITE_API_URL` is not set, the app falls back to `http://localhost:8081` automatically.

---

## Folder Structure

```
src/
├── domain/                  # Pure game logic — NO React, NO fetch
│   ├── entities/            # Type definitions: Player, Cell, Board, Move, GameState
│   ├── services/            # Pure functions: winnerChecker, boardOps, bots/
│   ├── rules/               # streak.ts — streakFor(size)
│   └── __tests__/           # Vitest unit tests (no DOM required)
├── application/             # Orchestration — uses domain, may use React hooks
│   ├── hooks/               # useGame — single useReducer state machine
│   ├── ports/               # ReplayApi interface (dependency inversion)
│   └── use-cases/           # PlayMove, SaveReplay
├── infrastructure/          # Concrete adapters — fetch, env
│   ├── api/                 # HttpReplayApi implements ReplayApi
│   └── config/              # env.ts — typed VITE_* access
├── presentation/            # React UI — imports from application/ only
│   ├── components/          # BoardGame, NavBar, Popup, InputSizeForm
│   ├── pages/               # Home, Play, Replay, ReplayDetail
│   └── styles/              # CSS files
└── main.tsx                 # Composition root — wires HttpReplayApi + renders App
```

### Dependency Rule

```
presentation → application → domain
infrastructure → application/ports  (implements interface)
main.tsx → everything               (composition root only)
```

`domain/` must never import from any other layer.
`application/` must never import from `infrastructure/` or `presentation/`.

---

## How to Add a New Bot Strategy

1. Create `src/domain/services/bots/MyBot.ts`:

```ts
import type { BotStrategy, BotMove } from './BotStrategy'
import type { Board } from '../../entities/Board'

export class MyBot implements BotStrategy {
  decide(board: Board, streak: number, player: 'X' | 'O'): BotMove | null {
    // your logic here
  }
}
```

2. In `src/application/hooks/useGame.ts`, replace the `GreedyBot` import and
   instantiation with `MyBot`. No other files need to change.

---

## How to Add a New Page / Route

1. Create `src/presentation/pages/MyPage.tsx`.
2. Add the `<Route>` in `src/main.tsx` inside `<Routes>`.
3. Done — no build config changes required.
