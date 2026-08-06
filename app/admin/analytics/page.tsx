"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard } from "@/components/admin/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function AdminAnalyticsPage() {
  const analytics = useQuery(api.admin.getAnalytics);

  if (analytics === undefined) {
    return <p className="text-gray-500">Loading analytics…</p>;
  }

  const jobsTrend = Object.entries(analytics.jobsByDay)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 text-sm">Proposal & job market trends</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Proposals" value={analytics.totalProposals} />
        <StatCard
          label="Acceptance Rate"
          value={`${analytics.acceptanceRate}%`}
          hint="Proposals accepted vs total"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Avg Bid by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.avgBidByCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="avgBid" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Jobs by Category (Volume)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.jobsByCategoryVolume}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-4">Jobs Posted (last 30 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={jobsTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}