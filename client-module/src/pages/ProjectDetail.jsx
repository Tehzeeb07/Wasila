import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import StatusStamp from '../components/StatusStamp'

export default function ProjectDetail() {
  const { projectId } = useParams() // this is the job id
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [freelancer, setFreelancer] = useState(null)
  const [rate, setRate] = useState(null)
  const [updates, setUpdates] = useState([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [projectId])

  async function load() {
    setLoading(true)
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*, proposals:accepted_proposal_id (proposed_rate, estimated_days, freelancer_id, profiles:freelancer_id (full_name, email))')
      .eq('id', projectId)
      .single()

    if (jobError) {
      setError(jobError.message)
      setLoading(false)
      return
    }
    setJob(jobData)
    setFreelancer(jobData.proposals?.profiles || null)
    setRate(jobData.proposals?.proposed_rate ?? null)

    const { data: updateRows } = await supabase
      .from('project_updates')
      .select('*, profiles:author_id (full_name)')
      .eq('job_id', projectId)
      .order('created_at', { ascending: false })
    setUpdates(updateRows || [])

    setLoading(false)
  }

  async function updateStatus(status) {
    setBusy(true)
    setError('')
    const { error } = await supabase.from('jobs').update({ status }).eq('id', projectId)
    setBusy(false)
    if (error) setError(error.message)
    else load()
  }

  async function handlePostUpdate(e) {
    e.preventDefault()
    if (!note.trim()) return
    setBusy(true)
    const { error } = await supabase.from('project_updates').insert({
      job_id: projectId,
      author_id: user.id,
      note: note.trim(),
    })
    setBusy(false)
    if (error) {
      setError(error.message)
    } else {
      setNote('')
      load()
    }
  }

  if (loading) return <p className="text-sm text-ink/50 font-mono">Loading…</p>
  if (!job) return <p className="text-sm text-stamp-cancelled">{error || 'Project not found.'}</p>

  const isActive = job.status === 'in_progress'

  return (
    <div className="max-w-2xl">
      <Link to="/projects" className="text-xs font-mono uppercase tracking-widest text-ink/50 hover:text-ink">
        ← Back to projects
      </Link>

      <div className="flex items-start justify-between mt-4 mb-1">
        <h1 className="font-display text-3xl font-semibold">{job.title}</h1>
        <StatusStamp status={job.status} />
      </div>
      <p className="text-sm text-ink/50 font-mono mb-6">
        {freelancer ? `With ${freelancer.full_name} (${freelancer.email})` : 'Freelancer assigned'}
        {rate ? ` · $${rate}` : ''}
      </p>

      {isActive && (
        <div className="card p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Update project status</p>
            <p className="text-xs text-ink/50">Mark the project complete once delivered, or cancel it if it falls through.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" disabled={busy} onClick={() => updateStatus('completed')}>
              Mark completed
            </button>
            <button className="btn-danger" disabled={busy} onClick={() => updateStatus('cancelled')}>
              Cancel project
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-stamp-cancelled mb-4">{error}</p>}

      <h2 className="font-display text-xl font-semibold mb-3">Project log</h2>

      {isActive && (
        <form onSubmit={handlePostUpdate} className="card p-4 mb-4 flex gap-3">
          <input
            className="input"
            placeholder="Post a status note (e.g. milestone reached, feedback given)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="btn-secondary shrink-0" disabled={busy} type="submit">
            Post
          </button>
        </form>
      )}

      {updates.length === 0 ? (
        <div className="card p-6 text-center text-ink/60 text-sm">No updates logged yet.</div>
      ) : (
        <div className="space-y-2">
          {updates.map((u) => (
            <div key={u.id} className="card p-4">
              <p className="text-sm">{u.note}</p>
              <p className="text-xs text-ink/40 font-mono mt-1">
                {u.profiles?.full_name || 'Someone'} · {new Date(u.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
