import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import StatusStamp from '../components/StatusStamp'

const FILTERS = [
  ['all', 'All'],
  ['in_progress', 'In Progress'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
]

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('jobs')
        .select('*, proposals:accepted_proposal_id (proposed_rate, profiles:freelancer_id (full_name, email))')
        .eq('client_id', user.id)
        .in('status', ['in_progress', 'completed', 'cancelled'])
        .order('updated_at', { ascending: false })
      setProjects(data || [])
      setLoading(false)
    })()
  }, [user])

  const visible = filter === 'all' ? projects : projects.filter((p) => p.status === filter)

  return (
    <div>
      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/40 mb-1">
        Project Management
      </p>
      <h1 className="font-display text-3xl font-semibold mb-6">Active & past projects</h1>

      <div className="flex gap-2 mb-6">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-sm text-sm font-mono uppercase tracking-wider ${
              filter === key ? 'bg-ledger-700 text-paper' : 'text-ink/60 border border-rule hover:border-ink/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink/50 font-mono">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="card p-8 text-center text-ink/60">
          No projects here yet. Projects appear once you accept a proposal on a job.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card p-4 flex items-center justify-between hover:border-ink/30 transition-colors"
            >
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="text-xs text-ink/50 font-mono mt-0.5">
                  {project.proposals?.profiles?.full_name
                    ? `With ${project.proposals.profiles.full_name}`
                    : 'Freelancer assigned'}
                  {project.proposals?.proposed_rate ? ` · $${project.proposals.proposed_rate}` : ''}
                </p>
              </div>
              <StatusStamp status={project.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
