import React from "react";
import "./Popup.css";

function Popup({ popupRules, setPopupRules }) {
  return (
    popupRules && (
      <div className="popup">
        <div className="popupInner">
          <button style={{backgroundColor:'red',color:'white'}} className="closeBtn" onClick={() => setPopupRules(false)}>
            Close
          </button>
          {/* start content */}
          <h2>Rules</h2>
          <ol>
            <li>
              <strong>
                The first player is always <code>X</code>
              </strong>
              , then turns alternate: <code>O</code> → <code>X</code> →{" "}
              <code>O</code> ...
            </li>
            <li>
              <strong>Game Modes</strong>
              <ul>
                <li>
                  <em>Single Player</em>: The player competes against a bot. The
                  system will automatically switch turns.
                </li>
                <li>
                  <em>MultiPlayer</em>: Two players take turns on the same
                  device.
                </li>
              </ul>
            </li>
            <li>
              <strong>Winning Condition</strong>: Line up <code>3</code> of your
              symbols in a row horizontally, vertically, or diagonally.
              <br />
              But if the <strong>board size is larger than 3×3</strong>, you
              need <code>4</code> in a row to win.
            </li>
            <li>
              <strong>Moves</strong>: You can only place in empty cells. You
              cannot place on an already occupied cell.
            </li>
            <li>
              <strong>Draw</strong>: If the board is full and no one wins, the
              game ends in a draw.
            </li>
            <li>
              <strong>Reset/Restart</strong>: You can restart the game at any
              time.
            </li>
          </ol>
          {/* end content */}
        </div>
      </div>
    )
  );
}

export default Popup;
