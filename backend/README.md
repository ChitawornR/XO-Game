# XO Game — Backend

TypeScript + Express + MongoDB backend following **Clean Architecture**.

---

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| Runtime | Node.js (CommonJS) |
| Web framework | Express 4 |
| Database | MongoDB via Mongoose 8 |
| Validation | Zod |
| Rate limiting | express-rate-limit |
| Test runner | Vitest |
| Dev server | ts-node-dev |

---

## Scripts

```bash
pnpm dev        # Start dev server with hot-reload
pnpm build      # Compile TypeScript to dist/
pnpm start      # Run compiled output (production)
pnpm test       # Run Vitest tests
pnpm typecheck  # Type-check without emitting
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/XOGame` |
| `PORT` | Port the server listens on | `8081` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173` |

All variables are validated at startup via Zod. The server exits immediately if any are missing or malformed.

---

## Folder Structure

```
src/
├── domain/                  # Innermost — pure TypeScript, no framework deps
│   ├── entities/
│   │   ├── Player.ts        # type Player = 'X' | 'O'
│   │   ├── Move.ts          # type Move = { row, col, player }
│   │   └── Replay.ts        # Replay type + createReplay() factory with validation
│   └── errors/
│       └── DomainError.ts   # Base domain error class
│
├── application/             # Orchestrates domain; no Express/Mongoose imports
│   ├── ports/
│   │   └── ReplayRepository.ts   # Interface the infra layer must implement
│   ├── use-cases/
│   │   ├── SaveReplayUseCase.ts
│   │   ├── ListReplaysUseCase.ts
│   │   └── DeleteReplayUseCase.ts
│   └── dto/
│       └── ReplayDTO.ts     # Data shapes crossing the layer boundary
│
├── infrastructure/          # Outermost — frameworks, DB, HTTP
│   ├── config/
│   │   └── env.ts           # Zod-validated process.env
│   ├── db/
│   │   ├── connect.ts       # mongoose.connect()
│   │   └── mongo/
│   │       ├── ReplaySchema.ts          # Mongoose schema + model
│   │       └── MongoReplayRepository.ts # Implements ReplayRepository
│   └── web/
│       ├── controllers/
│       │   └── ReplayController.ts
│       ├── routes/
│       │   └── replay.routes.ts
│       ├── middlewares/
│       │   ├── errorHandler.ts  # Global Express error handler
│       │   ├── validateBody.ts  # Generic Zod middleware
│       │   └── rateLimit.ts     # 100 req / 15 min / IP
│       └── validators/
│           └── replay.schema.ts # Zod schema for POST /replay
│
└── main.ts                  # Composition root — wires all layers together
```

---

## Dependency Rule

```
Domain  <--  Application  <--  Infrastructure  <--  main.ts
```

- **Domain** imports nothing outside its own folder.
- **Application** imports only from `domain/`.
- **Infrastructure** imports from `application/` (via interfaces) and external libraries.
- **main.ts** is the only place that instantiates concrete classes and wires them together.

---

## How to Add a New Use Case

1. **Define any new domain types** in `src/domain/entities/` if needed.
2. **Add a method to `ReplayRepository`** interface in `src/application/ports/ReplayRepository.ts`.
3. **Create the use case class** in `src/application/use-cases/` — accepts a repository via constructor.
4. **Implement the new repo method** in `src/infrastructure/db/mongo/MongoReplayRepository.ts`.
5. **Add a controller method** in `ReplayController.ts` and a new route in `replay.routes.ts`.
6. **Wire it up** in `src/main.ts`.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/replay` | Save a new game replay |
| `GET` | `/replay` | List all replays (newest first) |
| `DELETE` | `/replay/:id` | Delete a replay by MongoDB ObjectId |

All endpoints are rate-limited to **100 requests / 15 minutes / IP**.
