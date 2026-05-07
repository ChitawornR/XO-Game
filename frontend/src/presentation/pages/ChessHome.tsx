import { useNavigate, Link } from 'react-router-dom'
import '../styles/ChessHome.css'

/**
 * ChessHome — mode selector for the chess game.
 *
 * Routes to /chess/play with { isSinglePlayer: boolean } in location.state.
 * Sub-Agent 1 handles the router wiring (this page is not linked from main.tsx by us).
 */
function ChessHome() {
  const navigate = useNavigate()

  function handleSinglePlayer() {
    navigate('/chess/play', { state: { isSinglePlayer: true } })
  }

  function handleMultiPlayer() {
    navigate('/chess/play', { state: { isSinglePlayer: false } })
  }

  return (
    <div className="container">
      <div className="chessHomeWrap">
        {/* Header */}
        <h1 className="chessHomeTitle">
          <span className="chessHomePiece" aria-hidden>♟</span>
          Chess
        </h1>
        <p className="chessHomeSubtitle">International Chess</p>

        <div className="chessHomeDivider" />

        {/* Mode label */}
        <span className="chessHomeModeLabel">Select game mode</span>

        {/* Mode buttons */}
        <div className="chessModeBtns">
          <button className="singlePlayer" onClick={handleSinglePlayer}>
            vs Bot
          </button>
          <button className="multiPlayer" onClick={handleMultiPlayer}>
            Local Multiplayer
          </button>
        </div>

        {/* Back to hub */}
        <div className="chessHomeBack">
          <Link to="/">← Back to Hub</Link>
        </div>
      </div>
    </div>
  )
}

export default ChessHome
