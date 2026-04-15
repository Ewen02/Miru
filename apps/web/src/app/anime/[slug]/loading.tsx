import { Shimmer } from "@miru/ui";

export default function Loading() {
  return (
    <main className="flex flex-col gap-14 pb-24">
      <div className="mx-auto w-full max-w-300 px-6 pt-6">
        <Shimmer className="h-4 w-24 rounded-sm" />
      </div>

      <header className="relative w-full">
        <Shimmer className="h-80 w-full sm:h-100" />
        <div className="relative mx-auto -mt-32 flex max-w-300 flex-col gap-6 px-6 sm:flex-row sm:items-end">
          <Shimmer className="aspect-3/4 w-40 shrink-0 rounded-lg sm:w-48" />
          <div className="flex flex-1 flex-col gap-3 pb-2">
            <Shimmer className="h-3 w-48 rounded-sm" />
            <Shimmer className="h-10 w-80 rounded-md" />
            <Shimmer className="h-4 w-40 rounded-sm" />
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-300 gap-10 px-6 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-3">
          <Shimmer className="h-3 w-20 rounded-sm" />
          <Shimmer className="h-4 w-full rounded-sm" />
          <Shimmer className="h-4 w-full rounded-sm" />
          <Shimmer className="h-4 w-3/4 rounded-sm" />
        </div>
        <aside className="flex flex-col gap-3">
          <Shimmer className="h-3 w-16 rounded-sm" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-4 w-full rounded-sm" />
          ))}
        </aside>
      </section>

      <section className="mx-auto flex w-full max-w-300 flex-col gap-4 px-6">
        <Shimmer className="h-3 w-24 rounded-sm" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="aspect-3/4 rounded-lg" />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-300 flex-col gap-4 px-6">
        <Shimmer className="h-3 w-20 rounded-sm" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </section>
    </main>
  );
}
