const LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STYLES = {
  OPEN: "bg-emerald-600 text-white border-emerald-500",
  IN_PROGRESS: "bg-primary text-white border-primary",
  COMPLETED: "bg-blue-600 text-white border-blue-500",
  CANCELLED: "bg-red-600 text-white border-red-500",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${
        STYLES[status] || "bg-slate-600 text-white border-slate-500"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}