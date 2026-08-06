import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import StatusStamp from '../components/StatusStamp'

const FILTERS = [
  ['all', 'All'],
  ['open', 'Open'],
  ['in_progress', 'In Progress'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
]

export default function MyJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchJobs()
  }, [user])

  async function fetchJobs() {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function handleDelete(jobId) {
    if (!confirm('Delete this job posting? This cannot be undone.')) return
    await supabase.from('jobs').delete().eq('id', jobId)
    fetchJobs()
  }

  const visible = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/40 mb-1">
            Job Posting
          </p>
          <h1 className="font-display text-3xl font-semibold">Your job postings</h1>
        </div>
        <Link to="/jobs/new" className="btn-primary">Post a job</Link>
      </div>

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
        <div className="card p-8 text-center text-ink/60">No jobs in this category yet.</div>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => (
            <div key={job.id} className="card p-4 flex items-center justify-between">
              <Link to={`/jobs/${job.id}`} className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.title}</p>
                <p className="text-xs text-ink/50 font-mono mt-0.5">
                  {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
                  {job.budget_min || job.budget_max
                    ? ` · $${job.budget_min ?? '?'}–$${job.budget_max ?? '?'}`
                    : ''}
                  {' · '}Posted {new Date(job.created_at).toLocaleDateString()}
                </p>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <StatusStamp status={job.status} />
                {job.status === 'open' && (
                  <Link to={`/jobs/${job.id}/edit`} className="text-xs font-mono uppercase tracking-widest text-ink/50 hover:text-ink">
                    Edit
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-xs font-mono uppercase tracking-widest text-ink/50 hover:text-stamp-cancelled"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
