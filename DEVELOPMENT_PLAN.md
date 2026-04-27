# XO-Game — Development Plan

> เอกสารแผนพัฒนาเกม XO ในบทบาท **Game Owner** สำหรับการต่อยอดจากโค้ดที่เขียนตอนเข้าฝึกงาน เปิดให้คนทั่วไปเข้ามาเล่นได้
> Stack ปัจจุบัน: **React 19 + Vite (Frontend)**, **Express + MongoDB (Backend)**

---

## สารบัญ

1. [Roadmap การพัฒนา](#1-roadmap-การพัฒนา)
2. [วิเคราะห์โค้ดเดิม](#2-วิเคราะห์โค้ดเดิม)
3. [Clean Architecture Design](#3-clean-architecture-design)
4. [การใช้ AI Tools ปรับปรุงโค้ด](#4-การใช้-ai-tools-ปรับปรุงโค้ด)
5. [Gitflow Strategy](#5-gitflow-strategy)
6. [ลำดับงานที่แนะนำ](#6-ลำดับงานที่แนะนำ)

---

## 1) Roadmap การพัฒนา

### Phase 1 — Stabilize (พร้อม Production)
- ย้าย hard-coded URL `http://localhost:8081` → ใช้ `import.meta.env.VITE_API_URL`
- เพิ่ม CORS whitelist (ปัจจุบัน `app.use(cors())` เปิดทุก origin)
- เพิ่ม Rate limiting (`express-rate-limit`) ป้องกัน spam endpoint `/replay`
- เพิ่ม Input validation ด้วย `zod` ที่ POST `/replay`
- Migrate JS → TypeScript ทั้ง Frontend และ Backend

### Phase 2 — Identity & Online Multiplayer
- ระบบ Auth (JWT หรือ OAuth Google) → ผูก replay กับ user
- Online Multiplayer ด้วย **WebSocket (socket.io)** — ห้องเล่นแบบ real-time
- Matchmaking / Room code

### Phase 3 — Game Features
- Bot ระดับยาก (Easy / Medium / Hard ด้วย **Minimax + Alpha-Beta pruning**)
- Leaderboard, ELO rating
- Replay sharing ผ่าน link
- PWA / Mobile responsive

### Phase 4 — Deploy
- Frontend → Vercel
- Backend → Render / Railway
- Database → MongoDB Atlas
- CI/CD → GitHub Actions
- Monitoring → Sentry + UptimeRobot

---

## 2) วิเคราะห์โค้ดเดิม

จุดที่ต้องปรับปรุงจากการอ่านโค้ดจริงในโปรเจกต์:

| ประเด็น | โค้ดเดิม | ปัญหา | วิธีปรับปรุง |
|---|---|---|---|
| **Bug การพิมพ์** | `steak` ทุกที่ | ควรเป็น `streak` | Refactor ทั้งโปรเจกต์ |
| **Hard-coded URL** | `BoardGame.jsx:54` | Deploy ไม่ได้ | ใช้ env variable |
| **`alert()` blocking** | `BoardGame.jsx:30,44` | UX แย่ บล็อก thread | ใช้ Modal / Toast |
| **Logic ฝัง Component** | `findWinner`, `findBotMove` ใน `BoardGame.jsx` | Test ยาก, reuse ไม่ได้ | แยกเป็น domain layer + unit test |
| **State ซ้ำซ้อน** | `useEffect` 2 ตัว คุม winner/draw แยกกัน | Race condition | รวมเป็น state machine (`useReducer` หรือ XState) |
| **Bot ไม่ฉลาด** | Greedy 1 ชั้น | แพ้ง่ายเมื่อ size > 3 | Minimax + Alpha-Beta |
| **ไม่มี Validation** | `routers/replay.js:9` | inject ขยะลง DB ได้ | zod schema |
| **CORS เปิดหมด** | `server.js:9` | ไม่ปลอดภัยใน production | whitelist domain |
| **ไม่มี Test** | – | refactor แล้วพังไม่รู้ | Vitest (FE) + Jest/Supertest (BE) |
| **ไม่มี TypeScript** | JSX/JS ล้วน | Bug runtime หา type ยาก | migrate เป็น TS |
| **`isBoardFull` ใช้ `.map()`** | `BoardGame.jsx:249` | อ่านยาก | `board.flat().every(c => c !== "")` |
| **Move ไม่มี timestamp** | `models/Replay.js` | replay step ตามเวลาจริงไม่ได้ | เพิ่ม `at: Date` |

---

## 3) Clean Architecture Design

### หลักการ

แยกโค้ดออกเป็นชั้น (layer) ตาม **Dependency Rule** — ชั้นในไม่รู้จักชั้นนอก, ชั้นนอกรู้จักชั้นในผ่าน interface (Dependency Inversion)

```
┌─────────────────────────────────────────────────┐
│  Infrastructure  (Express, MongoDB, React, HTTP)│
│  ┌───────────────────────────────────────────┐  │
│  │  Interface Adapters (Controllers, Repos)  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Application (Use Cases, Ports)     │  │  │
│  │  │  ┌───────────────────────────────┐  │  │  │
│  │  │  │  Domain (Entities, Rules)     │  │  │  │
│  │  │  └───────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
       ▲ การพึ่งพาชี้เข้าด้านในเสมอ
```

### ทำไมต้องใช้ Clean Architecture
- **Game logic ไม่ผูกกับ React** — เปลี่ยน UI เป็น Vue/Mobile ได้โดยไม่กระทบ
- **Repository ไม่ผูกกับ MongoDB** — ย้ายไป PostgreSQL/Firebase ได้โดยแก้แค่ Infrastructure
- **Test ง่าย** — Domain เป็น pure function/class ไม่มี side effect
- **Bot strategy เปลี่ยนง่าย** — ผ่าน interface (Strategy Pattern: Greedy / Minimax / RL)

---

### Backend Structure (Clean Architecture)

```
backend/
└── src/
    ├── domain/                          # ชั้นในสุด — Pure logic, ไม่มี dependency
    │   ├── entities/
    │   │   ├── Board.ts                 # Board entity + invariants
    │   │   ├── Move.ts                  # Move value object
    │   │   ├── Player.ts                # 'X' | 'O' type
    │   │   └── Replay.ts                # Replay aggregate
    │   ├── services/
    │   │   ├── WinnerChecker.ts         # หา winner จาก board (pure)
    │   │   └── GameRules.ts             # streak rule, board size rule
    │   └── errors/
    │       └── DomainError.ts
    │
    ├── application/                     # Use cases — orchestrate domain
    │   ├── use-cases/
    │   │   ├── SaveReplayUseCase.ts
    │   │   ├── ListReplaysUseCase.ts
    │   │   ├── GetReplayByIdUseCase.ts
    │   │   └── DeleteReplayUseCase.ts
    │   ├── ports/                       # Interface ที่ Infrastructure ต้องทำให้
    │   │   └── ReplayRepository.ts      # interface (in-memory/mongo ก็ได้)
    │   └── dto/
    │       └── ReplayDTO.ts
    │
    ├── infrastructure/                  # ชั้นนอก — Framework & I/O
    │   ├── db/
    │   │   ├── mongo/
    │   │   │   ├── ReplaySchema.ts      # mongoose schema
    │   │   │   └── MongoReplayRepository.ts  # implements ReplayRepository
    │   │   └── connect.ts
    │   ├── web/
    │   │   ├── controllers/
    │   │   │   └── ReplayController.ts
    │   │   ├── routes/
    │   │   │   └── replay.routes.ts
    │   │   ├── middlewares/
    │   │   │   ├── errorHandler.ts
    │   │   │   ├── validateBody.ts      # zod
    │   │   │   └── rateLimit.ts
    │   │   └── validators/
    │   │       └── replay.schema.ts     # zod schemas
    │   └── config/
    │       └── env.ts
    │
    └── main.ts                          # Composition Root — wiring ทุก layer
```

### Frontend Structure (Clean Architecture)

```
frontend/
└── src/
    ├── domain/                          # Game logic ไม่ผูก React
    │   ├── entities/
    │   │   ├── Board.ts
    │   │   ├── Move.ts
    │   │   └── GameState.ts
    │   ├── services/
    │   │   ├── winnerChecker.ts         # findWinner (pure)
    │   │   ├── boardOps.ts              # placeMove, isBoardFull, createEmptyBoard
    │   │   └── bots/
    │   │       ├── BotStrategy.ts       # interface
    │   │       ├── GreedyBot.ts         # ของเดิม
    │   │       └── MinimaxBot.ts        # ของใหม่
    │   └── rules/
    │       └── streak.ts                # size === 3 ? 3 : 4
    │
    ├── application/                     # Use cases ฝั่ง client
    │   ├── hooks/
    │   │   └── useGame.ts               # useReducer state machine
    │   ├── ports/
    │   │   └── ReplayApi.ts             # interface
    │   └── use-cases/
    │       ├── PlayMove.ts
    │       ├── SaveReplay.ts
    │       └── LoadReplays.ts
    │
    ├── infrastructure/                  # Adapter: HTTP, storage
    │   ├── api/
    │   │   └── HttpReplayApi.ts         # implements ReplayApi (fetch)
    │   └── config/
    │       └── env.ts                   # VITE_API_URL
    │
    ├── presentation/                    # UI Layer (React)
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Play.tsx
    │   │   ├── Replay.tsx
    │   │   └── ReplayDetail.tsx
    │   ├── components/
    │   │   ├── BoardGame.tsx            # ใช้ useGame() — ไม่มี logic
    │   │   ├── NavBar.tsx
    │   │   └── Popup.tsx
    │   └── styles/
    │
    └── main.tsx                         # Composition Root
```

### ตัวอย่าง Code Skeleton

**`domain/services/winnerChecker.ts`** — pure function ไม่มี React/DB
```ts
import { Board, Player } from "../entities/Board";

export function findWinner(board: Board, streak: number): Player | null {
  // logic เดิมจาก BoardGame.jsx แต่ pure
  // testable ด้วย Vitest โดยไม่ต้องมี DOM
}
```

**`application/ports/ReplayRepository.ts`** — interface
```ts
export interface ReplayRepository {
  save(replay: Replay): Promise<Replay>;
  findAll(): Promise<Replay[]>;
  findById(id: string): Promise<Replay | null>;
  delete(id: string): Promise<boolean>;
}
```

**`infrastructure/db/mongo/MongoReplayRepository.ts`** — implementation
```ts
export class MongoReplayRepository implements ReplayRepository {
  async save(replay: Replay) { /* mongoose */ }
  async findAll() { /* mongoose */ }
  // ...
}
```

**`main.ts`** — Composition Root
```ts
const repo = new MongoReplayRepository();
const saveReplay = new SaveReplayUseCase(repo);
const controller = new ReplayController(saveReplay, /* ... */);
app.use("/replay", buildRoutes(controller));
```

### ผลลัพธ์ที่ได้
- เพิ่ม Bot ใหม่ → สร้าง `MinimaxBot.ts` ใน `domain/services/bots/` แล้ว swap ใน DI โดยไม่แตะ UI
- เปลี่ยน DB → เขียน `PostgresReplayRepository.ts` แทน Mongo โดยไม่กระทบ Use Case
- เปลี่ยน UI → แก้แค่ `presentation/` ไม่กระทบ logic

---

## 4) การใช้ AI Tools ปรับปรุงโค้ด

### AI Tools ที่เลือกใช้
| Tool | ใช้ทำอะไร |
|---|---|
| **Claude Code (CLI)** | Refactor ใหญ่, แยก module ตาม Clean Arch, migrate TS |
| **GitHub Copilot** | Auto-complete inline ระหว่างพิมพ์ |
| **ChatGPT (o1/4)** | ออกแบบ algorithm Minimax, design doc |
| **Cursor** | Edit หลายไฟล์พร้อม preview diff |

### Verification Workflow (ตรวจผล AI)
1. **อ่าน diff ทุกบรรทัด** — ห้าม commit แบบไม่อ่าน
2. **Test-Driven ก่อน Refactor** — เขียน unit test ของ `findWinner` / `findBotMove` ก่อนให้ AI refactor → รันเขียวทั้งหมดหลังแก้
3. **Run จริงในเบราเซอร์** — เปิดเล่น 3×3, 4×4, 5×5 ทั้ง Single/Multi
4. **Lint + Type check** — `pnpm lint` + `tsc --noEmit`
5. **Code review checklist:**
   - มี hallucination API ไหม (เรียก function ที่ไม่มีจริง)
   - logic ผิดเงียบๆ ไหม (เช่น `<=` กลายเป็น `<`)
   - import ครบไหม
   - Dependency rule ของ Clean Architecture ยังถูกต้องไหม (Domain ไม่ import Infrastructure)
6. **Git diff snapshot** — commit เล็ก ทีละ feature ย้อนได้ง่าย
7. **AI cross-check** — ใช้ Claude review งาน Copilot และในทางกลับกัน

---

## 5) Gitflow Strategy

### Branch Structure
```
main             ← production (deploy auto)
└── develop      ← integration branch
    ├── feature/clean-arch-backend
    ├── feature/clean-arch-frontend
    ├── feature/auth-jwt
    ├── feature/online-multiplayer
    ├── feature/minimax-bot
    └── refactor/typescript-migration
release/v1.1.0   ← stabilize ก่อน merge เข้า main
hotfix/xxx       ← แก้บน main แล้ว merge กลับ develop
```

### Rules
- **`main`** — deploy production เท่านั้น, protected, ต้อง PR + review
- **`develop`** — integration branch, รัน CI ทุก push
- **`feature/*`** — branch จาก `develop`, ตั้งชื่อสื่อความหมาย
- **Commit message** — Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`
- **PR ต้องมี:**
  1. Description + screenshot
  2. Test ผ่าน CI
  3. Reviewer อนุมัติ ≥ 1 คน
  4. ไม่มี conflict กับ `develop`

### Tag & Release
- Semantic versioning:
  - `v1.0.0` — โค้ดเดิม
  - `v1.1.0` — Clean Architecture migration
  - `v1.2.0` — TypeScript migration
  - `v2.0.0` — Online multiplayer
- ใช้ GitHub Release + Changelog auto-gen

### CI/CD (GitHub Actions)
- **PR** → run lint + test + build
- **Merge → develop** → deploy staging
- **Merge → main** → deploy production + tag release

---

## 6) ลำดับงานที่แนะนำ

| ลำดับ | งาน | เวลา | ผลลัพธ์ |
|---|---|---|---|
| 1 | เพิ่ม env variable + CORS whitelist | 1 ชม. | Deploy ได้ |
| 2 | Migrate เป็น TypeScript | 2 วัน | Type-safe |
| 3 | **Refactor → Clean Architecture (Backend)** | 2 วัน | Domain/Application/Infrastructure แยก |
| 4 | **Refactor → Clean Architecture (Frontend)** | 2 วัน | Game logic ไม่ผูก React |
| 5 | เขียน Unit Test (Domain layer) | 1 วัน | Coverage > 80% |
| 6 | ทำ Bot Minimax (Strategy Pattern) | 1 วัน | Bot ฉลาดขึ้น |
| 7 | Deploy staging (Vercel + Render) | ครึ่งวัน | คนทั่วไปเข้าทดลองได้ |
| 8 | ทำ Auth + Online Multiplayer | 1 สัปดาห์ | Real-time multiplayer |

---

> **เป้าหมายสุดท้าย:** เกม XO ที่มีโค้ดสะอาด, test ครอบคลุม, แก้ไขได้ง่าย, รองรับการเล่นออนไลน์, และต่อยอดเพิ่ม feature ใหม่ได้โดยไม่ต้องแตะ logic เดิม
