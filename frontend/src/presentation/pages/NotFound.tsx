import { useNavigate } from 'react-router-dom'
import '../styles/NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="notFoundPage">
      <span className="notFoundCode">404</span>
      <h2>Page Not Found</h2>
      <p className="notFoundDesc">
        The page you are looking for does not exist or has been moved.
      </p>
      <button className="notFoundBtn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  )
}

export default NotFound
