"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Bookmark, Heart, Clock } from "lucide-react";

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export default function BookmarksPage() {
  const bookmarks = useQuery(api.bookmarks.getMyBookmarks);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  return (
    <div className="-m-6 md:-m-10">
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-500 md:rounded-3xl md:mx-10 md:mt-10 px-6 md:px-10 py-8 relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <Bookmark size={110} className="text-white" />
        </div>
        <div className="relative max-w-md">
          <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
          <p className="text-emerald-100 text-sm mt-2">
            Jobs you've bookmarked to apply to later.
          </p>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-10 pt-6 space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">Bookmarked</h2>
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
            {bookmarks?.length ?? 0}
          </span>
        </div>

        {bookmarks?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bookmark size={22} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-4">
              No saved jobs yet.
            </p>
            <Link
              href="/freelancer/jobs"
              className="text-emerald-600 text-sm font-semibold hover:underline"
            >
              + Browse jobs
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookmarks?.map((job, i) => (
            <BookmarkCard
              key={job._id}
              job={job}
              colorIndex={i}
              onRemove={() => toggleBookmark({ jobId: job._id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BookmarkCard({ job, colorIndex, onRemove }) {
  const initials = job.title
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const daysAgo = Math.floor(
    (Date.now() - job._creationTime) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center font-semibold text-sm shrink-0`}
          >
            {initials || "JB"}
          </div>
          <div className="min-w-0">
            <Link href={`/freelancer/jobs/${job._id}`}>
              <h3 className="font-semibold text-gray-900 text-sm truncate hover:text-emerald-700">
                {job.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-400 truncate">{job.category}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 transition shrink-0"
        >
          <Heart size={18} className="fill-red-500" />
        </button>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
        {job.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="font-bold text-gray-900 text-sm">
            ${job.budgetMin ?? "?"}–${job.budgetMax ?? "?"}
          </p>
          <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <Clock size={11} />
            Posted {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
          </p>
        </div>
        <Link
          href={`/freelancer/jobs/${job._id}`}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          View Job
        </Link>
      </div>
    </div>
  );
}