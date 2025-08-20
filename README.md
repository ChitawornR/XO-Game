<h1 align="center">
  <br>
  XO-GAME
  <br>
</h1>

<h4 align="center">Tic-Tac-Toe with Single/Multi-Player, Smart Bot & Match Replays.</h4>

## Requirements

- **Node.js ≥ 18 (LTS)** and **npm ≥ 10** (or yarn/pnpm)  
  Check versions: `node -v` / `npm -v`
- **MongoDB Compass** (Recommended for browsing the DB)
- **Git** (to clone the project)
- **Modern browser** (Chrome/Edge/Firefox)

## Setup
Backend Structure:
```
xo-game/
└─ backend/
   ├─ models/
   │  └─ Replay.js
   ├─ routers/
   │  └─ replay.js
   ├─ server.js
   └─ .env             # create this file

```
in .env file:
```bash
# MongoDB URI connection string
MONGO_URI = mongodb://localhost:27017/XOGame
# Port for backend server
# If change PORT, You must change port in function fetch in frontend the same
PORT = 8081
```

## Installation
1. Clone the project to your device:
```bash
git clone https://github.com/ChitawornR/XO-Game.git
```
2. Navigate to project directory:
```bash
cd xo-game
```
## Run project
### Frontend
  1. Navigate to the frontend directory:
  ```bash
  cd frontend
  ```
  2. Install dependencies:
  ```bash
  npm install
  ```
  3. Start the frontend:
  ```bash
  npm dev
  ```
### Backend
  1. Open a new terminal and navigate to the backend directory:
  ```bash
  cd backend
  ```
  2. Install dependencies:
  ```bash
  npm install
  ```
  3. Start the backend server:
  ```bash
  npm run dev
  ```

## How I design this program
## Algorithm

