import '../styles/ChessBoard.css'
import type { Square } from '../../domain/chess/entities/Square'
import type { ChessGameState } from '../../domain/chess/entities/ChessGameState'
import type { Color, PieceType } from '../../domain/chess/entities/Piece'
import { squareEquals } from '../../domain/chess/entities/Square'
import { findKing } from '../../domain/chess/services/checkDetector'

// ---------------------------------------------------------------------------
// Unicode piece map
// ---------------------------------------------------------------------------

const PIECE_UNICODE: Record<Color, Record<PieceType, string>> = {
  white: {
    king:   '♔',
    queen:  '♕',
    rook:   '♖',
    bishop: '♗',
    knight: '♘',
    pawn:   '♙',
  },
  black: {
    king:   '♚',
    queen:  '♛',
    rook:   '♜',
    bishop: '♝',
    knight: '♞',
    pawn:   '♟',
  },
}

const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANK_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1']

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ChessBoardProps = {
  state: ChessGameState
  selectedSquare: Square | null
  legalMovesForSelected: Square[]
  onSquareClick: (sq: Square) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChessBoard({
  state,
  selectedSquare,
  legalMovesForSelected,
  onSquareClick,
}: ChessBoardProps) {
  const { board, currentPlayer } = state

  // Find king square for check highlighting
  const kingSquare =
    state.status === 'check' || state.status === 'checkmate'
      ? findKing(board, currentPlayer)
      : null

  // Build a fast lookup set for legal move targets
  const legalSet = new Set(legalMovesForSelected.map(sq => `${sq.row},${sq.col}`))

  return (
    <div className="chessBoardWrap">
      {/* Rank labels + board + rank labels */}
      <div className="chessBoardOuter">
        {/* Left rank labels (8 → 1) */}
        <div className="rankLabels" aria-hidden>
          {RANK_LABELS.map(r => (
            <div key={r} className="rankLabel">{r}</div>
          ))}
        </div>

        {/* The board itself */}
        <div
          className="chessBoard"
          role="grid"
          aria-label="Chess board"
        >
          {board.map((row, rowIdx) =>
            row.map((piece, colIdx) => {
              const sq: Square = { row: rowIdx, col: colIdx }
              const isLight = (rowIdx + colIdx) % 2 === 0
              const isSelected = selectedSquare !== null && squareEquals(sq, selectedSquare)
              const key = `${rowIdx},${colIdx}`
              const isLegal = legalSet.has(key)
              const isCapture = isLegal && piece !== null && piece.color !== currentPlayer
              const isKingInCheck = kingSquare !== null && squareEquals(sq, kingSquare)

              let squareCls = `chessSquare ${isLight ? 'light' : 'dark'}`
              if (isSelected) squareCls += ' selected'
              if (isKingInCheck) squareCls += ' inCheck'
              if (isLegal && !isCapture) squareCls += ' legalMove'
              if (isCapture) squareCls += ' captureTarget'

              return (
                <div
                  key={key}
                  className={squareCls}
                  role="gridcell"
                  aria-label={`${FILE_LABELS[colIdx]}${RANK_LABELS[rowIdx]}${piece ? ` ${piece.color} ${piece.type}` : ''}`}
                  onClick={() => onSquareClick(sq)}
                >
                  {piece && (
                    <span className={`chessPiece ${piece.color}`} aria-hidden>
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* File labels (a–h) */}
      <div className="fileLabels" aria-hidden>
        {FILE_LABELS.map(f => (
          <div key={f} className="fileLabel">{f}</div>
        ))}
      </div>
    </div>
  )
}

export default ChessBoard
