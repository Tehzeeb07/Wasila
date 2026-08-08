"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

export default function AdminApprovalsPage() {
  const pending = useQuery(api.admin.listPendingApprovals);
  const approve = useMutation(api.admin.approveUser);
  const reject = useMutation(api.admin.rejectUser);

  async function handleApprove(id: string) {
    try {
      await approve({ targetProfileId: id as any });
      toast.success("Account approved");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to approve");
    }
  }

  async function handleReject(id: string) {
    try {
      await reject({ targetProfileId: id as any });
      toast.success("Account rejected");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to reject");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Account Approvals</h1>
        <p className="text-gray-500 text-sm">
          New freelancer & client signups awaiting approval
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {pending?.length === 0 && (
          <p className="text-gray-400 text-sm">No accounts pending approval.</p>
        )}
        {pending?.map((u) => (
          <div
            key={u._id}
            className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {u.role} · Signed up {new Date(u._creationTime).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(u._id)}
                className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary-dark"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(u._id)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}