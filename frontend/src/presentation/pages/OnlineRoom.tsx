import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSocket, disconnectSocket } from '../../infrastructure/socket/socketClient'
import { useOnlineGame } from '../../application/hooks/useOnlineGame'
import OnlineBoardGame from '../components/OnlineBoardGame'
import '../styles/OnlineRoom.css'

function OnlineRoom() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [size, setSize] = useState<number>(3)
  const [joinCode, setJoinCode] = useState('')

  const socket = useMemo(() => {
    const token = localStorage.getItem('xo_token') ?? ''
    return getSocket(token)
  }, [])

  const { phase, gameState, myMark, errorMsg, createRoom, joinRoom, placeCell } =
    useOnlineGame(socket)

  function handleLeave() {
    disconnectSocket()
    navigate('/')
  }

  // ---- Game over ----
  if (phase.type === 'ended') {
    const msg =
      phase.reason === 'opponent-disconnected'
        ? 'Opponent disconnected.'
        : gameState?.winner
          ? gameState.winner === myMark
            ? 'You win!'
            : 'You lose.'
          : "It's a draw."

    return (
      <div className="onlineCard">
        <h2 className="onlineTitle">Game Over</h2>
        <p className="onlineMsg">{msg}</p>
        <button onClick={handleLeave}>Back to Home</button>
      </div>
    )
  }

  // ---- Playing ----
  if (phase.type === 'playing' && gameState && myMark) {
    const isMyTurn = gameState.currentPlayer === myMark
    return (
      <OnlineBoardGame
        gameState={gameState}
        myMark={myMark}
        opponentUsername={phase.opponentUsername}
        currentUsername={user?.username ?? ''}
        isMyTurn={isMyTurn}
        onPlaceCell={placeCell}
        onLeave={handleLeave}
      />
    )
  }

  // ---- Waiting (host) ----
  if (phase.type === 'waiting') {
    return (
      <div className="onlineCard">
        <h2 className="onlineTitle">Online Multiplayer</h2>
        <div className="onlineWaiting">
          <p className="onlineLabel">Share this code with your opponent</p>
          <div className="onlineCode">{phase.code}</div>
          <p className="onlineHint">Waiting for opponent to join…</p>
        </div>
        <button className="onlineBackBtn" onClick={handleLeave}>
          ← Cancel
        </button>
      </div>
    )
  }

  // ---- Lobby (idle / joining) ----
  return (
    <div className="onlineCard">
      <h2 className="onlineTitle">Online Multiplayer</h2>

      {errorMsg && <p className="onlineError">{errorMsg}</p>}

      <div className="onlineSection">
        <div className="onlineCreateBlock">
          <label className="onlineLabel">Board size</label>
          <input
            type="number"
            min={3}
            max={10}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10) || 3)}
            className="onlineSizeInput"
          />
          <button
            className="onlineBtn create"
            onClick={() => createRoom(size)}
            disabled={phase.type === 'joining'}
          >
            Create Room
          </button>
        </div>

        <div className="onlineDivider">— or join —</div>

        <div className="onlineJoinRow">
          <input
            className="onlineInput"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button
            className="onlineBtn join"
            onClick={() => joinRoom(joinCode)}
            disabled={joinCode.length < 4 || phase.type === 'joining'}
          >
            {phase.type === 'joining' ? 'Joining…' : 'Join'}
          </button>
        </div>
      </div>

      <button className="onlineBackBtn" onClick={handleLeave}>
        ← Back
      </button>
    </div>
  )
}

export default OnlineRoom
