import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function SignupForm() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const result = await signUp(email, password, username)
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          placeholder="Choose a username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          placeholder="At least 6 characters"
          required
        />
      </div>
      {error && (
        <div className="text-danger text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
