import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaRegTrashAlt } from 'react-icons/fa'
import type { ReplayRecord } from '../../application/ports/ReplayApi'
import { ReplayApiContext } from '../../main'
import '../styles/Replay.css'

function Replay() {
  const api = useContext(ReplayApiContext)
  const navigate = useNavigate()
  const [replays, setReplays] = useState<ReplayRecord[]>([])

  useEffect(() => {
    if (!api) return
    api
      .list()
      .then(setReplays)
      .catch((err: unknown) => console.error('Failed to load replays:', err))
  }, [api])

  async function handleDelete(id: string) {
    if (!api) return
    const ok = window.confirm('Delete this replay?')
    if (!ok) return
    try {
      await api.delete(id)
      setReplays((prev) => prev.filter((r) => r._id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  if (replays.length === 0) return <p style={{ textAlign: 'center', marginTop: 40 }}>No replays yet.</p>

  return (
    <>
      {replays.map((replay) => {
        const date = new Date(replay.createdAt).toLocaleString('th-TH-u-ca-gregory')
        return (
          <div
            key={replay._id}
            className="replay"
            style={{ backgroundColor: replay.isSinglePlayer ? 'pink' : '#fff5bd' }}
          >
            <div className="replayInner">
              <div className="replayInfo">
                <b>Date: </b> {date} <br />
                <b>Winner: </b> {replay.winner ?? 'Draw'} <br />
                <b>Board Size: </b> {replay.size} <br />
                <b>Steps: </b> {replay.moves.length} <br />
                <b>Mode: </b> {replay.isSinglePlayer ? 'Single player' : 'Multi player'}
              </div>
              <div className="manageBtn">
                <button onClick={() => navigate(`/replay/${replay._id}`, { state: replay })}>
                  View detail
                </button>
                <button
                  className="btnWithIcon"
                  onClick={() => handleDelete(replay._id)}
                  style={{ backgroundColor: 'red', color: 'white' }}
                >
                  <FaRegTrashAlt fontSize={17} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default Replay
