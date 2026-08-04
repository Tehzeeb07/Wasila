"use client";

interface ReportRow {
  _id: string;
  targetUserId?: string;
  targetJobId?: string;
  reason: string;
  status: string;
  _creationTime: number;
}

export function ReportCard({
  report,
  onReview,
  onDismiss,
}: {
  report: ReportRow;
  onReview: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">
          {report.targetUserId ? "User report" : "Job report"}
        </p>
        <p className="text-sm text-gray-600 mt-1">{report.reason}</p>
        <p className="text-xs text-gray-400 mt-2">
          Filed {new Date(report._creationTime).toLocaleString()}
        </p>
      </div>
      {report.status === "PENDING" && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onReview(report._id)}
            className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary-dark"
          >
            Mark Reviewed
          </button>
          <button
            onClick={() => onDismiss(report._id)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}