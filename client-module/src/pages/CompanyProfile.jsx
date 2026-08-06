import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  company_name: '',
  industry: '',
  company_size: '',
  website: '',
  location: '',
  about: '',
  logo_url: '',
}

export default function CompanyProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (data) setForm(data)
      setLoading(false)
    })()
  }, [user])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('client_profiles').upsert({
      id: user.id,
      ...form,
    })
    setSaving(false)
    setMessage(error ? error.message : 'Company profile saved.')
  }

  if (loading) return <p className="text-sm text-ink/50 font-mono">Loading…</p>

  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/40 mb-1">
        Client Account
      </p>
      <h1 className="font-display text-3xl font-semibold mb-8">Company profile</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Company name</label>
          <input className="input" required value={form.company_name} onChange={(e) => update('company_name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Industry</label>
            <input className="input" value={form.industry || ''} onChange={(e) => update('industry', e.target.value)} placeholder="e.g. FinTech" />
          </div>
          <div>
            <label className="label">Company size</label>
            <select className="input" value={form.company_size || ''} onChange={(e) => update('company_size', e.target.value)}>
              <option value="">Select…</option>
              <option value="1-10">1–10</option>
              <option value="11-50">11–50</option>
              <option value="51-200">51–200</option>
              <option value="200+">200+</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://" />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location || ''} onChange={(e) => update('location', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Logo URL</label>
          <input className="input" value={form.logo_url || ''} onChange={(e) => update('logo_url', e.target.value)} placeholder="https://" />
        </div>

        <div>
          <label className="label">About the company</label>
          <textarea className="input min-h-[120px]" value={form.about || ''} onChange={(e) => update('about', e.target.value)} placeholder="What does your company do? What kind of freelancers do you usually hire?" />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {message && <span className="text-sm text-ink/60">{message}</span>}
        </div>
      </form>
    </div>
  )
}
