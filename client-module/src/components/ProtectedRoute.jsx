import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-ink/50">
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <Layout>{children}</Layout>
}
