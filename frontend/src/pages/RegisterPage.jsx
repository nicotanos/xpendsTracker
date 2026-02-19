import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function RegisterPage({ onSwitch }) {
  const { register, login } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      await login(form.username, form.password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">xpendsTracker</h1>
        <p className="auth-sub">Create your account</p>

        {error && <p className="auth-error">{error}</p>}

        <label>
          Username
          <input name="username" value={form.username} onChange={handleChange} required autoFocus />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  )
}
