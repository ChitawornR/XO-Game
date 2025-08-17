import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Replay from "./pages/Replay";

function App() {
  return (
    <div>
      <div>App</div>
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/replay/:id" element={<Replay />} />
      </Routes>
    </div>
  );
}

export default App;
