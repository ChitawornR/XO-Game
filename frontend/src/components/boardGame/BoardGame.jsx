import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./BoardGame.css";

function BoardGame() {
  const location = useLocation();
  const { isSinglePlayer, size } = location.state; // isSinglePlayer and size from homePage

  //  create metrix board size*size content ''
  const emptyBoard = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));

  const [board, setBoard] = useState(emptyBoard);
  const [player, setPlayer] = useState("X");
  const [moves, setMoves] = useState([]);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    const win = findWinner(board, size === 3 ? 3 : 4);
    if (win) {
      setWinner(win);
    }
  }, [board]);

  useEffect(() => {
    /* 
      this useEffect create for wait board set last player to cell
      if winner then alert message and set zero
    */
    if (!winner) return;
    const id = setTimeout(() => {
      alert(`Winner is ${winner}`);
      setBoard(emptyBoard);
      setMoves([]);
      setPlayer("X");
      setWinner("");
    }, 200);
    return () => clearTimeout(id);
  }, [winner]);

  function findWinner(currentBoard, steak) {
    /* 
    this function is return winner 
    value is null,X or O
  */
    // check row
    for (let row = 0; row < size; row++) {
      for (let col = 0; col <= size - steak; col++) {
        let temp = [];
        for (let i = 0; i < steak; i++) {
          temp.push(currentBoard[row][col + i]);
        }
        if (temp.every((cell) => cell === temp[0] && cell != "")) {
          return temp[0];
        }
      }
    }

    // check col
    for (let col = 0; col < size; col++) {
      for (let row = 0; row <= size - steak; row++) {
        let temp = [];
        for (let i = 0; i < steak; i++) {
          temp.push(currentBoard[row + i][col]);
        }
        if (temp.every((cell) => cell === temp[0] && cell != "")) {
          return temp[0];
        }
      }
    }

    // Diagonal right to left
    for (let row = 0; row <= size - steak; row++) {
      for (let col = 0; col <= size - steak; col++) {
        let temp = [];
        for (let i = 0; i < steak; i++) {
          temp.push(currentBoard[row + i][col + i]);
        }
        if (temp.every((cell) => cell == temp[0] && cell !== "")) {
          return temp[0];
        }
      }
    }

    // Diagonal left to right
    for (let row = 0; row <= size - steak; row++) {
      for (let col = size - 1; col >= size - steak; col--) {
        let temp = [];
        for (let i = 0; i < steak; i++) {
          temp.push(currentBoard[row + i][col - i]);
        }
        if (temp.every((cell) => cell == temp[0] && cell !== "")) {
          return temp[0];
        }
      }
    }

    return null;
  }

  function handleOnClickCell(row, col) {
    if (board[row][col] !== "" || winner) return;
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
    <>
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
    </>
  );
}

export default BoardGame;
