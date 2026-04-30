import React, { createContext, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { HttpReplayApi } from './infrastructure/api/HttpReplayApi'
import { HttpAuthApi } from './infrastructure/api/HttpAuthApi'
import { env } from './infrastructure/config/env'
import { AuthProvider, useAuth } from './presentation/context/AuthContext'
import { RulesPopup } from './presentation/components/Popup'
import NavBar from './presentation/components/NavBar'
import Home from './presentation/pages/Home'
import Play from './presentation/pages/Play'
import Replay from './presentation/pages/Replay'
import ReplayDetail from './presentation/pages/ReplayDetail'
import Login from './presentation/pages/Login'
import Register from './presentation/pages/Register'
import OnlineRoom from './presentation/pages/OnlineRoom'
import NotFound from './presentation/pages/NotFound'
import type { ReplayApi } from './application/ports/ReplayApi'
import './presentation/styles/App.css'

// ---------------------------------------------------------------------------
// Composition root
// ---------------------------------------------------------------------------

const authApi = new HttpAuthApi(env.apiUrl)
const replayApi = new HttpReplayApi(env.apiUrl, () => authApi.getToken())

export const ReplayApiContext = createContext<ReplayApi | null>(replayApi)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const [rulesOpen, setRulesOpen] = useState(false)

  return (
    <ReplayApiContext.Provider value={replayApi}>
      <NavBar onOpenRules={() => setRulesOpen(true)} />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route index path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/play" element={<ProtectedRoute><Play /></ProtectedRoute>} />
          <Route path="/replay" element={<ProtectedRoute><Replay /></ProtectedRoute>} />
          <Route path="/replay/:id" element={<ProtectedRoute><ReplayDetail /></ProtectedRoute>} />
          <Route path="/online" element={<ProtectedRoute><OnlineRoom /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <RulesPopup open={rulesOpen} onClose={() => setRulesOpen(false)} />
      </div>
    </ReplayApiContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider api={authApi}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
