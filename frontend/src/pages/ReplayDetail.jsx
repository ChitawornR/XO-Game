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

  useEffect(() => {
    const move = replay.moves.slice(0, step);
    let tempBoard = [...emptyBoard];

    for (let i = 0; i < move.length; i++) {
      tempBoard = tempBoard.map((row, j) =>
        row.map((cell, k) => {
          if (move[i].row === j && move[i].col === k) {
            return move[i].player;
          }
          return cell;
        })
      );
    }

    setBoard(tempBoard);
  }, [step]);

  const formattedDateTH = new Date(replay.createdAt).toLocaleString(
    "th-TH-u-ca-gregory"
  );

  return (
    <>
      <div className="detailText">
        <p>
          <b>Date:</b> {formattedDateTH}
        </p>
        <p>
          <b>Winner:</b> {replay.winner ? replay.winner : "Draw"}
        </p>
        <p>
          <b>Mode:</b>{" "}
          {replay.isSinglePlayer ? "Single player" : "Multi player"}
        </p>
      </div>
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
          fontSize: 20,
        }}
      >
        <b>Step:</b> {step} / {replay.moves.length}
      </div>
      <div className="manageBtn">
        <button
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          className="previousStep"
        >
          Previous step
        </button>
        <button
          disabled={step === replay.moves.length}
          onClick={() => setStep(step + 1)}
          className="nextStep"
        >
          Next step
        </button>
      </div>
    </>
  );
}

export default ReplayDetail;
