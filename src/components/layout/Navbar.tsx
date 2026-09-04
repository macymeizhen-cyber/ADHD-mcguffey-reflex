import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BQ</span>
          </div>
          <span className="font-extrabold text-lg text-text">BrainQuest</span>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`text-sm font-semibold transition-colors ${
                isActive('/dashboard') ? 'text-primary' : 'text-text-muted hover:text-text'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/lessons"
              className={`text-sm font-semibold transition-colors ${
                isActive('/lessons') ? 'text-primary' : 'text-text-muted hover:text-text'
              }`}
            >
              Lessons
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xs">
                  {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <span className="text-sm font-medium text-text-muted hidden sm:block">
                {profile?.username || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-xs font-semibold text-text-muted hover:text-danger transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
