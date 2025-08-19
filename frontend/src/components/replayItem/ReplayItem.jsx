import React from "react";
import "./ReplayItem.css";

function ReplayItem({ replay }) {
  const formattedDateTH = new Date(replay.createdAt).toLocaleString(
    "th-TH-u-ca-gregory"
  );

  return (
    <div
      className="replay"
      style={{ backgroundColor: replay.isSinglePlayer ? "pink" : "white" }}
    >
      <div className="replayInner">
        <div className="replayInfo">
          <b>Date: </b> {formattedDateTH} <br />
          <b>Winner: </b> {replay.winner ? replay.winner : "Draw"} <br />
          <b>Board Size: </b> {replay.size}
          <br />
          <b>Step: </b> {replay.moves.length}
          <br />
          <b>Mode: </b>{" "}
          {replay.isSinglePlayer ? "Single player" : "Multi player"}
          <br />
        </div>
        <div className="manageBtn">
          <button>View detail</button>
          <button style={{ backgroundColor: "red", color: "white" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReplayItem;
