"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatusBadge from "@/components/client/StatusBadge";

export default function ClientDashboardPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const jobs = useQuery(api.jobs.listMine);
  const pending = useQuery(api.proposals.listPendingForClient);

  const loading = jobs === undefined;

  const counts = (jobs || []).reduce(
    (acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1;
      return acc;
    },
    { OPEN: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 }
  );

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Overview</p>
      <h1 className="text-3xl font-semibold mb-8">
        Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          ["OPEN", "Open"],
          ["IN_PROGRESS", "In Progress"],
          ["COMPLETED", "Completed"],
          ["CANCELLED", "Cancelled"],
        ].map(([key, label]) => (
          <div key={key} className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-3xl font-semibold">{counts[key]}</p>
            <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent job postings</h2>
        <div className="flex items-center gap-4">
          {!!pending?.length && (
            <Link href="/client/proposals" className="text-sm text-amber-600 font-medium">
              {pending.length} proposal{pending.length !== 1 ? "s" : ""} awaiting review
            </Link>
          )}
          <Link
            href="/client/post-job"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Post a job
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">You haven't posted any jobs yet.</p>
          <Link
            href="/client/post-job"
            className="inline-block mt-4 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.slice(0, 5).map((job) => (
            <Link
              key={job._id}
              href={`/client/jobs/${job._id}`}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Posted {new Date(job._creationTime).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
