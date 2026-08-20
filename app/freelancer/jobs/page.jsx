"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Search, Heart, Clock } from "lucide-react";
import { parseSmartSearch } from "@/lib/parseSearch";

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [maxBudget, setMaxBudget] = useState(1000);

  const allJobs = useQuery(api.jobs.listOpenJobs);
  const searchResults = useQuery(
    api.jobs.searchJobs,
    search ? { searchTerm: search } : "skip"
  );
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  const baseJobs = search ? searchResults : allJobs;

  const categories = useMemo(() => {
    if (!allJobs) return ["All"];
    const set = new Set(allJobs.map((j) => j.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [allJobs]);

  const parsed = useMemo(() => parseSmartSearch(search), [search]);

  const jobs = useMemo(() => {
    if (!baseJobs) return baseJobs;
    return baseJobs.filter((j) => {
      const matchesCategory = category === "All" || j.category === category;
      const matchesBudget = (j.budgetMax ?? 0) <= maxBudget || !j.budgetMax;
      const matchesMaxBudget =
        !parsed.maxBudget || (j.budgetMax ?? Infinity) <= parsed.maxBudget;
      const matchesMinBudget =
        !parsed.minBudget || (j.budgetMin ?? 0) >= parsed.minBudget;
      return matchesCategory && matchesBudget && matchesMaxBudget && matchesMinBudget;
    });
  }, [baseJobs, category, maxBudget, parsed]);

  return (
    <div className="space-y-6 -m-6 md:-m-10">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 rounded-b-3xl md:rounded-3xl md:mx-10 mt-0 md:mt-10 px-6 md:px-10 py-10 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-emerald-500/30 rounded-full blur-2xl" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl" />
        <h1 className="text-2xl md:text-3xl font-bold text-white relative">
          Find Your Next Project ✨
        </h1>
        <p className="text-emerald-100 text-sm mt-2 relative">
          Browse open opportunities matching your skills.
        </p>

        <div className="bg-white rounded-2xl p-2 mt-6 flex items-center gap-2 relative shadow-lg max-w-2xl">
          <Search size={18} className="text-gray-400 ml-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Try: React developer under $50..."
            className="flex-1 text-sm focus:outline-none py-2.5"
          />
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition">
            Search
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                Category
              </h3>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                      category === c
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                Max Budget
              </h3>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>$0</span>
                <span className="font-semibold text-emerald-700">
                  up to ${maxBudget}
                </span>
              </div>
            </div>
          </aside>

          {/* Job cards */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  Open Jobs
                </h2>
                {jobs && (
                  <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {jobs.length}
                  </span>
                )}
              </div>
            </div>

            {jobs === undefined && (
              <p className="text-gray-400 text-sm">Loading jobs...</p>
            )}

            {jobs?.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <p className="text-gray-400 text-sm">
                  No jobs match your filters.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {jobs?.map((job, i) => (
                <JobCard
                  key={job._id}
                  job={job}
                  colorIndex={i}
                  onBookmark={toggleBookmark}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, colorIndex, onBookmark }) {
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
          onClick={() => onBookmark({ jobId: job._id })}
          className="text-gray-300 hover:text-red-500 transition shrink-0"
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.skills?.slice(0, 3).map((skill, i) => (
          <span
            key={i}
            className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2.5 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
        {job.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="font-bold text-gray-900 text-sm">
            ${job.budgetMin ?? "?"}
            <span className="text-gray-400 font-normal">
              /${job.budgetMax ?? "?"}
            </span>
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
          Apply Now
        </Link>
      </div>
    </div>
  );
}