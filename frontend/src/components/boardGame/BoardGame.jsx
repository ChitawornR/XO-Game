import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./BoardGame.css";

function BoardGame() {
  const location = useLocation();
  const { isSinglePlayer, size } = location.state; // isSinglePlayer and size

  //  create metrix board size*size content ''
  const emptyBoard = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));

  const [board, setBoard] = useState(emptyBoard);
  const [player, setPlayer] = useState("X");
  const [moves, setMoves] = useState([]);

  useEffect(()=>{
    const win = findWinner(board,size === 3?3:4)
    console.log(win);
  })

  function findWinner(currentBoard,steak){
    // check row
    for(let row = 0; row < size; row++){
      for(let col = 0; col <= size-steak; col++){
        let rowTemp = []
        for(let i = 0; i < steak; i++){
          rowTemp.push(currentBoard[row][col+i])
        }
        if(rowTemp.every((cell)=> (cell === rowTemp[0] && cell != ''))){
          return rowTemp[0]
        }
      }
    }

    // check col
    for(let col = 0; col < size; col++){
      for(let row = 0; row <= size-steak; row++){
        let colTemp = []
        for(let i = 0; i < steak; i++){
          colTemp.push(currentBoard[row+i][col])
        }
        if(colTemp.every((cell)=> (cell === colTemp[0] && cell != ''))){
          return colTemp[0]
        }
      }
    }

    return null
  }

  function handleOnClickCell(row, col) {
    if(board[row][col] !== '') return
    const tempBoard = board.map((r, i) =>
      r.map((c, j) => {
        if (i === row && j === col) {
          return player; // set playter to row and col that clicked
        }
        return c;
      })
    );
    const move = [...moves, { row, col, player }]; // to copy old move and add new move into array
    // set
    setMoves(move);
    setBoard(tempBoard);
    setPlayer(player === "X" ? "O" : "X");
  }

  return (
    <div
      className="boardGame"
      style={{ gridTemplateColumns: `repeat(${size},1fr)` }}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <div
            onClick={() => handleOnClickCell(i, j)}
            className="cell"
            key={`${i},${j}`}
          >
            {cell}
          </div>
        ))
      )}
    </div>
  );
}

export default BoardGame;
