import { Shimmer } from "@miru/ui";

export default function Loading() {
  return (
    <main className="mx-auto max-w-300 px-6 py-14">
      <header className="mb-10">
        <Shimmer className="h-4 w-24 rounded-sm" />
        <Shimmer className="mt-2 h-12 w-64 rounded-md" />
        <Shimmer className="mt-3 h-4 w-80 rounded-sm" />
      </header>
      <div className="mb-10 flex flex-col gap-4">
        <Shimmer className="h-10 w-full rounded-md" />
        <Shimmer className="h-20 w-full rounded-md" />
      </div>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Shimmer key={i} className="aspect-3/4 rounded-lg" />
        ))}
      </section>
    </main>
  );
}
