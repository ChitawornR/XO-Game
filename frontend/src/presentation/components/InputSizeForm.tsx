import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaUserFriends, FaGlobe } from 'react-icons/fa'
import type { Difficulty } from '../../domain/services/bots'
import '../styles/InputSizeForm.css'

function InputSizeForm() {
  const navigate = useNavigate()
  const [size, setSize] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [error, setError] = useState<string | null>(null)

  function start(mode: 'single' | 'multi' | 'online') {
    return (e: React.FormEvent) => {
      e.preventDefault()
      if (mode === 'online') {
        setError(null)
        navigate('/online')
        return
      }
      if (!size || size < 3) {
        setError('Board size must be at least 3.')
        return
      }
      setError(null)
      navigate('/play', { state: { isSinglePlayer: mode === 'single', size, difficulty } })
    }
  }

  return (
    <form className="inputSizeForm" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="inputSize">Input board size</label>
      <input
        placeholder="Ex: 3 or 5"
        min={3}
        type="number"
        id="inputSize"
        value={size ?? ''}
        onChange={(e) =>
          setSize(e.target.value === '' ? null : parseInt(e.target.value, 10))
        }
      />

      <label className="difficultyLabel">Bot difficulty (single-player only)</label>
      <div className="difficultyGroup" role="radiogroup" aria-label="Bot difficulty">
        <button
          type="button"
          role="radio"
          aria-checked={difficulty === 'easy'}
          className={difficulty === 'easy' ? 'difficultyChip active' : 'difficultyChip'}
          onClick={() => setDifficulty('easy')}
        >
          Easy
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={difficulty === 'hard'}
          className={difficulty === 'hard' ? 'difficultyChip active' : 'difficultyChip'}
          onClick={() => setDifficulty('hard')}
        >
          Hard
        </button>
      </div>

      {error && <p className="formError">{error}</p>}

      <div className="btnBottomForm">
        <button type="button" className="btnWithIcon singlePlayer" onClick={start('single')}>
          <FaUser fontSize={14} />
          Single player
        </button>
        <button type="button" className="btnWithIcon multiPlayer" onClick={start('multi')}>
          <FaUserFriends fontSize={18} />
          Local multi
        </button>
        <button type="button" className="btnWithIcon onlinePlayer" onClick={start('online')}>
          <FaGlobe fontSize={14} />
          Online
        </button>
      </div>
    </form>
  )
}

export default InputSizeForm
