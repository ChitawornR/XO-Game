import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaUserFriends } from 'react-icons/fa'
import '../styles/InputSizeForm.css'

function InputSizeForm() {
  const navigate = useNavigate()
  const [isSinglePlayer, setIsSinglePlayer] = useState(false)
  const [size, setSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!size || size < 3) {
      setError('Board size must be at least 3.')
      return
    }
    setError(null)
    navigate('/play', { state: { isSinglePlayer, size } })
  }

  return (
    <form onSubmit={handleSubmit} className="inputSizeForm">
      <label htmlFor="inputSize">Input board size</label>
      <input
        placeholder="Ex: 3 or 5"
        min={3}
        type="number"
        id="inputSize"
        value={size ?? ''}
        onChange={(e) => setSize(e.target.value === '' ? null : parseInt(e.target.value, 10))}
      />
      {error && <p className="formError">{error}</p>}
      <div className="btnBottomForm">
        <button
          className="btnWithIcon singlePlayer"
          onClick={() => setIsSinglePlayer(true)}
          type="submit"
        >
          <FaUser fontSize={14} />
          Single player
        </button>
        <button
          className="btnWithIcon multiPlayer"
          onClick={() => setIsSinglePlayer(false)}
          type="submit"
        >
          <FaUserFriends fontSize={18} />
          Multi player
        </button>
      </div>
    </form>
  )
}

export default InputSizeForm
