import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUpClient } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signUpClient({ email, password, fullName })
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/40 mb-1">
          Freelancer Marketplace
        </p>
        <h1 className="font-display text-2xl font-semibold mb-6">Create a client account</h1>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Your name</label>
            <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-stamp-cancelled">{error}</p>}
          <button className="btn-primary w-full" disabled={busy} type="submit">
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-ledger-700 font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
