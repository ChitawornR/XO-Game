import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { ReplayRecord } from '../../application/ports/ReplayApi'
import type { Board } from '../../domain/entities/Board'
import { createEmptyBoard, placeMove } from '../../domain/services/boardOps'
import '../styles/ReplayDetail.css'
import '../styles/BoardGame.css'

function ReplayDetail() {
  const location = useLocation()
  const replay = location.state as ReplayRecord

  const [board, setBoard] = useState<Board>(createEmptyBoard(replay.size))
  const [step, setStep] = useState(0)

  useEffect(() => {
    let tempBoard = createEmptyBoard(replay.size)
    for (let i = 0; i < step; i++) {
      const move = replay.moves[i]
      tempBoard = placeMove(tempBoard, move.row, move.col, move.player)
    }
    setBoard(tempBoard)
  }, [step, replay])

  const formattedDate = new Date(replay.createdAt).toLocaleString('th-TH-u-ca-gregory')

  return (
    <div className="replayDetail">
      <div className="detailText">
        <p>
          <b>Date</b>
          <span>{formattedDate}</span>
        </p>
        <p>
          <b>Winner</b>
          <span>{replay.winner ?? 'Draw'}</span>
        </p>
        <p>
          <b>Mode</b>
          <span>{replay.isSinglePlayer ? 'Single player' : 'Multi player'}</span>
        </p>
      </div>

      <div className="boardGameWrap" style={{ overflowX: 'auto' }}>
        <div
          className="boardGame"
          style={{ gridTemplateColumns: `repeat(${replay.size}, 1fr)` }}
        >
          {board.map((row, i) =>
            row.map((cell, j) => {
              const cls = cell === 'X' ? 'cell x' : cell === 'O' ? 'cell o' : 'cell'
              return (
                <div className={cls} key={`${i},${j}`}>
                  {cell}
                </div>
              )
            }),
          )}
        </div>
      </div>

      <div className="stepIndicator">
        <b>Step</b>
        <span className="stepNum">{step}</span> / {replay.moves.length}
      </div>

      <div className="stepNav">
        <button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          ← Previous step
        </button>
        <button
          disabled={step === replay.moves.length}
          onClick={() => setStep((s) => s + 1)}
        >
          Next step →
        </button>
      </div>
    </div>
  )
}

export default ReplayDetail
