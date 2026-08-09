"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileText, DollarSign, Clock } from "lucide-react";
import { SkeletonGrid } from "@/components/Skeleton";

const statusConfig = {
  PENDING: { color: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-500" },
  ACCEPTED: { color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { color: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

const TABS = ["All", "PENDING", "ACCEPTED", "REJECTED"];

export default function ProposalsPage() {
  const proposals = useQuery(api.proposals.getMyProposals);
  const withdrawProposal = useMutation(api.proposals.withdrawProposal);
  const [tab, setTab] = useState("All");

  const total = proposals?.length ?? 0;
  const accepted = proposals?.filter((p) => p.status === "ACCEPTED").length ?? 0;
  const pending = proposals?.filter((p) => p.status === "PENDING").length ?? 0;
  const rejected = proposals?.filter((p) => p.status === "REJECTED").length ?? 0;

  const filtered = proposals?.filter((p) => tab === "All" || p.status === tab);

  return (
    <div className="-m-6 md:-m-10">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-500 md:rounded-3xl md:mx-10 md:mt-10 px-6 md:px-10 py-8 relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <FileText size={110} className="text-white" />
        </div>
        <div className="relative max-w-md">
          <h1 className="text-2xl font-bold text-white">My Proposals</h1>
          <p className="text-emerald-100 text-sm mt-2">
            Track the status of every job you've applied to.
          </p>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-10 pt-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={total} label="Total Sent" color="bg-gray-800" />
          <StatCard value={accepted} label="Accepted" color="bg-emerald-600" />
          <StatCard value={pending} label="Pending" color="bg-yellow-500" />
          <StatCard value={rejected} label="Rejected" color="bg-red-500" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                tab === t
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "All" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {proposals === undefined && <SkeletonGrid count={4} type="row" />}

        {proposals && filtered?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={22} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              {tab === "All"
                ? "You haven't applied to any jobs yet."
                : `No ${tab.toLowerCase()} proposals.`}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered?.map((p) => {
            const config = statusConfig[p.status];
            return (
              <div
                key={p._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  {p.status === "PENDING" && (
                    <button
                      onClick={() => withdrawProposal({ id: p._id })}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Withdraw
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">
                  {p.coverLetter}
                </p>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <DollarSign size={13} />
                    <span className="font-semibold text-gray-900">
                      ${p.bidAmount}
                    </span>
                    bid
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock size={13} />
                    {new Date(p._creationTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className={`${color} text-white rounded-2xl p-5`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
    </div>
  );
}