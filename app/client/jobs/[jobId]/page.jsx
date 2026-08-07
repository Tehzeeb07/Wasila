"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatusBadge from "@/components/client/StatusBadge";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const router = useRouter();

  const job = useQuery(api.jobs.get, { jobId });
  const proposals = useQuery(api.proposals.listForJob, { jobId });
  const acceptProposal = useMutation(api.proposals.accept);
  const rejectProposal = useMutation(api.proposals.reject);

  const [actingOn, setActingOn] = useState(null);
  const [error, setError] = useState("");

  async function handleAccept(proposal) {
    if (
      !confirm(
        `Accept ${proposal.name || "this freelancer"}'s proposal? This moves the job into progress and rejects other pending proposals.`
      )
    )
      return;
    setActingOn(proposal._id);
    setError("");
    try {
      await acceptProposal({ proposalId: proposal._id });
      router.push(`/client/projects/${jobId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  async function handleReject(proposal) {
    setActingOn(proposal._id);
    try {
      await rejectProposal({ proposalId: proposal._id });
    } catch (err) {
      setError(err.message);
    } finally {
      setActingOn(null);
    }
  }

  if (job === undefined || proposals === undefined) return <p className="text-sm text-gray-400">Loading…</p>;
  if (job === null) return <p className="text-sm text-red-600">Job not found.</p>;

  return (
    <div>
      <Link href="/client/jobs" className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700">
        ← Back to job postings
      </Link>

      <div className="flex items-start justify-between mt-4 mb-2">
        <h1 className="text-3xl font-semibold">{job.title}</h1>
        <StatusBadge status={job.status} />
      </div>
      <p className="text-sm text-gray-400 mb-6">
        {job.category}
        {job.budgetMin || job.budgetMax ? ` · $${job.budgetMin ?? "?"}–$${job.budgetMax ?? "?"}` : ""}
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {job.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-1 border border-gray-200 rounded-md text-gray-600">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {job.status !== "OPEN" ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-3">
            This job already has an assigned freelancer. Manage it from Projects.
          </p>
          <Link
            href={`/client/projects/${job._id}`}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to project
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Proposals {proposals.length > 0 && `(${proposals.length})`}
          </h2>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          {proposals.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              No proposals yet. Freelancers will appear here once they apply.
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((p) => (
                <div key={p._id} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{p.name || "Freelancer"}</p>
                      {p.headline && <p className="text-xs text-gray-400">{p.headline}</p>}
                    </div>
                    <p className="text-lg font-semibold">${p.bidAmount}</p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{p.coverLetter}</p>

                  {p.status === "PENDING" ? (
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
                  ) : (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        p.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
