import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchListDetail } from "@/lib/server-lists";
import { ListActionsBar } from "./list-actions-bar";
import { RemoveItemButton } from "./remove-item-button";

interface ListDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const list = await fetchListDetail(id).catch(() => null);
  if (!list) return { title: "Liste introuvable" };
  return {
    title: list.title,
    description: list.description ?? `Liste ${list.title} sur Miru par ${list.ownerName}.`,
  };
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { id } = await params;
  const list = await fetchListDetail(id).catch(() => null);
  if (!list) notFound();

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <section className="mb-14 flex flex-col gap-10 md:flex-row md:items-end md:gap-14">
        <StaggeredCovers covers={list.items.slice(0, 4).map((it) => it.animeCoverUrl)} />

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
          {list.description && (
            <p className="m-0 mb-5 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
              {list.description}
            </p>
          )}
          <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
            <span>par {list.ownerName}</span>
            <span aria-hidden>·</span>
            <span>{list.itemCount} titres</span>
            <span aria-hidden>·</span>
            <span>{list.likeCount.toLocaleString("fr-FR")} ❤</span>
            {!list.isPublic && (
              <>
                <span aria-hidden>·</span>
                <span>Privée</span>
              </>
            )}
          </div>
          <ListActionsBar
            listId={list.id}
            initialLiked={list.likedByViewer}
            ownedByViewer={list.ownedByViewer}
          />
        </div>
      </section>

      {list.items.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            {list.ownedByViewer
              ? "Cette liste est vide. Ajoute des titres depuis une fiche anime."
              : "Cette liste ne contient pas encore de titre."}
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {list.items.map((item, idx) => (
            <article
              key={item.animeId}
              className={
                idx === list.items.length - 1
                  ? "flex items-center gap-5 p-5"
                  : "flex items-center gap-5 border-b border-border-subtle p-5"
              }
            >
              <span
                aria-hidden
                className="shrink-0 font-display text-3xl font-bold tracking-tight"
                style={{
                  color: idx < 3 ? "var(--color-accent)" : "var(--color-text-tertiary)",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <Link
                href={`/anime/${item.animeSlug}`}
                className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded-md"
              >
                {item.animeCoverUrl ? (
                  <div className="relative h-22 w-16 shrink-0 overflow-hidden rounded-md border border-border-subtle">
                    <Image
                      src={item.animeCoverUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="h-22 w-16 shrink-0 rounded-md border border-border-subtle"
                    style={{
                      background: `linear-gradient(${130 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${20 + idx * 5}%, transparent), var(--color-bg-elevated))`,
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 font-display text-lg font-semibold tracking-tight text-text-primary">
                    {item.animeTitle}{" "}
                    {item.animeYear && (
                      <span className="font-mono text-xs text-text-tertiary">{item.animeYear}</span>
                    )}
                  </h3>
                  {item.note && (
                    <p className="m-0 mt-1 font-body text-sm italic text-text-secondary text-pretty">
                      « {item.note} »
                    </p>
                  )}
                </div>
              </Link>
              <div className="shrink-0 text-right">
                <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                  Note
                </p>
                {item.animeAverageRating != null ? (
                  <p
                    className="m-0 font-display text-xl font-semibold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    ★ {item.animeAverageRating.toFixed(1)}
                  </p>
                ) : (
                  <p className="m-0 font-mono text-sm text-text-tertiary">—</p>
                )}
              </div>
              {list.ownedByViewer && (
                <RemoveItemButton listId={list.id} animeId={item.animeId} />
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function StaggeredCovers({ covers }: { covers: Array<string | null> }) {
  return (
    <div className="relative h-64 w-72 shrink-0">
      {Array.from({ length: 4 }, (_, i) => {
        const cover = covers[i] ?? null;
        return (
          <div
            key={i}
            className="absolute h-48 w-32 overflow-hidden rounded-xl border border-border-subtle"
            style={{
              top: `${i * 18}px`,
              left: `${i * 32}px`,
              transform: `rotate(${(i - 1.5) * 6}deg)`,
              zIndex: 4 - i,
              background: cover
                ? "transparent"
                : `linear-gradient(${140 + i * 20}deg, color-mix(in srgb, var(--color-accent) ${15 + i * 8}%, transparent), var(--color-bg-elevated))`,
            }}
          >
            {cover && (
              <Image src={cover} alt="" fill sizes="128px" className="object-cover" />
            )}
          </div>
        );
      })}
    </div>
  );
}
