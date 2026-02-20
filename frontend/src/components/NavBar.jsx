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
        <button
          className={`nav-link ${view === 'categories' ? 'active' : ''}`}
          onClick={() => setView(view === 'categories' ? 'app' : 'categories')}
        >
          Categories
        </button>
        <button
          className={`nav-link ${view === 'persons' ? 'active' : ''}`}
          onClick={() => setView(view === 'persons' ? 'app' : 'persons')}
        >
          Persons
        </button>
        {user?.is_admin && (
          <button
            className={`nav-link ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView(view === 'admin' ? 'app' : 'admin')}
          >
            Admin
          </button>
        )}
        <button
          className={`nav-link ${view === 'profile' ? 'active' : ''}`}
          onClick={() => setView(view === 'profile' ? 'app' : 'profile')}
        >
          {user?.username}
        </button>
        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
