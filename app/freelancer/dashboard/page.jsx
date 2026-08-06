"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function DashboardPage() {
  const profile = useQuery(api.freelancerProfiles.getMyProfile);
  const proposals = useQuery(api.proposals.getMyProposals);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome{profile?.headline ? `, ${profile.headline}` : ""} 👋
      </h1>
      <p className="text-gray-500 mb-8">Here's your activity overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500">Total Proposals</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {proposals?.length ?? 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500">Accepted</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">
            {proposals?.filter((p) => p.status === "ACCEPTED").length ?? 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {proposals?.filter((p) => p.status === "PENDING").length ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/freelancer/jobs"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
        >
          Browse Jobs →
        </Link>
      </div>
    </div>
  );
}