import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiShieldCheck } from 'react-icons/hi'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <HiShieldCheck className="w-12 h-12 text-gs-teal mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-gs-text-muted mt-1">Sign in to your GigShield account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-gs-danger/10 border border-gs-danger/30 rounded-lg text-sm text-gs-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          <div>
            <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Email</label>
            <input type="email" required className="gs-input" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Password</label>
            <input type="password" required className="gs-input" placeholder="Your password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full gs-btn-primary !py-3" id="login-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gs-text-muted mt-6">
          Don't have an account? <Link to="/register" className="text-gs-teal hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
