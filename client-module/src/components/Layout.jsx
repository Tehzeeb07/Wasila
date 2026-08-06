import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/profile', label: 'Company Profile' },
  { to: '/jobs', label: 'Job Postings' },
  { to: '/projects', label: 'Projects' },
]

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-rule bg-white/40 flex flex-col">
        <div className="px-6 py-6 border-b border-rule">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/40">
            Freelancer Marketplace
          </p>
          <h1 className="font-display text-xl font-semibold mt-1">Client Portal</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ledger-700 text-paper'
                    : 'text-ink/70 hover:bg-ledger-50 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-rule">
          <p className="text-sm font-medium truncate">{profile?.full_name || 'Loading…'}</p>
          <p className="text-xs text-ink/50 truncate mb-3">{profile?.email}</p>
          <button onClick={handleSignOut} className="text-xs font-mono uppercase tracking-widest text-ink/50 hover:text-stamp-cancelled">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-8 max-w-5xl">{children}</main>
    </div>
  )
}
