import { NavLink } from 'react-router-dom'
import { IoNewspaperOutline } from 'react-icons/io5'
import '../styles/NavBar.css'

type Props = {
  onOpenRules: () => void
}

function NavBar({ onOpenRules }: Props) {
  return (
    <div className="navBar">
      <h1>XO-Game</h1>
      <ul className="navUl">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/replay">Replay</NavLink>
        </li>
      </ul>
      <button onClick={onOpenRules} className="btnWithIcon">
        <IoNewspaperOutline fontSize={20} />
        Rules
      </button>
    </div>
  )
}

export default NavBar
