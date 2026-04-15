import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AnimeDetailTemplate, AnimeHero, CharacterCard, EpisodeRow } from "@miru/ui";
import { fetchAnimeCharacters, fetchAnimeDetail } from "@/lib/api";
import type { CharacterCard as CharacterCardDTO } from "@miru/types";

interface AnimeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AnimeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const anime = await fetchAnimeDetail(slug).catch(() => null);
  if (!anime) return { title: "Anime introuvable — Miru" };
  const description = anime.synopsis
    ? anime.synopsis.replace(/<[^>]+>/g, "").slice(0, 180)
    : undefined;
  return {
    title: `${anime.title} — Miru`,
    description,
  };
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { slug } = await params;
  const [anime, characters] = await Promise.all([
    fetchAnimeDetail(slug),
    fetchAnimeCharacters(slug),
  ]);
  if (!anime) notFound();

  return (
    <AnimeDetailTemplate
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
        />
      }
      synopsis={
        anime.synopsis ? (
          <p className="whitespace-pre-line">{anime.synopsis}</p>
        ) : (
          <p className="text-text-tertiary">Pas de synopsis disponible.</p>
        )
      }
      info={<AnimeInfoList anime={anime} />}
      characters={
        characters.length > 0 ? (
          <CharactersSection characters={characters} />
        ) : undefined
      }
      episodes={<EpisodesSection episodes={anime.episodes} />}
    />
  );
}

function AnimeInfoList({
  anime,
}: {
  anime: Awaited<ReturnType<typeof fetchAnimeDetail>> & {};
}) {
  if (!anime) return null;
  const rows: Array<[string, string | null]> = [
    ["Format", anime.format],
    ["Statut", anime.status],
    ["Année", anime.year?.toString() ?? null],
    ["Studio", anime.studioName],
    [
      "Épisodes",
      anime.episodeCount != null ? anime.episodeCount.toString() : null,
    ],
    ["Titre EN", anime.titleEn],
    ["Genres", anime.genres.length > 0 ? anime.genres.join(", ") : null],
  ];

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-mono text-xs">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="uppercase tracking-wide text-text-tertiary">{label}</dt>
          <dd className="text-text-secondary">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function CharactersSection({
  characters,
}: {
  characters: CharacterCardDTO[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {characters.map((c) => (
        <CharacterCard
          key={c.id}
          name={c.name}
          nameJp={c.nameJp}
          imageUrl={c.imageUrl}
          role={c.role}
          voiceActor={c.voiceActor}
        />
      ))}
    </div>
  );
}

function EpisodesSection({
  episodes,
}: {
  episodes: NonNullable<Awaited<ReturnType<typeof fetchAnimeDetail>>>["episodes"];
}) {
  if (episodes.length === 0) {
    return (
      <div className="rounded-md border border-border-subtle bg-bg-surface p-6 text-center font-body text-sm text-text-tertiary">
        Aucun épisode enregistré pour cet anime.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {episodes.map((ep) => (
        <EpisodeRow
          key={ep.id}
          number={ep.number}
          title={ep.title}
          duration={ep.duration}
          airedAt={ep.airedAt}
          thumbnail={ep.thumbnail}
          url={ep.url}
        />
      ))}
    </div>
  );
}
