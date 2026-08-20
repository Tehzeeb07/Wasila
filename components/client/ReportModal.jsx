"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatConvexError } from "@/lib/formatError";

const REASONS = [
  "Spam or gibberish content",
  "Inappropriate or offensive",
  "Suspected scam",
  "Not delivering as agreed",
  "Other",
];

export default function ReportModal({ targetUserId, targetJobId, targetLabel, onClose }) {
  const submitReport = useMutation(api.reports.submitReport);
  const [reasonCategory, setReasonCategory] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const reason = details.trim() ? `${reasonCategory} — ${details.trim()}` : reasonCategory;
      await submitReport({ targetUserId, targetJobId, reason });
      setDone(true);
    
    } catch (err) {
      setError(formatConvexError(err));

    } finally {
      setSubmitting(false);
    }
    
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {done ? (
          <>
            <h2 className="text-lg font-semibold mb-2">Report submitted</h2>
            <p className="text-sm text-gray-500 mb-4">Thanks — an admin will review this.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold mb-1">Report {targetLabel}</h2>
            <p className="text-xs text-gray-400 mb-4">
              This goes to an admin for review — it won't notify the other party.
            </p>

            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Reason</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
              Details (optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[80px] mb-4"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Anything else the admin should know?"
            />

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border border-gray-300 text-sm font-medium px-4 py-2 rounded-md hover:border-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}