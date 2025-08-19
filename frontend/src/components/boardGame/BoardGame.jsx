import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./BoardGame.css";
import { RiResetLeftFill } from "react-icons/ri";

function BoardGame() {
  const location = useLocation();
  const { isSinglePlayer, size } = location.state; // isSinglePlayer and size from homePage
  const steak = size === 3 ? 3 : 4;

  //  create metrix board size*size content ''
  const emptyBoard = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));

  const [board, setBoard] = useState(emptyBoard);
  const [player, setPlayer] = useState("X");
  const [moves, setMoves] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const win = findWinner(board);
    if (win) {
      setWinner(win);
    } else if (isBoardFull()) {
      // if no winner and board full
      const id = setTimeout(async () => {
        alert("Draw! No winner.");
        await sendReplayToServer(null);
        resetBoard();
      }, 200);
      return () => clearTimeout(id);
    }
  }, [board]);

  useEffect(() => {
    /* 
      this useEffect create for wait board set last player to cell
      if have winner then alert message and set zero
    */
    if (!winner) return;
    const id = setTimeout(async () => {
      alert(`Winner is ${winner}`);
      await sendReplayToServer(winner);
      resetBoard();
    }, 200);
    return () => clearTimeout(id);
  }, [winner]);

  async function sendReplayToServer(winner) {
    try {
      // set port same as .env in backend folder
      await fetch("http://localhost:8081/replay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size,
          winner,
          moves,
          isSinglePlayer,
        }),
      });
      console.log("already save to database..."); // boolean
    } catch (error) {
      console.error("Failed to save replay:", error);
    }
  }

  function findWinner(currentBoard) {
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

  function findBotMove(currentBoard) {
    /* 
      chek if bot will win
      logic is find '' and add 'O' 
      if bot win return {row,col}
    */
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (currentBoard[row][col] === "") {
          const botBoard = currentBoard.map((r, i) =>
            r.map((c, j) => {
              if (i === row && j === col) {
                return "O";
              }
              return c; //cell
            })
          );
          const botWin = findWinner(botBoard);
          if (botWin) return { row, col };
        }
      }
    }

    /* 
      check if player win bot will
      return position ({rol,col})
      and block player
    */
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (currentBoard[row][col] === "") {
          const predicBoard = currentBoard.map((r, i) =>
            r.map((c, j) => {
              if (i === row && j === col) {
                return "X";
              }
              return c; //cell
            })
          );
          const playerWin = findWinner(predicBoard);
          if (playerWin) return { row, col };
        }
      }
    }

    /* 
      logic is find all cell that ''
      if board have cell that ''
      return random {row,col} of cell
    */
    const emptyCell = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (currentBoard[row][col] === "") {
          emptyCell.push({ row, col });
        }
      }
    }
    if (emptyCell.length > 0) {
      const index = Math.floor(Math.random() * emptyCell.length);
      return emptyCell[index];
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
    let move = [...moves, { row, col, player }]; // to copy old move and add new move into array
    // set
    setMoves(move);
    setBoard(tempBoard);
    setPlayer(player === "X" ? "O" : "X");

    if (isSinglePlayer) {
      const winAfterPlayer = findWinner(tempBoard);
      if (winAfterPlayer) return; // return if have a winner for bot not work
      const botMove = findBotMove(tempBoard); // return {row,col}
      if (!botMove) {
        // No need to call setBoard again because we already did setBoard(tempBoard) above
        // useEffect will catch the draw case and reset the board for us
        return;
      }
      setTimeout(() => {
        const botBoard = tempBoard.map((row, i) =>
          row.map((cell, j) => {
            if (i === botMove.row && j === botMove.col) {
              return "O";
            }
            return cell;
          })
        );
        move = [...move, { row: botMove.row, col: botMove.col, player: "O" }];
        setMoves(move);
        setBoard(botBoard);
        setPlayer("X");
      }, 300);
    }
  }

  function resetBoard() {
    setBoard(emptyBoard);
    setMoves([]);
    setPlayer("X");
    setWinner(null);
  }

  function isBoardFull() {
    let count = 0;
    board.map((row) => row.map((cell) => (cell === "" ? count++ : count)));
    return count > 0 ? false : true;
  }

  return (
    <>
      <div style={{ overflowX: "auto" }}>
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
      </div>
      <button onClick={() => resetBoard()} className="resetBtn">
        <RiResetLeftFill fontSize={20}/>Reset board
      </button>
    </>
  );
}

export default BoardGame;
