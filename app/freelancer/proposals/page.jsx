"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function ProposalsPage() {
  const proposals = useQuery(api.proposals.getMyProposals);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Proposals</h1>
      <p className="text-gray-500 mb-6">Track the status of your applications.</p>

      {proposals?.length === 0 && (
        <p className="text-gray-500">You haven't applied to any jobs yet.</p>
      )}

      <div className="space-y-4">
        {proposals?.map((p) => (
          <div
            key={p._id}
            className="bg-white border border-gray-200 rounded-xl p-6 flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-gray-500">Bid: ${p.bidAmount}</p>
              <p className="text-gray-700 text-sm mt-1 line-clamp-1">
                {p.coverLetter}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[p.status]}`}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}