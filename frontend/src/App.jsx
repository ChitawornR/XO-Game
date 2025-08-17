import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Replay from "./pages/Replay";
import NavBar from "./components/NavBar/NavBar";
import ReplayDetail from "./pages/ReplayDetail";
import './App.css'

function App() {
  return (
    <div>
      <NavBar />
      <div className="container">
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/replay" element={<Replay />} />
          <Route path="/replay/:id" element={<ReplayDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
