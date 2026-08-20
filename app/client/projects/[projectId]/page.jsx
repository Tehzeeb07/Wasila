"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StatusBadge from "@/components/client/StatusBadge";
import SkillBadge from "@/components/client/SkillBadge";
import ReportModal from "@/components/client/ReportModal";

export default function ProjectDetailPage() {
  const { projectId } = useParams(); // this is the job id
  const job = useQuery(api.jobs.getWithAssignedFreelancer, { jobId: projectId });
  const messages = useQuery(api.messages.listForJob, { jobId: projectId });
  const setStatus = useMutation(api.jobs.setStatus);
  const sendMessage = useMutation(api.messages.send);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reportTarget, setReportTarget] = useState(null); // { userId, jobId, label } | null

  async function handleStatusChange(status) {
    setBusy(true);
    setError("");
    try {
      await setStatus({ jobId: projectId, status });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      await sendMessage({ jobId: projectId, content: text.trim() });
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (job === undefined || messages === undefined) return <p className="text-sm text-gray-400">Loading…</p>;
  if (job === null) return <p className="text-sm text-red-600">Project not found.</p>;

  const freelancer = job.proposal;
  const isActive = job.status === "IN_PROGRESS";

  return (
    <div className="max-w-2xl">
      <Link href="/client/projects" className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700">
        ← Back to projects
      </Link>

      <div className="flex items-start justify-between mt-4 mb-1">
        <h1 className="text-3xl font-semibold">{job.title}</h1>
        <StatusBadge status={job.status} />
      </div>
      <p className="text-sm text-gray-400 mb-6">
        {freelancer
          ? `With ${freelancer.name}${freelancer.headline ? ` · ${freelancer.headline}` : ""}`
          : "Freelancer assigned"}
        {freelancer?.bidAmount ? ` · $${freelancer.bidAmount}` : ""}
      </p>

      {freelancer?.verifiedSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {freelancer.verifiedSkills.map((skill) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
        </div>
      )}

      {freelancer && (
        <button
          type="button"
          onClick={() =>
            setReportTarget({
              userId: freelancer.freelancerUserId,
              jobId: job._id,
              label: freelancer.name || "this freelancer",
            })
          }
          className="text-xs text-gray-400 hover:text-red-600 mb-6 block"
        >
          Report freelancer
        </button>
      )}

      {isActive && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Update project status</p>
            <p className="text-xs text-gray-400">Mark it complete once delivered, or cancel if it falls through.</p>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={busy}
              onClick={() => handleStatusChange("COMPLETED")}
            >
              Mark completed
            </button>
            <button
              className="border border-red-300 text-red-600 text-sm font-medium px-4 py-2 rounded-md hover:bg-red-50 disabled:opacity-50"
              disabled={busy}
              onClick={() => handleStatusChange("CANCELLED")}
            >
              Cancel project
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <h2 className="text-xl font-semibold mb-3">Messages</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m._id}>
              <p className="text-sm">{m.content}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {m.senderName || "Someone"} · {new Date(m._creationTime).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {isActive && (
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Write a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="border border-gray-300 text-sm font-medium px-4 py-2 rounded-md hover:border-gray-400 disabled:opacity-50"
            disabled={busy}
            type="submit"
          >
            Send
          </button>
        </form>
      )}

      {reportTarget && (
        <ReportModal
          targetUserId={reportTarget.userId}
          targetJobId={reportTarget.jobId}
          targetLabel={reportTarget.label}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}