import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InputSizeForm.css";

function InputsizeForm() {
  const navigate = useNavigate();
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [size, setSize] = useState(0);

  function handleSubmit(e) {
    e.preventDefault();
    const state = {
      isSinglePlayer,
      size,
    };
    navigate("/play", { state: state });
  }

  return (
    <form onSubmit={handleSubmit} className="inputSizeForm">
      <label htmlFor="inputSize">Input board size</label>
      <input
        placeholder="Ex: 3 or 5"
        min={3}
        type="number"
        id="inputSize"
        value={size}
        onChange={(e) => {
          setSize(Number(e.target.value));
        }}
      />
      <div className="btnBottomForm">
        <button
          onClick={() => setIsSinglePlayer(true)}
          type="submit"
          style={{ backgroundColor: "red" }}
        >
          Single player
        </button>
        <button type="submit" style={{ backgroundColor: "blue" }}>
          Multi player
        </button>
      </div>
    </form>
  );
}

export default InputsizeForm;
