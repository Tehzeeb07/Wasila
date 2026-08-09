"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Inbox as InboxIcon, MessageCircle } from "lucide-react";

function getLastSeen(jobId) {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(`chat-seen-${jobId}`) || 0);
}

export default function InboxPage() {
  const proposals = useQuery(api.proposals.getMyProposals);
  const acceptedJobIds = (proposals ?? [])
    .filter((p) => p.status === "ACCEPTED")
    .map((p) => p.jobId);

  return (
    <div className="-m-6 md:-m-10">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-500 md:rounded-3xl md:mx-10 md:mt-10 px-6 md:px-10 py-8 relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <InboxIcon size={110} className="text-white" />
        </div>
        <div className="relative max-w-md">
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <p className="text-emerald-100 text-sm mt-2">
            Conversations from your active projects.
          </p>
        </div>
      </div>

      <div className="px-6 md:px-10 pb-10 pt-6">
        {proposals === undefined && (
          <p className="text-gray-400 text-sm">Loading...</p>
        )}

        {proposals && acceptedJobIds.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={22} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              No conversations yet. Once a client accepts your proposal,
              you'll be able to chat here.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {acceptedJobIds.map((jobId) => (
            <InboxRow key={jobId} jobId={jobId} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InboxRow({ jobId }) {
  const job = useQuery(api.jobs.getJobById, { id: jobId });
  const messages = useQuery(api.messages.listForJob, { jobId });
  const [lastSeen, setLastSeen] = useState(0);

  useEffect(() => {
    setLastSeen(getLastSeen(jobId));
  }, [jobId]);

  if (!job || !messages) return null;

  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(
    (m) => m._creationTime > lastSeen
  ).length;

  return (
    <Link
      href={`/freelancer/jobs/${jobId}/messages`}
      className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition"
    >
      <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm shrink-0">
        {job.title?.[0]?.toUpperCase() || "J"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {job.title}
          </h3>
          {unreadCount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {lastMessage ? lastMessage.content || "📎 Attachment" : "No messages yet"}
        </p>
      </div>
    </Link>
  );
}