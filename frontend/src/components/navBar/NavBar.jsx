import React from "react";
import "./NavBar.css";
import { NavLink } from "react-router-dom";

function NavBar({setPopupRules}) {

  return (
    <div className="navBar">
      <h1>XO-Game</h1>
      <ul className="navUl">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/replay">Replay</NavLink>
        </li>
      </ul>
      <button onClick={()=> setPopupRules(true)}>Rules</button>
    </div>
  );
}

export default NavBar;
