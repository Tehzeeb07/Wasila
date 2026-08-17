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

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design (UI/UX)",
  "Writing & Translation",
  "Marketing",
  "Data & Analytics",
  "Video & Animation",
  "Other",
];

// Basic sanity checks — not a substitute for real moderation, but enough to
// stop empty/placeholder-style submissions like "Chinese" / "BlahBlah".
function validate(form) {
  const errors = {};

  const title = form.title.trim();
  if (title.length < 8) {
    errors.title = "Title should be at least 8 characters and describe the actual work.";
  }

  const description = form.description.trim();
  const wordCount = description.split(/\s+/).filter(Boolean).length;
  if (description.length < 40 || wordCount < 8) {
    errors.description = "Description should be a real sentence or two — at least 8 words.";
  }

  if (!form.category) {
    errors.category = "Pick a category.";
  }

  const min = form.budgetMin ? Number(form.budgetMin) : null;
  const max = form.budgetMax ? Number(form.budgetMax) : null;
  if (min !== null && min < 0) errors.budgetMin = "Can't be negative.";
  if (max !== null && max < 0) errors.budgetMax = "Can't be negative.";
  if (min !== null && max !== null && max < min) {
    errors.budgetMax = "Max budget can't be lower than min budget.";
  }

  return errors;
}

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
  const [fieldErrors, setFieldErrors] = useState({});

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
    setError("");

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);

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
            className={`w-full border rounded-md px-3 py-2 text-sm ${fieldErrors.title ? "border-red-400" : "border-gray-300"}`}
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Build a landing page in React"
          />
          {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Description</label>
          <textarea
            className={`w-full border rounded-md px-3 py-2 text-sm min-h-[140px] ${fieldErrors.description ? "border-red-400" : "border-gray-300"}`}
            required
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Scope, deliverables, and what success looks like."
          />
          {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Category</label>
            <select
              className={`w-full border rounded-md px-3 py-2 text-sm ${fieldErrors.category ? "border-red-400" : "border-gray-300"}`}
              required
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {fieldErrors.category && <p className="text-xs text-red-600 mt-1">{fieldErrors.category}</p>}
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
              className={`w-full border rounded-md px-3 py-2 text-sm ${fieldErrors.budgetMin ? "border-red-400" : "border-gray-300"}`}
              value={form.budgetMin || ""}
              onChange={(e) => update("budgetMin", e.target.value)}
            />
            {fieldErrors.budgetMin && <p className="text-xs text-red-600 mt-1">{fieldErrors.budgetMin}</p>}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Max budget ($)</label>
            <input
              type="number"
              min="0"
              className={`w-full border rounded-md px-3 py-2 text-sm ${fieldErrors.budgetMax ? "border-red-400" : "border-gray-300"}`}
              value={form.budgetMax || ""}
              onChange={(e) => update("budgetMax", e.target.value)}
            />
            {fieldErrors.budgetMax && <p className="text-xs text-red-600 mt-1">{fieldErrors.budgetMax}</p>}
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