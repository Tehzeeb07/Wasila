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
  const a = useQuery(api.admin.getFullAnalytics);

  if (a === undefined) {
    return <p className="text-gray-500">Loading analytics…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 text-sm">Platform trends & performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Project Completion Rate" value={`${a.completionRate}%`} />
        <StatCard label="Total Transacted" value={`$${a.revenue.totalTransacted}`} />
        <StatCard
          label="Commission Earned"
          value={`$${a.revenue.commissionEarned}`}
          hint={`${a.revenue.commissionRate}% rate`}
        />
        <StatCard label="Top Freelancer Rating" value={a.freelancerPerformance[0]?.avgRating ?? "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">User Growth (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={a.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Proposal Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={a.proposalTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Popular Categories</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={a.popularCategories}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Freelancer Performance (avg rating)</h3>
          {a.freelancerPerformance.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {a.freelancerPerformance.map((f) => (
                <li key={f.name} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <span>{f.name}</span>
                  <span className="font-medium">⭐ {f.avgRating}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-4">Client Engagement (jobs posted)</h3>
          {a.clientEngagement.length === 0 ? (
            <p className="text-gray-400 text-sm">No jobs posted yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={a.clientEngagement} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}