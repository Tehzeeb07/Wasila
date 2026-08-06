"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReportCard } from "@/components/admin/ReportCard";
import toast from "react-hot-toast";

const TABS = ["PENDING", "REVIEWED", "DISMISSED"] as const;

export default function AdminReportsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("PENDING");
  const reports = useQuery(api.admin.listReports, { status: tab });
  const resolve = useMutation(api.admin.resolveReport);

  async function handleReview(reportId: string) {
    try {
      await resolve({ reportId: reportId as any, status: "REVIEWED" });
      toast.success("Report marked reviewed");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update report");
    }
  }

  async function handleDismiss(reportId: string) {
    try {
      await resolve({ reportId: reportId as any, status: "DISMISSED" });
      toast.success("Report dismissed");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update report");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-500 text-sm">
          User-submitted reports of inappropriate users or projects
        </p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-full border ${
              tab === t
                ? "bg-primary text-white border-primary"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {reports?.length === 0 && (
          <p className="text-gray-400 text-sm">No {tab.toLowerCase()} reports.</p>
        )}
        {reports?.map((r) => (
          <ReportCard
            key={r._id}
            report={r}
            onReview={handleReview}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}