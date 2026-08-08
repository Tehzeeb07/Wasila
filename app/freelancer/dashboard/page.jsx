"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { SkeletonGrid } from "@/components/Skeleton";

export default function DashboardPage() {
  const profile = useQuery(api.freelancerProfiles.getMyProfile);
  const proposals = useQuery(api.proposals.getMyProposals);
  const bookmarks = useQuery(api.bookmarks.getMyBookmarks);
  const reviews = useQuery(api.reviews.getMyReviews);
  const allJobs = useQuery(api.jobs.listOpenJobs);

  const isLoading =
    profile === undefined ||
    proposals === undefined ||
    bookmarks === undefined ||
    reviews === undefined;

  const totalProposals = proposals?.length ?? 0;
  const accepted = proposals?.filter((p) => p.status === "ACCEPTED") ?? [];
  const pending = proposals?.filter((p) => p.status === "PENDING").length ?? 0;
  const responded = proposals?.filter((p) => p.status !== "PENDING").length ?? 0;

  const responseRate =
    totalProposals > 0
      ? Math.round((accepted.length / totalProposals) * 100)
      : 0;

  const estimatedEarnings = accepted.reduce((sum, p) => sum + (p.bidAmount || 0), 0);

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const chartData = buildMonthlyChart(proposals);

  const profileFields = [
    profile?.headline,
    profile?.bio,
    profile?.hourlyRate,
    profile?.skills?.length,
    profile?.resumeFileId,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  const recommendedJobs = (allJobs ?? []).filter((job) => {
    if (!profile?.skills?.length) return false;
    return job.skills?.some((s) =>
      profile.skills.some((ps) => ps.toLowerCase() === s.toLowerCase())
    );
  }).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your freelance work today.
          </p>
        </div>
        <Link
          href="/freelancer/jobs"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shrink-0"
        >
          Browse Jobs →
        </Link>
      </div>

      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Proposals" value={totalProposals} accent="text-gray-900" />
          <StatCard label="Accepted" value={accepted.length} accent="text-emerald-600" />
          <StatCard
            label="Est. Earnings"
            value={`$${estimatedEarnings.toLocaleString()}`}
            accent="text-emerald-600"
          />
          <StatCard label="Response Rate" value={`${responseRate}%`} accent="text-blue-600" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Proposal Activity</h2>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          {chartData.every((d) => d.count === 0) ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              No proposal activity yet — apply to jobs to see your trend here.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: "#059669" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
          <h2 className="font-semibold text-gray-900 mb-4">Profile Strength</h2>
          <div className="flex items-center justify-center flex-1">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                <circle
                  cx="64" cy="64" r="56" stroke="#059669" strokeWidth="12" fill="none"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - profileCompletion / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{profileCompletion}%</span>
              </div>
            </div>
          </div>
          <Link href="/freelancer/profile" className="text-emerald-600 text-sm font-medium text-center mt-4 hover:underline">
            Complete your profile →
          </Link>
        </div>
      </div>

      {/* Recommended jobs */}
      {recommendedJobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recommended for You</h2>
            <Link href="/freelancer/jobs" className="text-xs text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => (
              <Link
                key={job._id}
                href={`/freelancer/jobs/${job._id}`}
                className="border border-gray-100 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title}</h3>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  ${job.budgetMin ?? "?"}–${job.budgetMax ?? "?"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.skills?.slice(0, 2).map((s, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Proposals</h2>
            <Link href="/freelancer/proposals" className="text-xs text-emerald-600 hover:underline">
              View all
            </Link>
          </div>
          {!proposals || proposals.length === 0 ? (
            <p className="text-gray-400 text-sm">No proposals yet.</p>
          ) : (
            <div className="space-y-3">
              {proposals.slice(0, 5).map((p) => (
                <div key={p._id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 truncate">{p.coverLetter}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Bid: ${p.bidAmount}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Quick Summary</h2>
          <SummaryRow label="Saved Jobs" value={bookmarks?.length ?? 0} href="/freelancer/bookmarks" />
          <SummaryRow label="Avg. Rating" value={avgRating} href="/freelancer/reviews" />
          <SummaryRow label="Pending Proposals" value={pending} href="/freelancer/proposals" />
          <SummaryRow
            label="Hourly Rate"
            value={profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : "Not set"}
            href="/freelancer/profile"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, href }) {
  return (
    <Link href={href} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </Link>
  );
}

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-50 text-yellow-700",
    ACCEPTED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ml-3 ${colors[status]}`}>
      {status}
    </span>
  );
}

function buildMonthlyChart(proposals) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("default", { month: "short" }), count: 0 });
  }
  proposals?.forEach((p) => {
    const d = new Date(p._creationTime);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count += 1;
  });
  return months;
}