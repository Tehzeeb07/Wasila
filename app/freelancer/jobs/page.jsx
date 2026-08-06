"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const allJobs = useQuery(api.jobs.listOpenJobs);
  const searchResults = useQuery(
    api.jobs.searchJobs,
    search ? { searchTerm: search } : "skip"
  );
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  const jobs = search ? searchResults : allJobs;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Find Jobs</h1>
      <p className="text-gray-500 mb-6">
        Browse open opportunities matching your skills.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search jobs by title..."
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />

      {jobs === undefined && (
        <p className="text-gray-500">Loading jobs...</p>
      )}

      {jobs?.length === 0 && (
        <p className="text-gray-500">No jobs found.</p>
      )}

      <div className="space-y-4">
        {jobs?.map((job) => (
          <div
            key={job._id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <Link href={`/freelancer/jobs/${job._id}`}>
                  <h2 className="text-lg font-semibold text-gray-900 hover:text-emerald-700">
                    {job.title}
                  </h2>
                </Link>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-emerald-700 font-semibold text-sm">
                  ${job.budgetMin ?? "?"} - ${job.budgetMax ?? "?"}
                </p>
                <button
                  onClick={() => toggleBookmark({ jobId: job._id })}
                  className="text-xs text-gray-500 hover:text-emerald-700 mt-2"
                >
                  🔖 Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}