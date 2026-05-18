import { Skeleton } from "@miru/ui";

export default function Loading() {
  return (
    <main className="mx-auto max-w-300 px-6 py-14">
      <header className="mb-10">
        <Skeleton className="h-4 w-24 rounded-sm" />
        <Skeleton className="mt-2 h-12 w-64 rounded-md" />
        <Skeleton className="mt-3 h-4 w-80 rounded-sm" />
      </header>
      <div className="mb-10 flex flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-3/4 rounded-lg" />
        ))}
      </section>
    </main>
  );
}
