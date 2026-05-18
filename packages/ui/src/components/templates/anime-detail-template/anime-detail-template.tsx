import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { SectionHeader } from "../../molecules/section-header";

interface AnimeDetailTemplateProps {
  accentHex?: string | null;
  stickyHeader?: ReactNode;
  hero: ReactNode;
  seasonSwitcher?: ReactNode;
  actionBar?: ReactNode;
  synopsis: ReactNode;
  episodes: ReactNode;
  episodesCount?: number | null;
  characters?: ReactNode;
  charactersCount?: number | null;
  relations?: ReactNode;
  relationsCount?: number | null;
  platforms?: ReactNode;
  reviews?: ReactNode;
  reviewsCount?: number | null;
  back?: ReactNode;
  className?: string;
}

export function AnimeDetailTemplate({
  accentHex,
  stickyHeader,
  hero,
  seasonSwitcher,
  actionBar,
  synopsis,
  episodes,
  episodesCount,
  characters,
  charactersCount,
  relations,
  relationsCount,
  platforms,
  reviews,
  reviewsCount,
  back,
  className,
}: AnimeDetailTemplateProps) {
  const hex = accentHex ?? "#c8a2ff";
  const accentStyle = {
    "--accent-override": hex,
    "--color-accent": hex,
    "--color-accent-muted": `color-mix(in srgb, ${hex} 14%, transparent)`,
    "--color-accent-subtle": `color-mix(in srgb, ${hex} 6%, transparent)`,
  } as CSSProperties;
  return (
    <div style={accentStyle}>
      {stickyHeader}
      <main className={cn("pb-24", className)}>
        {back && <div className="px-5 pt-4">{back}</div>}

        {hero}

        {seasonSwitcher}

        {actionBar}

        {platforms && (
          <section className="mt-10 md:mt-14">
            <SectionHeader label="Regarder sur" />
            {platforms}
          </section>
        )}

        <section className="mt-10 md:mt-14">
          <SectionHeader label="Épisodes" count={episodesCount ?? null} />
          {episodes}
        </section>

        <section className="mt-10 md:mt-14">
          <SectionHeader label="Synopsis" />
          {synopsis}
        </section>

        {characters && (
          <section className="mt-10 md:mt-14">
            <SectionHeader label="Personnages" count={charactersCount ?? null} />
            {characters}
          </section>
        )}

        {relations && (
          <section className="mt-10 md:mt-14">
            <SectionHeader label="Autres saisons" count={relationsCount ?? null} />
            {relations}
          </section>
        )}

        {reviews && (
          <section className="mt-10 md:mt-14">
            <SectionHeader label="Avis" count={reviewsCount ?? null} />
            {reviews}
          </section>
        )}
      </main>
    </div>
  );
}
