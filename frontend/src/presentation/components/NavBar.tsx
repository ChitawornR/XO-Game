import { NavLink, useNavigate } from 'react-router-dom'
import { IoNewspaperOutline } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import '../styles/NavBar.css'
import '../styles/Auth.css'

type Props = {
  onOpenRules: () => void
}

function NavBar({ onOpenRules }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="navBar">
      <h1>XO-Game</h1>
      <ul className="navUl">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        {user && (
          <li>
            <NavLink to="/replay">Replay</NavLink>
          </li>
        )}
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <div className="navUser">
            <span>{user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <NavLink to="/login">
            <button>Login</button>
          </NavLink>
        )}
        <button onClick={onOpenRules} className="btnWithIcon">
          <IoNewspaperOutline fontSize={20} />
          Rules
        </button>
      </div>
    </div>
  )
}

export default NavBar
