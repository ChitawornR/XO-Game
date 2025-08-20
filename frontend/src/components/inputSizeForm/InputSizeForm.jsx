import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InputSizeForm.css";
import { FaUser,FaUserFriends } from "react-icons/fa";

function InputsizeForm() {
  const navigate = useNavigate();
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);

  // set default to null because if default is number 0 placeholder not show
  const [size, setSize] = useState(null); 

  function handleSubmit(e) {
    // if size = null or less than 3 stop working
    if(!size || size < 3) {
      alert('size must not null and more than 3')
      return
    } 
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
          setSize(parseInt(e.target.value));
        }}
      />
      <div className="btnBottomForm">
        <button
        className="btnWithIcon"
          onClick={() => setIsSinglePlayer(true)}
          type="submit"
          style={{ backgroundColor: "red" }}
        >
          <FaUser fontSize={15}/>Single player
        </button>
        <button className="btnWithIcon" type="submit" style={{ backgroundColor: "blue" }}>
          <FaUserFriends fontSize={20}/> Multi player
        </button>
      </div>
    </form>
  );
}

export default InputsizeForm;
