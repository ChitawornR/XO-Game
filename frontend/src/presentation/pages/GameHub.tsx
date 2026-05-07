import { useNavigate } from 'react-router-dom'
import { FaChess } from 'react-icons/fa'
import '../styles/GameHub.css'

function GameHub() {
  const navigate = useNavigate()

  return (
    <section className="gameHub">
      <header className="gameHub__header">
        <h2 className="gameHub__title">Game Hub</h2>
        <p className="gameHub__subtitle">// choose your game and start playing</p>
      </header>

      <div className="gameHub__grid">
        {/* XO Game card */}
        <div
          className="gameCard gameCard--xo"
          onClick={() => navigate('/xo')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/xo')}
          aria-label="Play XO Game"
        >
          <div className="gameCard__icon">
            <span className="gameCard__xoMark">XO</span>
          </div>

          <div className="gameCard__body">
            <span className="gameCard__name">XO Game</span>
            <p className="gameCard__desc">
              Classic Tic-Tac-Toe on any board size. Play solo against a bot,
              locally with a friend, or challenge others online.
            </p>
          </div>

          <button
            className="gameCard__cta"
            onClick={(e) => {
              e.stopPropagation()
              navigate('/xo')
            }}
            type="button"
          >
            Play XO
          </button>
        </div>

        {/* Chess card */}
        <div
          className="gameCard gameCard--chess"
          onClick={() => navigate('/chess')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/chess')}
          aria-label="Play Chess"
        >
          <div className="gameCard__icon">
            <FaChess />
          </div>

          <div className="gameCard__body">
            <span className="gameCard__name">Chess</span>
            <p className="gameCard__desc">
              The timeless strategy game. Play against an AI or go head-to-head
              with another player on a full 8×8 board.
            </p>
          </div>

          <button
            className="gameCard__cta"
            onClick={(e) => {
              e.stopPropagation()
              navigate('/chess')
            }}
            type="button"
          >
            Play Chess
          </button>
        </div>
      </div>
    </section>
  )
}

export default GameHub
