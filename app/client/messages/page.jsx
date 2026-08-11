"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function ClientMessagesInboxPage() {
  const conversations = useQuery(api.jobs.listMineWithChats);

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-50 mb-1">Messages</h1>
      <p className="text-green-200 text-sm mb-6">
        Conversations with freelancers on your active projects
      </p>

      {conversations === undefined && (
        <p className="text-green-200 text-sm">Loading…</p>
      )}

      {conversations?.length === 0 && (
        <div className="bg-[#2E3820] border border-[#556B2F] rounded-xl p-8 text-center">
          <p className="text-green-200 text-sm">
            No conversations yet. Once you accept a proposal on a job, you'll
            be able to message that freelancer here.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {conversations?.map((c) => (
          <Link
            key={c.jobId}
            href={`/client/messages/${c.jobId}`}
            className="bg-[#2E3820] border border-[#556B2F] rounded-xl p-4 flex items-center justify-between hover:border-primary transition"
          >
            <div className="min-w-0">
              <p className="font-medium text-green-50 truncate">
                {c.jobTitle}
              </p>
              <p className="text-xs text-green-300 mt-0.5">
                with {c.freelancerName}
              </p>
              <p className="text-sm text-green-200 truncate mt-1 max-w-md">
                {c.lastMessagePreview}
              </p>
            </div>
            <span className="text-xs text-green-400 shrink-0 ml-4">
              {new Date(c.lastMessageAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}