"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProposalsInboxPage() {
  const proposals = useQuery(api.proposals.listPendingForClient);
  const acceptProposal = useMutation(api.proposals.accept);
  const rejectProposal = useMutation(api.proposals.reject);
  const [actingOn, setActingOn] = useState(null);
  const [error, setError] = useState("");

  async function handleAccept(p) {
    if (!confirm(`Accept ${p.name || "this freelancer"}'s proposal on "${p.jobTitle}"?`)) return;
    setActingOn(p._id);
    try {
      await acceptProposal({ proposalId: p._id });
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  async function handleReject(p) {
    setActingOn(p._id);
    try {
      await rejectProposal({ proposalId: p._id });
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  const loading = proposals === undefined;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Proposal Review</p>
      <h1 className="text-3xl font-semibold mb-8">Proposals awaiting your decision</h1>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : proposals.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No pending proposals right now.
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div key={p._id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link href={`/client/jobs/${p.jobId}`} className="text-xs text-blue-600 font-medium">
                    {p.jobTitle}
                  </Link>
                  <p className="font-medium">{p.name || "Freelancer"}</p>
                </div>
                <p className="text-lg font-semibold">${p.bidAmount}</p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{p.coverLetter}</p>
              <div className="flex gap-3">
                <button
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={actingOn === p._id}
                  onClick={() => handleAccept(p)}
                >
                  Accept
                </button>
                <button
                  className="border border-red-300 text-red-600 text-sm font-medium px-4 py-2 rounded-md hover:bg-red-50 disabled:opacity-50"
                  disabled={actingOn === p._id}
                  onClick={() => handleReject(p)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
