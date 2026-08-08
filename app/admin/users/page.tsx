"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserTable } from "@/components/admin/UserTable";
import { exportToCsv } from "@/lib/exportToCsv";
import toast from "react-hot-toast";

const ROLES = ["ALL", "ADMIN", "FREELANCER", "CLIENT"] as const;

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<(typeof ROLES)[number]>("ALL");

  const users = useQuery(
    api.users.listUsers,
    roleFilter === "ALL" ? {} : { role: roleFilter }
  );
  const exportRows = useQuery(api.admin.exportUsers);
  const setStatus = useMutation(api.users.setUserStatus);
  const approve = useMutation(api.admin.approveUser);

  async function handleApprove(profileId: string) {
    try {
      await approve({ targetProfileId: profileId as any });
      toast.success("User approved");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to approve user");
    }
  }

  async function handleSuspend(profileId: string) {
    try {
      await setStatus({ targetProfileId: profileId as any, status: "SUSPENDED" });
      toast.success("User suspended");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update user");
    }
  }

  async function handleReinstate(profileId: string) {
    try {
      await setStatus({ targetProfileId: profileId as any, status: "APPROVED" });
      toast.success("User reinstated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update user");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500 text-sm">Manage accounts across all roles</p>
        </div>
        <button
          onClick={() => exportRows && exportToCsv("users", exportRows)}
          disabled={!exportRows?.length}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 text-sm rounded-full border ${
              roleFilter === r
                ? "bg-primary text-white border-primary"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <UserTable users={users} onSuspend={handleSuspend} onReinstate={handleReinstate} onApprove={handleApprove} />
    </div>
  );
}
