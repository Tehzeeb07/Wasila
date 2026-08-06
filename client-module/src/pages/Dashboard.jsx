import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import StatusStamp from '../components/StatusStamp'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      const { data: jobRows } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setJobs(jobRows || [])

      const jobIds = (jobRows || []).map((j) => j.id)
      if (jobIds.length) {
        const { count } = await supabase
          .from('proposals')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .eq('status', 'pending')
        setPendingCount(count || 0)
      }
      setLoading(false)
    })()
  }, [user])

  const counts = jobs.reduce(
    (acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1
      return acc
    },
    { open: 0, in_progress: 0, completed: 0, cancelled: 0 }
  )

  return (
    <div>
      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/40 mb-1">
        Overview
      </p>
      <h1 className="font-display text-3xl font-semibold mb-8">
        Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          ['open', 'Open'],
          ['in_progress', 'In Progress'],
          ['completed', 'Completed'],
          ['cancelled', 'Cancelled'],
        ].map(([key, label]) => (
          <div key={key} className="card p-5">
            <p className="font-display text-3xl font-semibold">{counts[key]}</p>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-mono mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Recent job postings</h2>
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <span className="text-sm text-stamp-progress font-medium">
              {pendingCount} proposal{pendingCount !== 1 ? 's' : ''} awaiting review
            </span>
          )}
          <Link to="/jobs/new" className="btn-primary">Post a job</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50 font-mono">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink/60">You haven't posted any jobs yet.</p>
          <Link to="/jobs/new" className="btn-primary mt-4 inline-flex">Post your first job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.slice(0, 5).map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="card p-4 flex items-center justify-between hover:border-ink/30 transition-colors"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-ink/50 font-mono mt-0.5">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
              <StatusStamp status={job.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
