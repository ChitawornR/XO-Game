import { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { RiResetLeftFill, RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri'
import { useGame } from '../../application/hooks/useGame'
import { GameResultPopup } from './Popup'
import { ReplayApiContext } from '../../main'
import '../styles/BoardGame.css'

type LocationState = {
  isSinglePlayer: boolean
  size: number
  difficulty?: 'easy' | 'hard'
}

/**
 * BoardGame — thin UI component.
 * All game logic lives in useGame (application layer).
 */
function BoardGame() {
  const location = useLocation()
  const { isSinglePlayer, size, difficulty } = location.state as LocationState

  const { state, placeCell, reset, dismissNotification, persistReplay, undo, redo, canUndo, canRedo } = useGame(
    size,
    isSinglePlayer,
    difficulty ?? 'easy',
  )
  const api = useContext(ReplayApiContext)

  // Persist replay to server whenever the game ends
  useEffect(() => {
    if (state.status !== 'playing' && api) {
      persistReplay(api).catch((err: unknown) =>
        console.error('Failed to save replay:', err),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])

  function handleDismiss() {
    dismissNotification()
    reset()
  }

  return (
    <div className="boxContent">
      <GameResultPopup notification={state.notification} onClose={handleDismiss} />

      <div className="boardGameWrap" style={{ overflowX: 'auto' }}>
        <div
          className="boardGame"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {state.board.map((row, i) =>
            row.map((cell, j) => {
              const cls = cell === 'X' ? 'cell x' : cell === 'O' ? 'cell o' : 'cell'
              return (
                <div
                  onClick={() => placeCell(i, j)}
                  className={cls}
                  key={`${i},${j}`}
                >
                  {cell}
                </div>
              )
            }),
          )}
        </div>

        <div className="boardActions">
          {!isSinglePlayer && (
            <>
              <button onClick={undo} disabled={!canUndo} className="undoRedoBtn" title="Undo">
                <RiArrowGoBackLine fontSize={16} />
                Undo ({state.past.length})
              </button>
              <button onClick={redo} disabled={!canRedo} className="undoRedoBtn" title="Redo">
                <RiArrowGoForwardLine fontSize={16} />
                Redo ({state.future.length})
              </button>
            </>
          )}
          <button onClick={reset} className="resetBtn">
            <RiResetLeftFill fontSize={18} />
            Reset board
          </button>
        </div>
      </div>
    </div>
  )
}

export default BoardGame
