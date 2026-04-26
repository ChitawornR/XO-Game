import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { ReplayRecord } from '../../application/ports/ReplayApi'
import type { Board } from '../../domain/entities/Board'
import { createEmptyBoard } from '../../domain/services/boardOps'
import { placeMove } from '../../domain/services/boardOps'
import '../styles/ReplayDetail.css'

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
    <div className="boxContent">
      <div className="detailText">
        <p>
          <b>Date:</b> {formattedDate}
        </p>
        <p>
          <b>Winner:</b> {replay.winner ?? 'Draw'}
        </p>
        <p>
          <b>Mode:</b> {replay.isSinglePlayer ? 'Single player' : 'Multi player'}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div
          className="boardGame"
          style={{ gridTemplateColumns: `repeat(${replay.size}, 1fr)` }}
        >
          {board.map((row, i) =>
            row.map((cell, j) => (
              <div className="cell" key={`${i},${j}`}>
                {cell}
              </div>
            )),
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
          fontSize: 20,
        }}
      >
        <b>Step:</b>&nbsp;{step} / {replay.moves.length}
      </div>

      <div className="manageBtn">
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="previousStep"
        >
          Previous step
        </button>
        <button
          disabled={step === replay.moves.length}
          onClick={() => setStep((s) => s + 1)}
          className="nextStep"
        >
          Next step
        </button>
      </div>
    </div>
  )
}

export default ReplayDetail
