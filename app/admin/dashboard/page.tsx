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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];

export default function AdminDashboardPage() {
  const stats = useQuery(api.admin.getDashboardStats);

  if (stats === undefined) {
    return <p className="text-gray-500">Loading dashboard…</p>;
  }

  const jobsData = Object.entries(stats.jobsByStatus).map(([status, count]) => ({
    status,
    count,
  }));
  const usersData = Object.entries(stats.usersByRole).map(([role, count]) => ({
    name: role,
    value: count,
  }));
  const signupsData = Object.entries(stats.signupsByDay)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview & analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Jobs" value={stats.totalJobs} />
        <StatCard label="Total Proposals" value={stats.totalProposals} />
        <StatCard
          label="Pending Reports"
          value={stats.pendingReports}
          hint={stats.pendingReports > 0 ? "Needs review" : "All clear"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Jobs by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={jobsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={usersData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {usersData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-4">Signups (last 14 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={signupsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}