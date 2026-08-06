import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import StatusStamp from '../components/StatusStamp'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [jobId])

  async function load() {
    setLoading(true)
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError) {
      setError(jobError.message)
      setLoading(false)
      return
    }
    setJob(jobData)

    const { data: proposalData } = await supabase
      .from('proposals')
      .select('*, profiles:freelancer_id (full_name, email)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    setProposals(proposalData || [])
    setLoading(false)
  }

  // Accepting a proposal: mark it accepted, reject the rest, move the job
  // into "in_progress" and remember which proposal won.
  async function handleAccept(proposal) {
    if (!confirm(`Accept ${proposal.profiles?.full_name || 'this freelancer'}'s proposal? This will move the job into progress and reject other pending proposals.`)) return
    setActingOn(proposal.id)
    setError('')

    const { error: acceptError } = await supabase
      .from('proposals')
      .update({ status: 'accepted' })
      .eq('id', proposal.id)

    if (acceptError) {
      setError(acceptError.message)
      setActingOn(null)
      return
    }

    await supabase
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('job_id', jobId)
      .neq('id', proposal.id)
      .eq('status', 'pending')

    const { error: jobError } = await supabase
      .from('jobs')
      .update({ status: 'in_progress', accepted_proposal_id: proposal.id })
      .eq('id', jobId)

    setActingOn(null)
    if (jobError) {
      setError(jobError.message)
    } else {
      navigate(`/projects/${jobId}`)
    }
  }

  async function handleReject(proposal) {
    setActingOn(proposal.id)
    await supabase.from('proposals').update({ status: 'rejected' }).eq('id', proposal.id)
    setActingOn(null)
    load()
  }

  if (loading) return <p className="text-sm text-ink/50 font-mono">Loading…</p>
  if (error && !job) return <p className="text-sm text-stamp-cancelled">{error}</p>

  return (
    <div>
      <Link to="/jobs" className="text-xs font-mono uppercase tracking-widest text-ink/50 hover:text-ink">
        ← Back to job postings
      </Link>

      <div className="flex items-start justify-between mt-4 mb-2">
        <h1 className="font-display text-3xl font-semibold">{job.title}</h1>
        <StatusStamp status={job.status} />
      </div>
      <p className="text-sm text-ink/50 font-mono mb-6">
        {job.category ? `${job.category} · ` : ''}
        {job.budget_type === 'fixed' ? 'Fixed' : 'Hourly'}
        {job.budget_min || job.budget_max ? ` · $${job.budget_min ?? '?'}–$${job.budget_max ?? '?'}` : ''}
        {job.deadline ? ` · Due ${new Date(job.deadline).toLocaleDateString()}` : ''}
      </p>

      <div className="card p-6 mb-8">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {job.skills.map((s) => (
              <span key={s} className="text-xs font-mono px-2 py-1 border border-rule rounded-sm text-ink/60">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {job.status === 'in_progress' || job.status === 'completed' || job.status === 'cancelled' ? (
        <div className="card p-6">
          <p className="text-sm text-ink/60 mb-3">
            This job already has an assigned freelancer. Manage it from the Projects tab.
          </p>
          <Link to={`/projects/${job.id}`} className="btn-primary">Go to project</Link>
        </div>
      ) : (
        <>
          <h2 className="font-display text-xl font-semibold mb-4">
            Proposals {proposals.length > 0 && `(${proposals.length})`}
          </h2>

          {error && <p className="text-sm text-stamp-cancelled mb-3">{error}</p>}

          {proposals.length === 0 ? (
            <div className="card p-8 text-center text-ink/60">
              No proposals yet. Freelancers will appear here once they apply.
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((p) => (
                <div key={p.id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{p.profiles?.full_name || 'Freelancer'}</p>
                      <p className="text-xs text-ink/50 font-mono">{p.profiles?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-semibold">${p.proposed_rate}</p>
                      {p.estimated_days && (
                        <p className="text-xs text-ink/50 font-mono">{p.estimated_days} days</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-ink/80 whitespace-pre-wrap mb-4">{p.cover_letter}</p>

                  {p.status === 'pending' ? (
                    <div className="flex gap-3">
                      <button
                        className="btn-primary"
                        disabled={actingOn === p.id}
                        onClick={() => handleAccept(p)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-danger"
                        disabled={actingOn === p.id}
                        onClick={() => handleReject(p)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`stamp ${p.status === 'accepted' ? 'stamp-open' : 'stamp-cancelled'}`}>
                      {p.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
