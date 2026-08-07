"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatusBadge from "@/components/client/StatusBadge";

const FILTERS = [
  ["all", "All"],
  ["IN_PROGRESS", "In Progress"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
];

const ALL_STATUSES = ["IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function ClientProjectsPage() {
  const [filter, setFilter] = useState("all");
  const jobs = useQuery(api.jobs.listMineByStatuses, { statuses: ALL_STATUSES });

  const loading = jobs === undefined;
  const visible = loading ? [] : filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Project Management</p>
      <h1 className="text-3xl font-semibold mb-6">Active & past projects</h1>

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

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No projects here yet. Projects appear once you accept a proposal on a job.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => (
            <Link
              key={job._id}
              href={`/client/projects/${job._id}`}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <p className="font-medium">{job.title}</p>
              <StatusBadge status={job.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
