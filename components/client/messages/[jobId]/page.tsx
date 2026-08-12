"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import JobChat from "@/components/shared/JobChat";
import { useParams } from "next/navigation";

export default function ClientJobMessagesPage() {
  const { jobId } = useParams();
  const profile = useQuery(api.users.getCurrentUserProfile);

  if (profile === undefined) {
    return <p className="text-green-100 text-sm">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-50 mb-4">Messages</h1>
      <JobChat jobId={jobId} currentUserId={profile._id} />
    </div>
  );
}