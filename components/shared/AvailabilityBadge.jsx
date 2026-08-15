const LABELS = {
  AVAILABLE: "Available for work",
  BUSY: "Busy",
  NOT_ACCEPTING: "Not accepting jobs",
};

const STYLES = {
  AVAILABLE: "bg-emerald-600 text-white border-emerald-500",
  BUSY: "bg-amber-500 text-white border-amber-400",
  NOT_ACCEPTING: "bg-gray-600 text-white border-gray-500",
};

export default function AvailabilityBadge({ status }) {
  const key = status || "AVAILABLE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border ${STYLES[key]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {LABELS[key]}
    </span>
  );
}