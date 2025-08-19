import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Replay from "./pages/Replay";
import NavBar from "./components/navBar/NavBar";
import ReplayDetail from "./pages/ReplayDetail";
import "./App.css";
import Popup from "./components/popup/Popup";

function App() {
  const [popupRules, setPopupRules] = useState(false);

  return (
    <div>
      <NavBar setPopupRules={setPopupRules} />
      <div className="container">
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/replay" element={<Replay />} />
          <Route path="/replay/:id" element={<ReplayDetail />} />
        </Routes>

        {/* popup rules */}
        <Popup popupRules={popupRules} setPopupRules={setPopupRules}/>
      </div>
    </div>
  );
}

export default App;
