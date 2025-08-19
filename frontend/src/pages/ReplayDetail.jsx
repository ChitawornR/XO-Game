import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ReplayDetail.css";

function ReplayDetail() {
  const location = useLocation();
  const replay = location.state;
  const emptyBoard = Array(replay.size)
    .fill(null)
    .map(() => Array(replay.size).fill(""));

  const [board, setBoard] = useState(emptyBoard);
  const [step, setStep] = useState(0);

  useEffect(()=>{
    const move = replay.moves.slice(0,step)
    let tempBoard = [...emptyBoard]
    
    for(let i = 0; i < move.length; i++){
      tempBoard = tempBoard.map((row,j)=>row.map((cell,k)=>{
        if(move[i].row === j && move[i].col === k){
          return move[i].player
        }
        return cell
      }))
    }

    setBoard(tempBoard)
  },[step])

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <div
          className="boardGame"
          style={{ gridTemplateColumns: `repeat(${replay.size},1fr)` }}
        >
          {board.map((row, i) =>
            row.map((cell, j) => (
              <div className="cell" key={`${i},${j}`}>
                {cell}
              </div>
            ))
          )}
        </div>
      </div>
      <button
        disabled={step === 0}
        onClick={() => setStep(step - 1)}
        className="previousStep"
      >
        Previous step
      </button>
      <button disabled={step === replay.moves.length} onClick={() => setStep(step + 1)} className="nextStep">
        Next step
      </button>
    </>
  );
}

export default ReplayDetail;
