import { Link } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg glow-primary">
            <span className="text-white font-extrabold text-2xl">BQ</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text">BrainQuest</h1>
          <p className="text-sm text-text-muted mt-1">Start your reading journey</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-text mb-4">Create Account</h2>
          <SignupForm />
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
