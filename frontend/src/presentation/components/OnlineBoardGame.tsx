import type { OnlineGameState } from '../../application/hooks/useOnlineGame'
import type { Player } from '../../domain/entities/Player'
import '../styles/BoardGame.css'
import '../styles/OnlineRoom.css'

type Props = {
  gameState: OnlineGameState
  myMark: Player
  opponentUsername: string
  currentUsername: string
  isMyTurn: boolean
  onPlaceCell: (row: number, col: number) => void
  onLeave: () => void
}

function OnlineBoardGame({
  gameState,
  myMark,
  opponentUsername,
  currentUsername,
  isMyTurn,
  onPlaceCell,
  onLeave,
}: Props) {
  const { board, size } = gameState

  return (
    <div className="boxContent">
      <div className="onlineStatus">
        <span className={`onlinePlayer ${myMark === 'X' ? 'x' : 'o'}`}>
          {currentUsername} ({myMark})
        </span>
        <span className="onlineTurnBadge">{isMyTurn ? 'Your turn' : "Opponent's turn"}</span>
        <span className={`onlinePlayer ${myMark === 'X' ? 'o' : 'x'}`}>
          {opponentUsername} ({myMark === 'X' ? 'O' : 'X'})
        </span>
      </div>

      <div className="boardGameWrap" style={{ overflowX: 'auto' }}>
        <div className="boardGame" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {board.map((row, i) =>
            row.map((cell, j) => {
              const cls = cell === 'X' ? 'cell x' : cell === 'O' ? 'cell o' : 'cell'
              const clickable = isMyTurn && cell === ''
              return (
                <div
                  key={`${i},${j}`}
                  className={cls}
                  style={clickable ? undefined : { cursor: 'default' }}
                  onClick={() => clickable && onPlaceCell(i, j)}
                >
                  {cell}
                </div>
              )
            }),
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <button onClick={onLeave}>Leave Game</button>
      </div>
    </div>
  )
}

export default OnlineBoardGame
