"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatusBadge from "@/components/client/StatusBadge";

const FILTERS = [
  ["all", "All"],
  ["OPEN", "Open"],
  ["IN_PROGRESS", "In Progress"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
];

export default function ClientJobsPage() {
  const jobs = useQuery(api.jobs.listMine);
  const removeJob = useMutation(api.jobs.remove);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  async function handleDelete(jobId) {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      await removeJob({ jobId });
    } catch (err) {
      setError(err.message);
    }
  }

  const loading = jobs === undefined;
  const visible = loading ? [] : filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Job Posting</p>
          <h1 className="text-3xl font-semibold">Your job postings</h1>
        </div>
        <Link
          href="/client/post-job"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Post a job
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === key ? "bg-blue-600 text-white" : "text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No jobs in this category yet.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => (
            <div key={job._id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <Link href={`/client/jobs/${job._id}`} className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {job.budgetMin || job.budgetMax ? `$${job.budgetMin ?? "?"}–$${job.budgetMax ?? "?"} · ` : ""}
                  Posted {new Date(job._creationTime).toLocaleDateString()}
                </p>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={job.status} />
                {job.status === "OPEN" && (
                  <Link
                    href={`/client/post-job?jobId=${job._id}`}
                    className="text-sm uppercase tracking-widest text-green-200 hover:text-white"
                  >
                    Edit
                  </Link>
                )}
                {job.status === "OPEN" && (
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="text-sm uppercase tracking-widest text-green-200 hover:text-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
