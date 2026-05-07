import { useLocation, useNavigate } from 'react-router-dom'
import { RiResetLeftFill, RiArrowLeftLine } from 'react-icons/ri'
import { useChessGame } from '../../application/hooks/useChessGame'
import ChessBoard from '../components/ChessBoard'
import { GameResultPopup } from '../components/Popup'
import '../styles/ChessBoard.css'

type LocationState = {
  isSinglePlayer: boolean
}

/**
 * ChessPlay — thin page component that wires useChessGame → ChessBoard.
 *
 * Sub-Agent 1 handles the router definition; we just consume location.state.
 */
function ChessPlay() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isSinglePlayer } = (location.state ?? { isSinglePlayer: false }) as LocationState

  const {
    state,
    selectedSquare,
    legalMovesForSelected,
    notification,
    selectSquare,
    reset,
    dismissNotification,
  } = useChessGame(isSinglePlayer)

  // Map game notification to the shape GameResultPopup expects
  const popupNotification =
    notification === null
      ? null
      : notification.type === 'checkmate'
      ? { type: 'won' as const, winner: notification.winner === 'white' ? 'White' : 'Black' }
      : { type: 'draw' as const }

  function handleDismiss() {
    dismissNotification()
    reset()
  }

  const turnLabel =
    isSinglePlayer
      ? state.currentPlayer === 'white'
        ? 'Your turn (White)'
        : 'Bot thinking…'
      : state.currentPlayer === 'white'
      ? 'White to move'
      : 'Black to move'

  const statusLabel =
    state.status === 'check'
      ? 'Check!'
      : state.status === 'checkmate'
      ? `Checkmate — ${state.winner === 'white' ? 'White' : 'Black'} wins`
      : state.status === 'stalemate'
      ? 'Stalemate — Draw'
      : state.status === 'draw'
      ? 'Draw (50-move rule)'
      : null

  return (
    <div className="container">
      <div className="boxContent">
        {/* Game-result popup */}
        <GameResultPopup notification={popupNotification} onClose={handleDismiss} />

        <div className="chessBoardWrap">
          {/* Turn / status bar */}
          <div className="chessTurnBar">
            <div className={`chessTurnDot ${state.currentPlayer}`} />
            <span>{turnLabel}</span>
            {statusLabel && (
              <span className={`chessStatus ${state.status}`}>{statusLabel}</span>
            )}
          </div>

          {/* Board */}
          <ChessBoard
            state={state}
            selectedSquare={selectedSquare}
            legalMovesForSelected={legalMovesForSelected}
            onSquareClick={selectSquare}
          />

          {/* Action buttons */}
          <div className="chessBoardActions">
            <button onClick={() => navigate('/chess')} title="Back to mode select">
              <RiArrowLeftLine fontSize={16} />
              Mode select
            </button>
            <button onClick={reset} className="resetBtn" title="Start a new game">
              <RiResetLeftFill fontSize={18} />
              New game
            </button>
          </div>

          {/* Move counter */}
          {state.moves.length > 0 && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-dim)',
              textAlign: 'center',
            }}>
              Move {state.fullMoveNumber} · Half-moves: {state.halfMoveClock}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChessPlay
