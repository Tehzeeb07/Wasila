"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const ALL_STATUSES = ["IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function MessagesInboxPage() {
  const projects = useQuery(api.jobs.listMineByStatuses, { statuses: ALL_STATUSES });
  const loading = projects === undefined;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Messages</p>
      <h1 className="text-3xl font-semibold mb-6">Conversations</h1>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Conversations open up once a project starts — accept a proposal to begin one.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((job) => (
            <Link
              key={job._id}
              href={`/client/projects/${job._id}`}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <p className="font-medium">{job.title}</p>
              <span className="text-xs text-gray-400">Open thread →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
