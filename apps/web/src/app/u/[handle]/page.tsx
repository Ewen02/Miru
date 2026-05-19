import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AnimeCard, EditorialSectionHeader, RatingHistogram, StatCard } from "@miru/ui";
import { fetchUserProfile } from "@/lib/api";
import type { UserProfileReview } from "@miru/types";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params;
  const profile = await fetchUserProfile(handle).catch(() => null);
  if (!profile) return { title: "Profil introuvable" };
  return {
    title: `${profile.name}`,
    description: `Profil Miru de ${profile.name} — ${profile.stats.completedCount} anime terminés, ${profile.stats.reviewCount} avis.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const profile = await fetchUserProfile(handle).catch(() => null);
  if (!profile) notFound();

  const joinedLabel = profile.joinedAt ? formatJoinedAt(profile.joinedAt) : null;
  const handleSlug = profile.handle.toLowerCase().replace(/\s+/g, "");
  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      {/* Identity header. Avatar (image or initial) + handle eyebrow + name + share. */}
      <header className="mb-14 flex flex-col gap-7 sm:flex-row sm:items-end">
        <Avatar image={profile.image} initial={initial} />
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            @{handleSlug}
            {joinedLabel && <span> · membre depuis {joinedLabel}</span>}
          </p>
          <h1 className="m-0 mb-2 font-display text-4xl font-semibold leading-none tracking-[-0.025em] text-text-primary sm:text-5xl">
            {profile.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-bg-surface px-3 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            aria-label="Partager le profil"
          >
            <ShareIcon /> Partager
          </button>
        </div>
      </header>

      {/* Stats grid (3 stat cards + histogram). */}
      <section className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,1fr)_2fr]">
        <StatCard label="Anime terminés" value={profile.stats.completedCount.toLocaleString("fr-FR")} />
        <StatCard
          label="Heures regardées"
          value={profile.stats.hoursWatched.toLocaleString("fr-FR")}
          sub={`≈ ${Math.round(profile.stats.hoursWatched / 24)} jours`}
        />
        <StatCard
          label="Avis publiés"
          value={profile.stats.reviewCount.toLocaleString("fr-FR")}
          tone="accent"
        />
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
          <p className="m-0 mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
            Distribution des notes
          </p>
          <RatingHistogram bins={profile.stats.ratingHistogram} />
        </div>
      </section>

      {/* Reviews */}
      {profile.reviews.length > 0 && (
        <section className="mb-16">
          <EditorialSectionHeader
            eyebrow="Communauté"
            title="Avis publiés"
            count={profile.stats.reviewCount}
          />
          <div className="flex flex-col gap-3">
            {profile.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* Favorites grid */}
      {profile.favorites.length > 0 && (
        <section>
          <EditorialSectionHeader eyebrow="Top 5" title="Favoris de tous les temps" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
            {profile.favorites.map((fav, idx) => (
              <div key={fav.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-sm font-display text-sm font-bold"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "#08080c",
                  }}
                >
                  {idx + 1}
                </span>
                <Link
                  href={`/anime/${fav.slug}`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                >
                  <AnimeCard
                    title={fav.title}
                    coverUrl={fav.coverUrl}
                    studioName={null}
                    year={null}
                    rating={fav.rating}
                  />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {profile.reviews.length === 0 && profile.favorites.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="font-body text-text-secondary">
            {profile.name} n'a pas encore publié d'avis ni de favoris.
          </p>
        </div>
      )}
    </main>
  );
}

function Avatar({ image, initial }: { image: string | null; initial: string }) {
  if (image) {
    return (
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border">
        <Image src={image} alt="" fill sizes="96px" className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-border font-display text-4xl text-text-primary"
      style={{ background: "linear-gradient(160deg, #2d1844, #4a1d6b)" }}
      aria-hidden
    >
      {initial}
    </div>
  );
}


function ReviewCard({ review }: { review: UserProfileReview }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-5">
      <Link
        href={`/anime/${review.anime.slug}`}
        className="relative h-25 w-17 shrink-0 overflow-hidden rounded-lg border border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        {review.anime.coverUrl ? (
          <Image
            src={review.anime.coverUrl}
            alt=""
            fill
            sizes="68px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            href={`/anime/${review.anime.slug}`}
            className="font-display text-base font-semibold leading-tight tracking-tight text-text-primary hover:text-accent"
          >
            {review.anime.title}
          </Link>
          <span className="font-mono text-[10px] uppercase text-text-tertiary">
            {formatReviewDate(review.createdAt)}
          </span>
        </div>
        {review.body && (
          <p className="m-0 line-clamp-3 font-body text-sm leading-relaxed text-text-secondary text-pretty">
            {review.body}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
          Ma note
        </p>
        <p
          className="m-0 font-display text-2xl font-semibold"
          style={{ color: "var(--color-accent)" }}
        >
          {review.rating.toFixed(1)}
          <span className="text-sm text-text-tertiary">/10</span>
        </p>
      </div>
    </article>
  );
}

function formatJoinedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}
