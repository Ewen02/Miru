import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ListDetailPageProps {
  params: Promise<{ id: string }>;
}

interface ListMock {
  title: string;
  description: string;
  curator: string;
  count: number;
  likes: number;
  items: Array<{
    rank: number;
    title: string;
    year: number;
    note: string;
    rating: number;
  }>;
}

const LISTS: Record<string, ListMock> = {
  "miru-100": {
    title: "Miru 100",
    description:
      "Les 100 titres qui ont défini le médium selon notre équipe éditoriale. Mis à jour chaque année.",
    curator: "Équipe Miru",
    count: 100,
    likes: 4280,
    items: [
      { rank: 1, title: "Cowboy Bebop", year: 1998, note: "Le sommet, point.", rating: 9.7 },
      { rank: 2, title: "Mushishi", year: 2005, note: "Pour ceux qui ont besoin de silence.", rating: 9.5 },
      { rank: 3, title: "Frieren — Beyond Journey's End", year: 2024, note: "L'instant classique.", rating: 9.5 },
      { rank: 4, title: "Vinland Saga", year: 2019, note: "Le crescendo le plus long et le plus juste.", rating: 9.3 },
      { rank: 5, title: "Made in Abyss", year: 2017, note: "Pas pour tout le monde — pour ceux qui restent.", rating: 9.2 },
    ],
  },
};

export async function generateMetadata({ params }: ListDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const list = LISTS[id];
  if (!list) return { title: "Liste introuvable" };
  return {
    title: list.title,
    description: list.description,
  };
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { id } = await params;
  const list = LISTS[id];
  if (!list) notFound();

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      {/* Staggered hero — 4 overlapping rotated cover placeholders */}
      <section className="mb-14 flex flex-col gap-10 md:flex-row md:items-end md:gap-14">
        <div className="relative h-64 w-72 shrink-0">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute h-48 w-32 rounded-xl border border-border-subtle"
              style={{
                top: `${i * 18}px`,
                left: `${i * 32}px`,
                transform: `rotate(${(i - 1.5) * 6}deg)`,
                background: `linear-gradient(${140 + i * 20}deg, color-mix(in srgb, var(--color-accent) ${15 + i * 8}%, transparent), var(--color-bg-elevated))`,
                zIndex: 4 - i,
              }}
            />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href="/lists"
            className="mb-3 inline-flex items-center font-mono text-xs uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
          >
            ← Listes
          </Link>
          <h1 className="m-0 mb-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-text-primary sm:text-5xl">
            {list.title}
          </h1>
          <p className="m-0 mb-5 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
            {list.description}
          </p>
          <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
            <span>par {list.curator}</span>
            <span aria-hidden>·</span>
            <span>{list.count} titres</span>
            <span aria-hidden>·</span>
            <span>{list.likes.toLocaleString("fr-FR")} ❤</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              ❤ J'aime
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md border border-border bg-bg-surface px-4 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
            >
              + Suivre
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md border border-border bg-bg-surface px-4 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
            >
              Partager
            </button>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
          Tri
        </span>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md border border-accent/40 bg-accent/15 px-3 font-mono text-[10px] uppercase tracking-wider"
          style={{ color: "var(--color-accent)" }}
        >
          Rang
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md border border-border bg-bg-surface px-3 font-mono text-[10px] uppercase tracking-wider text-text-secondary"
        >
          Année
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md border border-border bg-bg-surface px-3 font-mono text-[10px] uppercase tracking-wider text-text-secondary"
        >
          Note
        </button>
      </div>

      {/* Ranked items */}
      <section className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
        {list.items.map((item, idx) => (
          <article
            key={item.rank}
            className={
              idx === list.items.length - 1
                ? "flex gap-5 p-5"
                : "flex gap-5 border-b border-border-subtle p-5"
            }
          >
            <span
              aria-hidden
              className="shrink-0 font-display text-3xl font-bold tracking-tight"
              style={{ color: item.rank <= 3 ? "var(--color-accent)" : "var(--color-text-tertiary)" }}
            >
              {String(item.rank).padStart(2, "0")}
            </span>
            <div
              className="h-22 w-16 shrink-0 rounded-md border border-border-subtle"
              style={{
                background: `linear-gradient(${130 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${20 + idx * 5}%, transparent), var(--color-bg-elevated))`,
              }}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h3 className="m-0 font-display text-lg font-semibold tracking-tight text-text-primary">
                {item.title} <span className="font-mono text-xs text-text-tertiary">{item.year}</span>
              </h3>
              <p className="m-0 font-body text-sm italic text-text-secondary text-pretty">
                « {item.note} »
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                Note
              </p>
              <p
                className="m-0 font-display text-xl font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                ★ {item.rating.toFixed(1)}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
