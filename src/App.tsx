import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import { useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LessonsPage from './pages/LessonsPage'
import LessonPage from './pages/LessonPage'

function AppLayout() {
  const { user, localMode } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && window.location.hash.replace('#', '').startsWith('/login')) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  if (!user && !localMode) return <LoginPage />

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/*"
            element={<AppLayout />}
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
