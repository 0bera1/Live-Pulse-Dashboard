export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-md ${className}`} />;
}

/** A stack of shimmering rows that roughly matches a list-style card. */
export function SkeletonRows({ rows = 4, className = "h-10" }: { rows?: number; className?: string }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Yükleniyor">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}
