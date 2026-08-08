export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-2 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded w-full mb-2" />
      <div className="h-2 bg-gray-200 rounded w-4/5" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-2 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, type = "card" }) {
  const Item = type === "row" ? SkeletonRow : SkeletonCard;
  return (
    <div
      className={
        type === "row"
          ? "space-y-3"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}