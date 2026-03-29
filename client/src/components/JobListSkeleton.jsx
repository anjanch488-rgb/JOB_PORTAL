export default function JobListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass animate-pulse rounded-2xl p-5"
        >
          <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
