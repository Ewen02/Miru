import { Skeleton } from "@miru/ui";

export default function Loading() {
  return (
    <>
      {/* Hero placeholder — matches HomeHero's 520px slot */}
      <div className="relative h-130 w-full overflow-hidden bg-bg-elevated">
        <div className="absolute inset-x-0 bottom-0 flex max-w-180 flex-col gap-4 p-14">
          <Skeleton className="h-3 w-28 rounded-sm" />
          <Skeleton className="h-12 w-80 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-sm" />
          <Skeleton className="h-4 w-72 rounded-sm" />
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-11 w-32 rounded-md" />
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
        </div>
      </div>

      {/* Slider placeholder */}
      <section className="mx-auto mt-16 flex max-w-300 flex-col gap-5">
        <div className="px-7">
          <Skeleton className="mb-2 h-3 w-20 rounded-sm" />
          <Skeleton className="h-6 w-56 rounded-sm" />
        </div>
        <div className="flex gap-4 overflow-hidden px-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-16/10 w-56 shrink-0 rounded-lg" />
          ))}
        </div>
      </section>

      {/* Catalog grid placeholder */}
      <main className="mx-auto mt-20 max-w-300 px-7 pb-20">
        <header className="mb-8">
          <Skeleton className="mb-2 h-3 w-24 rounded-sm" />
          <Skeleton className="h-9 w-64 rounded-md" />
        </header>
        <Skeleton className="mb-8 h-12 w-full rounded-md" />
        <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-3/4 rounded-lg" />
          ))}
        </section>
      </main>
    </>
  );
}
