import React from "react";
import "./ReplayItem.css";
import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";

function ReplayItem({ replay,onDeleted }) {
  const navigate = useNavigate();

  function handleOnClickViewDetail() {
    navigate(`/replay/${replay._id}`, { state: replay });
  }

  async function handleDelete() {
    const ok = window.confirm("Delete this replay?");
    if (!ok) return;

    try {
        // set port same as the .env in backend
      const res = await fetch(`http://localhost:8081/replay/${replay._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onDeleted(replay._id);
    } catch (e) {
      console.error(e);
      alert("Failed to delete replay");
    }
  }

  const formattedDateTH = new Date(replay.createdAt).toLocaleString(
    "th-TH-u-ca-gregory"
  );

  return (
    <div
      className="replay"
      style={{ backgroundColor: replay.isSinglePlayer ? "pink" : "#fff5bd" }}
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
          <button onClick={() => handleOnClickViewDetail()}>View detail</button>
          <button className="btnWithIcon" onClick={handleDelete} style={{ backgroundColor: "red", color: "white" }}>
            <FaRegTrashAlt fontSize={17}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReplayItem;
