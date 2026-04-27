import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSocket, disconnectSocket } from '../../infrastructure/socket/socketClient'
import { useOnlineGame } from '../../application/hooks/useOnlineGame'
import OnlineBoardGame from '../components/OnlineBoardGame'
import '../styles/OnlineRoom.css'

type LocationState = { size: number }

function OnlineRoom() {
  const location = useLocation()
  const navigate = useNavigate()
  const { size } = (location.state ?? { size: 3 }) as LocationState
  const { user } = useAuth()
  const [joinCode, setJoinCode] = useState('')

  const socket = useMemo(() => {
    const token = localStorage.getItem('xo_token') ?? ''
    return getSocket(token)
  }, [])

  const { phase, gameState, myMark, createRoom, joinRoom, placeCell } = useOnlineGame(socket, size)

  function handleLeave() {
    disconnectSocket()
    navigate('/')
  }

  // ---- Ended screen ----
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

  // ---- Playing screen ----
  if (phase.type === 'playing' && gameState) {
    const isMyTurn = gameState.currentPlayer === myMark
    return (
      <OnlineBoardGame
        gameState={gameState}
        myMark={myMark!}
        opponentUsername={phase.opponentUsername}
        currentUsername={user?.username ?? ''}
        isMyTurn={isMyTurn}
        onPlaceCell={placeCell}
        onLeave={handleLeave}
      />
    )
  }

  // ---- Lobby screen ----
  return (
    <div className="onlineCard">
      <h2 className="onlineTitle">Online Multiplayer</h2>
      <p className="onlineSubtitle">Board size: {size}×{size}</p>

      {phase.type === 'waiting' && (
        <div className="onlineWaiting">
          <p className="onlineLabel">Share this code with your opponent</p>
          <div className="onlineCode">{phase.code}</div>
          <p className="onlineHint">Waiting for opponent to join…</p>
        </div>
      )}

      {(phase.type === 'connecting' || phase.type === 'joining') && (
        <div className="onlineSection">
          <button className="onlineBtn create" onClick={createRoom}>
            Create Room
          </button>
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
      )}

      <button className="onlineBackBtn" onClick={handleLeave}>
        ← Back
      </button>
    </div>
  )
}

export default OnlineRoom
