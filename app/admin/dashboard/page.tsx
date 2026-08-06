"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard } from "@/components/admin/StatCard";

export default function AdminDashboardPage() {
  const stats = useQuery(api.admin.getDashboardStats);

  if (stats === undefined) {
    return <p className="text-gray-500">Loading dashboard…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Active Freelancers" value={stats.activeFreelancers} />
        <StatCard label="Active Clients" value={stats.activeClients} />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          hint={stats.pendingRequests > 0 ? "Needs review" : "All clear"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <ul className="flex flex-col gap-2">
            {stats.recentActivity.length === 0 && (
              <p className="text-gray-400 text-sm">No activity yet</p>
            )}
            {stats.recentActivity.map((a) => (
              <li key={a.id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span className="font-medium">{a.action}</span>
                <span className="text-gray-400">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Jobs</p>
              <p className="text-xl font-semibold">{stats.quickStats.totalJobs}</p>
            </div>
            <div>
              <p className="text-gray-500">Open Jobs</p>
              <p className="text-xl font-semibold">{stats.quickStats.openJobs}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Proposals</p>
              <p className="text-xl font-semibold">{stats.quickStats.totalProposals}</p>
            </div>
            <div>
              <p className="text-gray-500">Pending Reports</p>
              <p className="text-xl font-semibold">{stats.quickStats.pendingReports}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}