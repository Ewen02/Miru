import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import {
  AnimeDetailTemplate,
  AnimeHero,
  CharacterCard,
  PlatformBadge,
  RelationCard,
  SeasonSwitcher,
  Skeleton,
  type SeasonItem,
} from "@miru/ui";
import { fetchAnimeAccent, fetchAnimeDetail } from "@/lib/api";
import { fetchUserWatchlist } from "@/lib/server-watchlist";
import { fetchAnimeReviews } from "@/lib/server-reviews";
import { fetchWatchedEpisodes } from "@/lib/server-watched-episodes";
import { getServerSession } from "@/lib/server-auth";
import { WatchlistButton } from "@/components/watchlist-button";
import { AddToListButton } from "@/components/add-to-list-button";
import { EpisodesTracker } from "@/components/episodes-tracker";
import { ReviewSection } from "@/components/review-section";
import { HeaderDetailBridge } from "@/components/app-header/header-context";
import type {
  AnimeDetail,
  AnimeRelationCard as AnimeRelationCardDTO,
  CharacterCard as CharacterCardDTO,
  PlatformLink,
  RelationType,
} from "@miru/types";

interface AnimeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AnimeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const anime = await fetchAnimeDetail(slug).catch(() => null);
  if (!anime) return { title: "Anime introuvable" };
  const description = anime.synopsis
    ? anime.synopsis.replace(/<[^>]+>/g, "").slice(0, 180)
    : undefined;
  const images = anime.coverUrl ? [anime.coverUrl] : undefined;
  return {
    title: anime.title,
    description,
    openGraph: {
      title: `${anime.title} — Miru`,
      description,
      images,
      type: "video.tv_show",
    },
    twitter: {
      card: "summary_large_image",
      title: `${anime.title} — Miru`,
      description,
      images,
    },
  };
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { slug } = await params;
  const accent = await fetchAnimeAccent(slug);
  if (!accent) notFound();

  const hex = accent.accentHex ?? "#c8a2ff";
  const accentStyle = {
    "--accent-override": hex,
    "--color-accent": hex,
    "--color-accent-muted": `color-mix(in srgb, ${hex} 14%, transparent)`,
    "--color-accent-subtle": `color-mix(in srgb, ${hex} 6%, transparent)`,
  } as CSSProperties;

  return (
    <div style={accentStyle}>
      <Suspense fallback={<DetailSkeleton title={accent.title} />}>
        <AnimeDetailContent slug={slug} />
      </Suspense>
    </div>
  );
}

async function AnimeDetailContent({ slug }: { slug: string }) {
  const [anime, session] = await Promise.all([fetchAnimeDetail(slug), getServerSession()]);
  if (!anime) notFound();

  const [watchlist, reviews, watchedEpisodes] = await Promise.all([
    session ? fetchUserWatchlist() : Promise.resolve([]),
    fetchAnimeReviews(anime.id),
    session ? fetchWatchedEpisodes(anime.id) : Promise.resolve([]),
  ]);
  const existingEntry = watchlist.find((item) => item.animeId === anime.id) ?? null;
  const watchedEpisodeIds = watchedEpisodes.map((e) => e.episodeId);

  const seasons = buildSeasonList(anime);

  // Movies and zero-episode finished anime don't have an episode list — hide
  // the section entirely instead of showing "Aucun épisode" filler.
  const isMovie = anime.format === "MOVIE";
  const showEpisodes =
    !isMovie && (anime.episodes.length > 0 || anime.status === "AIRING");

  return (
    <>
      <HeaderDetailBridge
        title={anime.title}
        rating={anime.averageRating}
        coverUrl={anime.coverUrl}
        accentHex={anime.accentHex}
      />
    <AnimeDetailTemplate
      accentHex={anime.accentHex}
      back={
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          ← Catalogue
        </Link>
      }
      hero={
        <AnimeHero
          title={anime.title}
          titleJp={anime.titleJp}
          coverUrl={anime.coverUrl}
          bannerUrl={anime.bannerUrl}
          rating={anime.averageRating}
          year={anime.year}
          format={anime.format}
          status={anime.status}
          studioName={anime.studioName}
          reviewCount={reviews.length}
        />
      }
      seasonSwitcher={seasons.length > 1 ? <SeasonSwitcher seasons={seasons} /> : undefined}
      actionBar={
        <div className="mt-6 flex flex-wrap items-start gap-3 px-5">
          <div className="min-w-0 flex-1">
            <WatchlistButton
              animeId={anime.id}
              episodeCount={anime.episodeCount}
              initialEntry={existingEntry}
              isAuthenticated={session !== null}
            />
          </div>
          <AddToListButton animeId={anime.id} isAuthenticated={session !== null} />
        </div>
      }
      platforms={
        anime.platforms.length > 0 ? <PlatformsSection platforms={anime.platforms} /> : undefined
      }
      episodes={showEpisodes ? (
        <EpisodesTracker
          episodes={anime.episodes}
          animeTitle={anime.title}
          initialWatchedIds={watchedEpisodeIds}
          isAuthenticated={session !== null}
        />
      ) : undefined}
      episodesCount={showEpisodes && anime.episodes.length > 0 ? anime.episodes.length : null}
      synopsis={<SynopsisSection anime={anime} />}
      characters={
        anime.characters.length > 0 ? (
          <CharactersSection characters={anime.characters} />
        ) : undefined
      }
      charactersCount={anime.characters.length > 0 ? anime.characters.length : null}
      relations={
        anime.relations.length > 0 ? <RelationsSection relations={anime.relations} /> : undefined
      }
      relationsCount={anime.relations.length > 0 ? anime.relations.length : null}
      reviews={
        <ReviewSection
          animeId={anime.id}
          reviews={reviews}
          currentUserId={session?.user.id ?? null}
        />
      }
      reviewsCount={reviews.length > 0 ? reviews.length : null}
    />
    </>
  );
}

function DetailSkeleton({ title }: { title: string }) {
  return (
    <main className="pb-24">
      <div className="px-5 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          ← Catalogue
        </Link>
      </div>
      <div className="relative h-hero-banner-h w-full bg-bg-elevated" />
      <div className="relative -mt-hero-overlap flex gap-5 px-5">
        <Skeleton className="h-cover-h w-cover-w shrink-0 rounded-lg border-2 border-border" />
        <div className="flex min-w-0 flex-1 flex-col justify-end gap-2 pb-1">
          <Skeleton className="h-3 w-60" />
          <h1 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-text-primary">
            {title}
          </h1>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-1 h-6 w-20" />
        </div>
      </div>
      <div className="mt-10 px-5">
        <Skeleton className="h-4 w-24" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}

function buildSeasonList(anime: AnimeDetail): SeasonItem[] {
  const related = anime.relations.filter(
    (r) => r.relationType === "PREQUEL" || r.relationType === "SEQUEL",
  );
  if (related.length === 0) return [];

  const items: Array<SeasonItem & { year: number | null }> = [
    {
      label: shortSeasonLabel(anime.title, anime.year),
      slug: anime.slug,
      current: true,
      year: anime.year,
    },
    ...related.map((r) => ({
      label: shortSeasonLabel(r.title, r.year),
      slug: r.slug,
      current: false,
      year: r.year,
    })),
  ];

  items.sort((a, b) => {
    if (a.year == null) return 1;
    if (b.year == null) return -1;
    return a.year - b.year;
  });

  return items.map(({ year: _year, ...rest }) => rest);
}

function shortSeasonLabel(title: string, year: number | null): string {
  const match = title.match(/season\s+(\d+)/i) ?? title.match(/\bs(\d+)\b/i);
  if (match) return `S${match[1]}`;
  if (/part\s+2/i.test(title)) return "Part 2";
  if (/final/i.test(title)) return "Final";
  return year?.toString() ?? title.slice(0, 16);
}

const RELATION_ORDER: RelationType[] = ["PREQUEL", "SEQUEL", "SIDE_STORY", "SPIN_OFF"];
const RELATION_GROUP_LABEL: Record<RelationType, string> = {
  PREQUEL: "Préquelle",
  SEQUEL: "Suite",
  SIDE_STORY: "Histoires annexes",
  SPIN_OFF: "Spin-offs",
};

function RelationsSection({ relations }: { relations: AnimeRelationCardDTO[] }) {
  const grouped = new Map<RelationType, AnimeRelationCardDTO[]>();
  for (const r of relations) {
    const list = grouped.get(r.relationType) ?? [];
    list.push(r);
    grouped.set(r.relationType, list);
  }

  return (
    <div className="flex flex-col gap-6 px-5">
      {RELATION_ORDER.filter((type) => grouped.has(type)).map((type) => (
        <div key={type} className="flex flex-col gap-2.5">
          <h3 className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
            {RELATION_GROUP_LABEL[type]}
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {grouped.get(type)!.map((r, idx) => (
              <RelationCard
                key={`${type}-${idx}`}
                relationType={r.relationType}
                title={r.title}
                coverUrl={r.coverUrl}
                format={r.format}
                year={r.year}
                slug={r.slug}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SynopsisSection({ anime }: { anime: AnimeDetail }) {
  const studioSlug = anime.studioName ? slugifyStudio(anime.studioName) : null;
  const studioCell: React.ReactNode = anime.studioName
    ? studioSlug
      ? (
          <Link
            href={`/studios/${studioSlug}`}
            className="text-text-primary underline-offset-2 hover:underline"
          >
            {anime.studioName}
          </Link>
        )
      : anime.studioName
    : "—";

  const infoRows: Array<[string, React.ReactNode]> = [
    ["Format", anime.format],
    ["Statut", anime.status],
    ["Année", anime.year?.toString() ?? "—"],
    ["Épisodes", anime.episodeCount != null ? anime.episodeCount.toString() : "—"],
    ["Studio", studioCell],
    ["Titre EN", anime.titleEn ?? "—"],
  ];

  return (
    <div className="flex flex-col gap-5 px-5">
      {anime.synopsis ? (
        <p className="max-w-180 whitespace-pre-line font-body text-sm leading-relaxed text-text-secondary">
          {anime.synopsis}
        </p>
      ) : (
        <p className="font-body text-sm text-text-tertiary">Pas de synopsis disponible.</p>
      )}

      {anime.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {anime.genres.map((g) => (
            <span
              key={g}
              className="rounded-md border border-border bg-bg-elevated px-2.5 py-1 font-body text-[11px] capitalize text-text-secondary"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 font-body text-xs">
        {infoRows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-text-tertiary">{label}</dt>
            <dd className="text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CharactersSection({ characters }: { characters: CharacterCardDTO[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
      {characters.map((c) => (
        <Link
          key={c.id}
          href={`/characters/${c.id}`}
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <CharacterCard
            name={c.name}
            nameJp={c.nameJp}
            imageUrl={c.imageUrl}
            role={c.role}
            voiceActor={c.voiceActor}
          />
        </Link>
      ))}
    </div>
  );
}

function PlatformsSection({ platforms }: { platforms: PlatformLink[] }) {
  return (
    <div className="flex flex-wrap gap-2 px-5">
      {platforms.map((p) => (
        <PlatformBadge
          key={p.slug}
          name={p.name}
          url={p.url}
          iconUrl={p.iconUrl}
          color={p.color}
        />
      ))}
    </div>
  );
}

/**
 * Lowercase, accent-stripped, hyphenated slug for studio names. Kept local
 * (and minimal) because we don't ship studioSlug from the API yet — when
 * the API exposes it, drop this and use the field directly.
 */
function slugifyStudio(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
