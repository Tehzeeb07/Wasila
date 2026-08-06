import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  title: '',
  description: '',
  category: '',
  skills: '',
  budget_type: 'fixed',
  budget_min: '',
  budget_max: '',
  deadline: '',
}

export default function PostJob() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { jobId } = useParams() // present when editing an existing job
  const isEditing = Boolean(jobId)

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return
    ;(async () => {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single()
      if (error) {
        setError(error.message)
      } else {
        setForm({ ...data, skills: (data.skills || []).join(', ') })
      }
      setLoading(false)
    })()
  }, [jobId, isEditing])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category || null,
      skills: form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      budget_type: form.budget_type,
      budget_min: form.budget_min || null,
      budget_max: form.budget_max || null,
      deadline: form.deadline || null,
    }

    let result
    if (isEditing) {
      result = await supabase.from('jobs').update(payload).eq('id', jobId)
    } else {
      result = await supabase.from('jobs').insert({
        ...payload,
        client_id: user.id,
        status: 'open',
      })
    }

    setSaving(false)
    if (result.error) {
      setError(result.error.message)
    } else {
      navigate('/jobs')
    }
  }

  if (loading) return <p className="text-sm text-ink/50 font-mono">Loading…</p>

  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/40 mb-1">
        Job Posting
      </p>
      <h1 className="font-display text-3xl font-semibold mb-8">
        {isEditing ? 'Edit job posting' : 'Post a new job'}
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Build a landing page in React" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[140px]" required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Scope, deliverables, and what success looks like." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category || ''} onChange={(e) => update('category', e.target.value)} placeholder="e.g. Web Development" />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadline || ''} onChange={(e) => update('deadline', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Skills required (comma separated)</label>
          <input className="input" value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="React, Tailwind, Supabase" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Budget type</label>
            <select className="input" value={form.budget_type} onChange={(e) => update('budget_type', e.target.value)}>
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label className="label">Min budget ($)</label>
            <input className="input" type="number" min="0" value={form.budget_min || ''} onChange={(e) => update('budget_min', e.target.value)} />
          </div>
          <div>
            <label className="label">Max budget ($)</label>
            <input className="input" type="number" min="0" value={form.budget_max || ''} onChange={(e) => update('budget_max', e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-stamp-cancelled">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Post job'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
