import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BoardGame.css";

function BoardGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSinglePlayer, size } = location.state; // isSinglePlayer and size
  // console.log(isSinglePlayer,size)
  const emptyBoard = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));

  return (
    <div className="boardGame">
      {emptyBoard.map((row, i) =>
        row.map((cell, j) => (
          <div className="cell" key={`${i},${j}`}>
            {cell}
          </div>
        ))
      )}
    </div>
  );
}

export default BoardGame;
