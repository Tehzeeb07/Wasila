# Client Module — Freelancer Marketplace

React + Vite + Tailwind + Supabase. This is the **client-side** of the group
project: company profiles, job postings, proposal review, and project
management/status tracking.

## What's included

| Feature | Where |
|---|---|
| Client company profile (create/edit) | `src/pages/CompanyProfile.jsx` |
| Job posting (create/edit/delete/list, filter by status) | `src/pages/PostJob.jsx`, `src/pages/MyJobs.jsx` |
| Proposal review, accept/reject | `src/pages/JobDetail.jsx` |
| Project management (assigned freelancer, status log) | `src/pages/ProjectDetail.jsx` |
| Project status tracking (open/in_progress/completed/cancelled) | `src/components/StatusStamp.jsx`, `src/pages/Projects.jsx` |
| Dashboard / overview | `src/pages/Dashboard.jsx` |

**Note on auth:** `Login.jsx` / `Signup.jsx` are here so you can run and demo
this module standalone. If your team already has a shared login screen from
the admin/freelancer modules, swap those two pages out — everything else
(`AuthContext`, `ProtectedRoute`) will keep working as long as `profiles.role
= 'client'` for client accounts.

## How job → project lifecycle works

Rather than two separate tables, a job posting *is* the project — it just
moves through statuses:

1. Client posts a job → `status = 'open'`
2. Freelancers submit `proposals` against it
3. Client accepts a proposal (in `JobDetail.jsx`):
   - that proposal → `accepted`
   - other pending proposals on the job → auto-`rejected`
   - job → `status = 'in_progress'`, `accepted_proposal_id` set
4. The job now shows up under **Projects**, where the client can post
   log updates (`project_updates` table) and mark it `completed` or
   `cancelled`.

## Setup

1. **Database.** In your team's Supabase project, open the SQL editor and
   run `supabase/schema.sql`. It's written with `if not exists` / `drop
   policy if exists` guards so it's safe to run even if a teammate already
   created the shared `profiles` table — it just adds what's missing.

2. **Env vars.**
   ```bash
   cp .env.example .env
   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from
   # Supabase → Project Settings → API
   ```

3. **Install & run.**
   ```bash
   npm install
   npm run dev
   ```

4. **Try it out.** Go to `/signup`, create a client account, fill in your
   company profile, then post a job. To test the proposal flow end-to-end
   you'll need a freelancer account + a row in `proposals` — either from
   your teammate's freelancer module, or inserted manually in Supabase's
   table editor for now:

   ```sql
   insert into proposals (job_id, freelancer_id, cover_letter, proposed_rate, estimated_days)
   values ('<job-id>', '<some-other-user-id>', 'I can start Monday.', 500, 7);
   ```

## Integrating with the rest of the team

- **Shared tables:** `profiles` is meant to be shared by all three modules.
  If a teammate already created it with different column names, adjust the
  `profiles` inserts in `AuthContext.jsx` to match, or coordinate on one
  schema before running the SQL.
- **Routing:** this app currently owns the whole router (`/`, `/jobs`,
  `/projects`, …). If the three modules get merged into one app with
  role-based routing, lift these routes under a `/client/*` prefix and
  reuse `ProtectedRoute` to also check `profile.role === 'client'`.
- **Freelancer module hookup:** freelancers need to (a) browse `jobs` where
  `status = 'open'` and (b) insert into `proposals`. The RLS policies in
  `schema.sql` already allow both, so no changes needed on this side once
  that module points at the same tables.

## Design notes

Palette and type live in `tailwind.config.js`. Status is always shown as a
"stamp" (`.stamp` classes in `src/index.css`) — a small inked, slightly
rotated badge, playing on the idea of a contract being approved/stamped as
it moves through open → in progress → completed/cancelled. Reuse
`<StatusStamp status={job.status} />` anywhere else in the app you show job
or project status, so it stays consistent.
