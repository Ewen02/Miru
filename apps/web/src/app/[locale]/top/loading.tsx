import { Skeleton } from "@miru/ui";

/** Matches the /top layout: editorial header + ranked table of 20 rows. */
export default function Loading() {
  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <Skeleton className="mb-2 h-3 w-24 rounded-sm" />
        <Skeleton className="h-12 w-72 rounded-md" />
        <Skeleton className="mt-3 h-4 w-96 rounded-sm" />
      </header>

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border-subtle px-5 py-3.5 last:border-0"
          >
            <Skeleton className="h-5 w-6 shrink-0 rounded-sm" />
            <Skeleton className="h-11 w-8 shrink-0 rounded-sm" />
            <Skeleton className="h-4 flex-1 rounded-sm" />
            <Skeleton className="hidden h-3 w-24 rounded-sm sm:block" />
            <Skeleton className="h-4 w-10 shrink-0 rounded-sm" />
          </div>
        ))}
      </div>
    </main>
  );
}
