import React, { createContext, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HttpReplayApi } from './infrastructure/api/HttpReplayApi'
import { env } from './infrastructure/config/env'
import { RulesPopup } from './presentation/components/Popup'
import NavBar from './presentation/components/NavBar'
import Home from './presentation/pages/Home'
import Play from './presentation/pages/Play'
import Replay from './presentation/pages/Replay'
import ReplayDetail from './presentation/pages/ReplayDetail'
import type { ReplayApi } from './application/ports/ReplayApi'
import './presentation/styles/App.css'

// ---------------------------------------------------------------------------
// Composition root: instantiate infrastructure and expose via Context
// ---------------------------------------------------------------------------

const replayApi = new HttpReplayApi(env.apiUrl)

export const ReplayApiContext = createContext<ReplayApi | null>(replayApi)

function App() {
  const [rulesOpen, setRulesOpen] = useState(false)

  return (
    <ReplayApiContext.Provider value={replayApi}>
      <NavBar onOpenRules={() => setRulesOpen(true)} />
      <div className="container">
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/replay" element={<Replay />} />
          <Route path="/replay/:id" element={<ReplayDetail />} />
        </Routes>
        <RulesPopup open={rulesOpen} onClose={() => setRulesOpen(false)} />
      </div>
    </ReplayApiContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
