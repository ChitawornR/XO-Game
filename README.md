<h1 align="center">
  <br>
  XO-GAME
  <br>
</h1>

<h4 align="center">Tic-Tac-Toe with Single/Multi-Player, Smart Bot, Auth & Online Multiplayer.</h4>

## Requirements

- **Node.js ≥ 18 (LTS)** — check with `node -v`
- **npm ≥ 10** (backend) · **pnpm ≥ 9** (frontend) — check with `npm -v` / `pnpm -v`
  - Install pnpm: `npm install -g pnpm`
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
pnpm dev
```

App opens at `http://localhost:5173`

## Other scripts

| Directory | Command | Description |
|---|---|---|
| `backend` | `npm test` | Run backend unit tests (Vitest) |
| `backend` | `npm run typecheck` | TypeScript type-check without emitting |
| `backend` | `npm run build` | Compile to `dist/` |
| `backend` | `npm start` | Run compiled build (`dist/main.js`) |
| `frontend` | `pnpm test` | Run frontend unit tests (Vitest) |
| `frontend` | `pnpm run typecheck` | TypeScript type-check without emitting |
| `frontend` | `pnpm run build` | Production build to `dist/` |
| `frontend` | `pnpm run lint` | ESLint check |

## How I design this program and Algorithm
  ### Objective
  - Build a flexible XO game with selectable board size and play modes.
  - Persist game history (winner, board size, move list, mode) to MongoDB for replay and deletion.
  - Keep a clean separation of concerns between frontend (React + Vite) and backend (Node.js + Express).
  ### Scope
  - Mode selection: Singleplayer (play vs bot) / Multiplayer (alternate turns).
  - Board size selection: size ≥ 3 (e.g., 3×3, 4×4, 5×5).
  - Win condition: steak = size === 3 ? 3 : 4 (steak 3 in a row,col,diagonal for 3×3, other steak = 4).
  - Persist result object: { winner, size, moves, isSinglePlayer }.
  - Replay page: list history, step through moves, and delete entries.
  ### Out of Scope
  - Accounts / authentication.
  - Online or networked multiplayer.
  ### Actors
  - Player: chooses mode/size, plays the game, views history, deletes history entries.
  - System/Bot: decides the bot move in Singleplayer.
  ### Main User Flow
  1. **Home:** choose mode (Single/Multiplayer) and board size >= 3 → start game.
  2. **Game:**
       - Render the N×N board.
       - Alternate turns, with X starting first
       - After each move, check status: Win / Draw
       - When the game ends, build the payload and POST it to the backend to save.
  3. **Replay:**
       - GET a paginated list of games (newest first).
       - Open a specific game to play back moves (step).
       - DELETE unwanted entries.
  ### Win Rules & Winner Detection
  1. **Multiplayer:**
       - When clicking on a cell on the board, there is a function to check if the clicked cell is empty or not, if not empty, the process will stop, but if it is empty, the process will continue.
       - After that, the row and column params will be inserted into the current board.
       - copy old move and add new move into array [{row,col,player}] for keep the move data.
       - Switch players
       - every round board change, useEffect will call findWinner function to chek winner
       - findWinner function is a function to check steak in row, col, diagonal
       - if have a winner then return player('X' or 'O'), if not, return null
       - if data that return from findWinner function not null, then set board to empty board N×N and send data to database for show in replay page
  2. **Singleplayer:**
       - Singleplayer mode works mostly the same as multiplayer mode.
       - But when clicking on a cell on the board, there will be an additional check if it is a single player mode, there will be an additional bot operation.
       - The bot works in 3 ways.
         1. random if nothing to do
         2. if bot will win (2 in 3 of steak || 3 in 4 of steak) move for win
         3. if player will win (2 in 3 of steak || 3 in 4 of steak) move for block
  3. **How bot work**
       - The bot will find a empty cell in the board and try to choose that cell
       - if bot win, then choose that cell to win
       - if player win, choose that cell to block
       - if try to choose every cell and no winner, bot will random choose empty cell in the board 

