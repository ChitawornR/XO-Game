import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaRegTrashAlt } from 'react-icons/fa'
import type { ReplayRecord } from '../../application/ports/ReplayApi'
import { loadReplays } from '../../application/use-cases/LoadReplays'
import { ReplayApiContext } from '../../main'
import '../styles/Replay.css'

function Replay() {
  const api = useContext(ReplayApiContext)
  const navigate = useNavigate()
  const [replays, setReplays] = useState<ReplayRecord[]>([])

  useEffect(() => {
    if (!api) return
    loadReplays(api)
      .then(setReplays)
      .catch((err: unknown) => console.error('Failed to load replays:', err))
  }, [api])

  async function handleDelete(id: string) {
    if (!api) return
    const ok = window.confirm('Delete this replay?')
    if (!ok) return
    try {
      await api.delete(id)
      setReplays((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  if (replays.length === 0)
    return <p className="replayEmpty">// no replays yet</p>

  return (
    <div className="replayList">
      {replays.map((replay) => {
        const date = new Date(replay.createdAt).toLocaleString('th-TH-u-ca-gregory')
        const modeClass = replay.isSinglePlayer ? 'single' : 'multi'
        return (
          <div key={replay.id} className={`replay ${modeClass}`}>
            <div className="replayInner">
              <div className="replayInfo">
                <div>
                  <span className="label">Date</span>
                  <span className="value">{date}</span>
                </div>
                <div>
                  <span className="label">Winner</span>
                  <span className="value">{replay.winner ?? 'Draw'}</span>
                </div>
                <div>
                  <span className="label">Board size</span>
                  <span className="value">
                    {replay.size}×{replay.size}
                  </span>
                </div>
                <div>
                  <span className="label">Steps</span>
                  <span className="value">{replay.moves.length}</span>
                </div>
                <div>
                  <span className="label">Mode</span>
                  <span className="value modeBadge">
                    {replay.isSinglePlayer ? 'Single player' : 'Multi player'}
                  </span>
                </div>
              </div>
              <div className="manageBtn">
                <button onClick={() => navigate(`/replay/${replay.id}`, { state: replay })}>
                  View detail
                </button>
                <button
                  className="btnWithIcon delete"
                  onClick={() => handleDelete(replay.id)}
                  aria-label="Delete replay"
                >
                  <FaRegTrashAlt fontSize={15} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Replay
