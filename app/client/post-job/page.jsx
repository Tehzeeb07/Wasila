"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const EMPTY = {
  title: "",
  description: "",
  category: "",
  tags: "",
  skills: "",
  budgetMin: "",
  budgetMax: "",
};

function PostJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const isEditing = Boolean(jobId);

  const existingJob = useQuery(api.jobs.get, isEditing ? { jobId } : "skip");
  const createJob = useMutation(api.jobs.create);
  const updateJob = useMutation(api.jobs.update);

  const [form, setForm] = useState(EMPTY);
  const [hydrated, setHydrated] = useState(!isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing && existingJob !== undefined && !hydrated) {
      if (existingJob) {
        setForm({
          ...existingJob,
          tags: (existingJob.tags || []).join(", "),
          skills: (existingJob.skills || []).join(", "),
        });
      }
      setHydrated(true);
    }
  }, [existingJob, isEditing, hydrated]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
    };

    try {
      if (isEditing) {
        await updateJob({ jobId, ...payload });
      } else {
        await createJob(payload);
      }
      router.push("/client/jobs");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Job Posting</p>
      <h1 className="text-3xl font-semibold mb-8">{isEditing ? "Edit job posting" : "Post a new job"}</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Title</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Build a landing page in React"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[140px]"
            required
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Scope, deliverables, and what success looks like."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Category</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. Web Development"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
              Tags (comma separated)
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="urgent, long-term"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
            Skills required (comma separated)
          </label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="React, Tailwind, Convex"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Min budget ($)</label>
            <input
              type="number"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={form.budgetMin || ""}
              onChange={(e) => update("budgetMin", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Max budget ($)</label>
            <input
              type="number"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={form.budgetMax || ""}
              onChange={(e) => update("budgetMax", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Post job"}
          </button>
          <button
            type="button"
            className="border border-gray-300 text-sm font-medium px-4 py-2 rounded-md hover:border-gray-400"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// useSearchParams() needs a Suspense boundary around it in the App Router.
export default function PostJobPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
      <PostJobForm />
    </Suspense>
  );
}
