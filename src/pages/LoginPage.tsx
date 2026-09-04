import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup' && password.length < 6) {
      setError('密码至少需要 6 个字符')
      return
    }
    setLoading(true)

    if (mode === 'login') {
      const result = await signIn(email, password)
      if (result.error) {
        setError('登录失败，请检查邮箱和密码')
      } else {
        navigate('/dashboard')
      }
    } else {
      const result = await signUp(email, password, username)
      if (result.error) {
        setError('注册失败，请重试')
      } else {
        setMode('login')
        setPassword('')
        setError('')
        alert('注册成功！请使用新账号登录')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-extrabold text-2xl">BQ</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">🧠 BrainQuest</h1>
          <p className="text-gray-500 mt-1">Reflex Engine · 阅读训练</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="给自己起个名字"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : mode === 'login' ? '登录' : '创建账号并开始训练'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              还没有账号？{' '}
              <button onClick={() => switchMode('signup')} className="text-primary font-semibold hover:underline">
                立即注册，免费试用
              </button>
            </>
          ) : (
            <>
              已有账号？{' '}
              <button onClick={() => switchMode('login')} className="text-primary font-semibold hover:underline">
                直接登录
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
