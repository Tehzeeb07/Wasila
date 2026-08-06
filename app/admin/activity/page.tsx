"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exportToCsv } from "@/lib/exportToCsv";

export default function AdminActivityPage() {
  const logs = useQuery(api.admin.listAuditLogs, { limit: 200 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-gray-500 text-sm">
            Record of sensitive admin actions (status changes, moderation, etc.)
          </p>
        </div>
        <button
          onClick={() =>
            logs &&
            exportToCsv(
              "activity-log",
              logs.map((l) => ({
                action: l.action,
                actor: l.actorUserId,
                targetType: l.targetType ?? "",
                targetId: l.targetId ?? "",
                timestamp: new Date(l._creationTime).toISOString(),
              }))
            )
          }
          disabled={!logs?.length}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {logs === undefined && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {logs?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No activity yet
                </td>
              </tr>
            )}
            {logs?.map((l) => (
              <tr key={l._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{l.action}</td>
                <td className="px-4 py-3 text-gray-500">
                  {l.targetType ? `${l.targetType} · ${l.targetId}` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(l._creationTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}