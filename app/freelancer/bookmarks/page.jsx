"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function BookmarksPage() {
  const bookmarks = useQuery(api.bookmarks.getMyBookmarks);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Saved Jobs</h1>
      <p className="text-gray-500 mb-6">Jobs you've bookmarked for later.</p>

      {bookmarks?.length === 0 && (
        <p className="text-gray-500">No saved jobs yet.</p>
      )}

      <div className="space-y-4">
        {bookmarks?.map((job) => (
          <div
            key={job._id}
            className="bg-white border border-gray-200 rounded-xl p-6 flex justify-between items-center"
          >
            <Link href={`/freelancer/jobs/${job._id}`}>
              <h2 className="font-semibold text-gray-900 hover:text-emerald-700">
                {job.title}
              </h2>
            </Link>
            <button
              onClick={() => toggleBookmark({ jobId: job._id })}
              className="text-xs text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}