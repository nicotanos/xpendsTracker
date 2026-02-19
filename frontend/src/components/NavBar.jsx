import { useAuth } from '../context/AuthContext'
import './NavBar.css'

export default function NavBar({ view, setView }) {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => setView('app')}>
        xpendsTracker
      </span>
      <div className="navbar-right">
        {user?.is_admin && (
          <button
            className={`nav-link ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView(view === 'admin' ? 'app' : 'admin')}
          >
            Admin
          </button>
        )}
        <span className="navbar-user">{user?.username}</span>
        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
